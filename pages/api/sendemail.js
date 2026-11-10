import { OpenAI } from "openai";
import { OpenAIToolSet } from "composio-core";
import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  const openai_client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const composio_toolset = new OpenAIToolSet({
    apiKey: process.env.COMPOSIO_API_KEY,
  });
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { instruction } = req.body;

    if (!instruction) {
      return res.status(400).json({ error: "Instruction is required" });
    }

    const tools = await composio_toolset.getTools({
      actions: ["GMAIL_SEND_EMAIL"],
    });

    const response = await openai_client.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [{ role: "user", content: instruction }],
      tools: tools,
      tool_choice: "auto",
    });

    const tool_response = await composio_toolset.handleToolCall(response);

    // Save response to data.json
    const dataPath = path.join(process.cwd(), "data.json");
    let existingData = { emailResponses: [] };

    try {
      if (fs.existsSync(dataPath)) {
        const fileContent = fs.readFileSync(dataPath, "utf8");
        existingData = JSON.parse(fileContent);
      }
    } catch (error) {
      console.error("Error reading existing data:", error);
    }

    // Parse the response data before storing
    const parsedResponse = JSON.parse(tool_response[0]);
    existingData.emailResponses.push(parsedResponse);
    fs.writeFileSync(dataPath, JSON.stringify(existingData, null, 2));

    return res.status(200).json({ result: tool_response });
  } catch (error) {
    console.log("Error sending email:", error);
    return res.status(500).json({ error: "Failed to send email" });
  }
}
