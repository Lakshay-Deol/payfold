import { sendEmail } from "../../utils/email-provider";
import { getAiClient } from "../../utils/ai-provider";
import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { instruction, to, subject, content } = req.body;

    let targetTo = to;
    let targetSubject = subject || "PayFold Notification";
    let targetContent = content;

    // If an instruction is provided instead of explicit content, use AI to generate it
    if (instruction && !targetContent) {
      const { client, model } = getAiClient();
      if (client) {
        const response = await client.chat.completions.create({
          model: model,
          messages: [{ role: "user", content: instruction }],
        });
        targetContent = response.choices[0].message.content;
      } else {
        targetContent = instruction;
      }
    }

    if (!targetTo) {
      targetTo = "winner@example.com";
    }

    const delivery = await sendEmail({
      to: targetTo,
      subject: targetSubject,
      content: targetContent,
    });

    // Store in data.json
    const dataPath = path.join(process.cwd(), "data.json");
    let existingData = { emailResponses: [] };
    try {
      if (fs.existsSync(dataPath)) {
        existingData = JSON.parse(fs.readFileSync(dataPath, "utf8"));
      }
    } catch (e) {}

    if (!Array.isArray(existingData.emailResponses)) {
      existingData.emailResponses = [];
    }

    existingData.emailResponses.push({
      date: new Date().toISOString(),
      to: targetTo,
      subject: targetSubject,
      delivery,
    });

    fs.writeFileSync(dataPath, JSON.stringify(existingData, null, 2));

    return res.status(200).json({ status: "success", delivery });
  } catch (error) {
    console.error("Error in sendemail handler:", error);
    return res.status(500).json({ error: error.message || "Failed to send email" });
  }
}
