import { OpenAI } from "openai";

export function getAiClient() {
  const geminiKey = process.env.GEMINI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  if (geminiKey) {
    return {
      client: new OpenAI({
        apiKey: geminiKey,
        baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
      }),
      model: "gemini-1.5-flash",
      provider: "gemini",
    };
  }

  if (openaiKey) {
    return {
      client: new OpenAI({
        apiKey: openaiKey,
      }),
      model: "gpt-4-turbo",
      provider: "openai",
    };
  }

  return {
    client: null,
    model: null,
    provider: "none",
  };
}

export async function generateCongratulatoryEmail({
  hackathon,
  name,
  email,
  prize,
  place,
  track,
}) {
  const { client, model, provider } = getAiClient();

  if (!client) {
    // Deterministic fallback template if no AI key configured
    return {
      subject: `Congratulations on winning ${prize} ETH in ${hackathon}!`,
      content: `Hello ${name},\n\nCongratulations on securing ${place}${
        track ? ` in the ${track} track` : ""
      } at ${hackathon}!\n\nYou have won ${prize} ETH. To receive your prize directly to your wallet via our autonomous payout protocol, please reply to this email with your EVM/Aurora wallet address (0x...).\n\nBest regards,\n${hackathon} Organizing Team`,
    };
  }

  try {
    const prompt = `Write a warm, professional congratulatory email to hackathon winner ${name} (${email}) for winning ${prize} in ${hackathon}.
They placed ${place}${track ? ` in the ${track} track` : ""}.
Instruct them to reply to this email with their EVM/Aurora wallet address (0x...) so their prize can be distributed autonomously on-chain.
Return JSON with format: {"subject": "...", "body": "..."}`;

    const response = await client.chat.completions.create({
      model: model,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const parsed = JSON.parse(response.choices[0].message.content);
    return {
      subject: parsed.subject || `Congratulations on winning ${prize} in ${hackathon}!`,
      content: parsed.body || parsed.content || "",
    };
  } catch (err) {
    console.warn("AI generation failed, using fallback template:", err.message);
    return {
      subject: `Congratulations on winning ${prize} in ${hackathon}!`,
      content: `Hi ${name},\n\nCongratulations on winning ${place} in ${hackathon}! Please reply with your wallet address to receive ${prize}.\n\nBest,\n${hackathon} Team`,
    };
  }
}

export async function extractWalletAddressFromText(text) {
  // Always run fast regex first
  const ethRegex = /0x[a-fA-F0-9]{40}/;
  const match = text.match(ethRegex);
  if (match) {
    return match[0];
  }

  const { client, model } = getAiClient();
  if (!client) return "";

  try {
    const response = await client.chat.completions.create({
      model: model,
      messages: [
        {
          role: "system",
          content:
            "You are an assistant that extracts EVM wallet addresses from email text. Respond only with JSON: {\"walletAddress\": \"0x...\"} or {\"walletAddress\": \"\"} if none found.",
        },
        { role: "user", content: text },
      ],
      response_format: { type: "json_object" },
    });

    const parsed = JSON.parse(response.choices[0].message.content);
    return parsed.walletAddress || "";
  } catch (e) {
    console.error("Error extracting wallet address via AI:", e.message);
    return "";
  }
}

