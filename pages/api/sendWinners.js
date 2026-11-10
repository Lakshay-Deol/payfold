import fs from "fs";
import path from "path";
import { Evm } from "../../utils/ethereum";
import { generateCongratulatoryEmail } from "../../utils/ai-provider";
import { sendEmail } from "../../utils/email-provider";

const contractId = process.env.NEXT_PUBLIC_contractId;

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
    console.log("Received winners payload for hackathon:", payload.Hackathon);

    const dataPath = path.join(process.cwd(), "data.json");
    let existingData = {
      hackathons: [],
      emailResponses: [],
    };

    try {
      if (fs.existsSync(dataPath)) {
        const fileContent = fs.readFileSync(dataPath, "utf8");
        existingData = JSON.parse(fileContent);
      }
    } catch (error) {
      console.log("Creating new data.json structure");
    }

    if (!Array.isArray(existingData.hackathons)) {
      existingData.hackathons = [];
    }

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

    // Derive deterministic hackathon escrow address from NEAR MPC contract
    try {
      const { address: hackathonAddress } = await Evm.deriveAddressAndPublicKey(
        contractId,
        payload.Hackathon
      );
      hackathon.hackathonAddress = hackathonAddress;
    } catch (err) {
      console.warn("MPC address derivation warning (using fallback):", err.message);
      if (!hackathon.hackathonAddress) {
        hackathon.hackathonAddress = "0xFcAaf9F83875C2c4fEF050af893e90061254c660";
      }
    }

    const emailResults = [];

    // Process each winner
    for (const winner of payload.Winners) {
      const winnerId = getNextId(hackathon.winners);
      const winnerData = {
        id: winnerId,
        ...winner,
        addedAt: new Date().toISOString(),
        emailStatus: null,
        emailResponse: null,
      };

      // 1. Generate email via Gemini (or OpenAI / template)
      const emailDraft = await generateCongratulatoryEmail({
        hackathon: payload.Hackathon,
        name: winner.Name,
        email: winner.email,
        prize: winner.prize,
        place: winner.place,
        track: winner.track,
      });

      // 2. Deliver email via Resend (or Composio / simulation)
      const delivery = await sendEmail({
        to: winner.email,
        subject: emailDraft.subject,
        content: emailDraft.content,
      });

      if (delivery.success) {
        winnerData.emailStatus = "success";
        winnerData.emailResponse = delivery;
        emailResults.push({
          email: winner.email,
          status: "success",
          provider: delivery.provider,
          id: delivery.id,
        });
      } else {
        winnerData.emailStatus = "error";
        winnerData.emailError = delivery.error;
        emailResults.push({
          email: winner.email,
          status: "error",
          error: delivery.error,
        });
      }

      hackathon.winners.push(winnerData);
    }

    hackathon.lastUpdated = new Date().toISOString();
    fs.writeFileSync(dataPath, JSON.stringify(existingData, null, 2));

    return res.status(200).json({
      status: "success",
      message: "Winners stored and emails dispatched",
      hackathon: payload.Hackathon,
      winnersCount: payload.Winners.length,
      emailResults,
      hackathonAddress: hackathon.hackathonAddress,
    });
  } catch (error) {
    console.error("Error processing winners:", error);
    return res
      .status(500)
      .json({ status: "error", message: error.message || "Internal server error" });
  }
}
