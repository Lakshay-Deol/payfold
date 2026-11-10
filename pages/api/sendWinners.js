import fs from "fs";
import path from "path";
import { OpenAI } from "openai";
import { OpenAIToolSet } from "composio-core";
import { Evm } from "../../utils/ethereum";

const contractId = process.env.NEXT_PUBLIC_contractId;

// Helper function to generate next ID
function getNextId(items) {
  if (!items || items.length === 0) return 0;
  return Math.max(...items.map((item) => item.id)) + 1;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ status: "error", message: "Method not allowed" });
  }

  try {
    const payload = req.body;
    console.log("Received winners payload:");
    console.log(JSON.stringify(payload, null, 2));

    // Read existing data
    const dataPath = path.join(process.cwd(), "data.json");
    let existingData = {
      hackathons: [],
      emailResponses: [],
    };

    try {
      const fileContent = fs.readFileSync(dataPath, "utf8");
      existingData = JSON.parse(fileContent);
    } catch (error) {
      console.log(
        "No existing data file or error reading it, creating new one"
      );
    }

    // Find existing hackathon or create new one
    let hackathon = existingData.hackathons.find(
      (h) => h.name === payload.Hackathon
    );

    if (!hackathon) {
      const hackathonId = getNextId(existingData.hackathons);
      hackathon = {
        id: hackathonId,
        name: payload.Hackathon,
        winners: [],
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      };
      existingData.hackathons.push(hackathon);
    }

    const { address: hackathonAddress } = await Evm.deriveAddressAndPublicKey(
      contractId,
      payload.Hackathon
    );

    hackathon.hackathonAddress = hackathonAddress;

    // Process each winner
    const emailResults = [];
    const openai_client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const composio_toolset = new OpenAIToolSet({
      apiKey: process.env.COMPOSIO_API_KEY,
    });

    const tools = await composio_toolset.getTools({
      actions: ["GMAIL_SEND_EMAIL"],
    });

    // Send email to each winner and store their data
    for (const winner of payload.Winners) {
      const winnerId = getNextId(hackathon.winners);
      const winnerData = {
        id: winnerId,
        ...winner,
        addedAt: new Date().toISOString(),
        emailStatus: null,
        emailResponse: null,
      };

      const emailInstruction = `Write and send a congratulatory email to ${
        winner.email
      } for winning ${winner.prize} in the ${payload.Hackathon}. 
        The winner's name is ${winner.Name} and they secured ${
        winner.place
      } place${winner.track ? ` in the ${winner.track} track` : ""}.
        Make the email personal, enthusiastic, and professional. Include:
        - A warm congratulatory message
        - Mention their achievement and prize
        - Acknowledge their specific placement and track (if applicable)
        - Mention that we'll contact them about prize details
        - Keep it concise but impactful
        - End with a professional sign-off from the hackathon team`;

      try {
        const response = await openai_client.chat.completions.create({
          model: "gpt-4-turbo",
          messages: [{ role: "user", content: emailInstruction }],
          tools: tools,
          tool_choice: "auto",
        });

        const tool_response = await composio_toolset.handleToolCall(response);
        const parsedResponse = JSON.parse(tool_response[0]);

        // Update winner data with email status
        winnerData.emailStatus = "success";
        winnerData.emailResponse = parsedResponse;

        // Add to email responses
        existingData.emailResponses.push(parsedResponse);

        emailResults.push({
          email: winner.email,
          status: "success",
          response: parsedResponse,
        });
      } catch (error) {
        console.error(`Error sending email to ${winner.email}:`, error);
        winnerData.emailStatus = "error";
        winnerData.emailError = error.message;

        emailResults.push({
          email: winner.email,
          status: "error",
          error: error.message,
        });
      }

      // Add winner to hackathon winners list
      hackathon.winners.push(winnerData);
    }

    // Update last updated timestamp
    hackathon.lastUpdated = new Date().toISOString();

    // Save updated data
    fs.writeFileSync(dataPath, JSON.stringify(existingData, null, 2));

    return res.status(200).json({
      status: "success",
      message: "Winners data stored and emails sent",
      hackathon: payload.Hackathon,
      winnersCount: payload.Winners.length,
      emailResults,
      hackathonAddress: hackathon.hackathonAddress,
    });
  } catch (error) {
    console.error("Error processing winners data:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
}
