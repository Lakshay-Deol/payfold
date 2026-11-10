import { Resend } from "resend";

export async function sendEmail({ to, subject, content }) {
  const resendKey = process.env.RESEND_API_KEY;
  const composioKey = process.env.COMPOSIO_API_KEY;

  // 1. Resend Provider (Free & Fast)
  if (resendKey) {
    try {
      const resend = new Resend(resendKey);
      const fromEmail = process.env.RESEND_FROM_EMAIL || "PayFold <onboarding@resend.dev>";
      
      const response = await resend.emails.send({
        from: fromEmail,
        to: Array.isArray(to) ? to : [to],
        subject: subject,
        text: content,
        html: `<div style="font-family: sans-serif; line-height: 1.6; color: #222;">
          <h2 style="color: #00875a;">PayFold Autonomous Prize Payout</h2>
          <div style="white-space: pre-wrap;">${content}</div>
          <hr style="margin-top: 2rem; border: none; border-top: 1px solid #eee;" />
          <p style="font-size: 0.85rem; color: #777;">Sent autonomously via PayFold &bull; Powered by NEAR Protocol</p>
        </div>`,
      });

      if (response.error) {
        throw new Error(response.error.message || "Resend API error");
      }

      return {
        success: true,
        provider: "resend",
        id: response.data?.id,
        response: response.data,
      };
    } catch (err) {
      console.error("Resend delivery failed:", err.message);
      return { success: false, provider: "resend", error: err.message };
    }
  }

  // 2. Composio Provider (Gmail Agent)
  if (composioKey) {
    try {
      const { OpenAIToolSet } = await import("composio-core");
      const { OpenAI } = await import("openai");
      const composio_toolset = new OpenAIToolSet({ apiKey: composioKey });
      const openai_client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      
      const tools = await composio_toolset.getTools({ actions: ["GMAIL_SEND_EMAIL"] });
      const instruction = `Send an email to ${to} with Subject: "${subject}". Content: ${content}`;
      
      const response = await openai_client.chat.completions.create({
        model: "gpt-4-turbo",
        messages: [{ role: "user", content: instruction }],
        tools: tools,
        tool_choice: "auto",
      });

      const tool_response = await composio_toolset.handleToolCall(response);
      return {
        success: true,
        provider: "composio",
        response: tool_response,
      };
    } catch (err) {
      console.error("Composio delivery failed:", err.message);
      return { success: false, provider: "composio", error: err.message };
    }
  }

  // 3. Fallback simulation mode
  console.log(`[SIMULATED EMAIL] To: ${to} | Subject: ${subject}`);
  return {
    success: true,
    provider: "simulated",
    id: "sim_" + Date.now(),
    note: "No RESEND_API_KEY or COMPOSIO_API_KEY configured. Email was simulated.",
  };
}

