import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { VIDEO_CONFIG } from "../config/videoConfig";

interface EmailMockupProps {
  showReply?: boolean;
}

export const EmailMockup: React.FC<EmailMockupProps> = ({ showReply = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame,
    fps,
    config: { damping: 16, stiffness: 110 },
  });

  const cardScale = interpolate(entrance, [0, 1], [0.94, 1]);
  const cardOpacity = interpolate(entrance, [0, 1], [0, 1]);

  // Typing effect simulation
  const textChars = Math.min(220, Math.floor(frame * 6.5));
  const fullText = "Hello Lakshay,\n\nCongratulations on securing 1st Place in the Agent Economy track at NEAR Hackathon 2026! You have won 0.5 ETH.\n\nPlease reply with your EVM/Aurora wallet address (0x...) to receive your autonomous prize payout.";
  const displayedText = fullText.slice(0, textChars);

  return (
    <div
      style={{
        width: "1120px",
        height: "640px",
        borderRadius: "20px",
        background: "rgba(16, 18, 27, 0.92)",
        border: "1px solid rgba(255, 255, 255, 0.12)",
        boxShadow: "0 30px 80px rgba(0, 0, 0, 0.7), 0 0 50px rgba(139, 92, 246, 0.2)",
        backdropFilter: "blur(24px)",
        transform: `scale(${cardScale})`,
        opacity: cardOpacity,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Email Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "18px 28px",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          background: "rgba(8, 9, 13, 0.7)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#E51E2B", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800 }}>
            P
          </div>
          <div>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: "15px" }}>PayFold Autonomous Outreach</div>
            <div style={{ color: "#9295A5", fontSize: "12px" }}>To: lakshayld26@gmail.com</div>
          </div>
        </div>

        {/* AI & Delivery Integration Badges */}
        <div style={{ display: "flex", gap: "10px" }}>
          <div
            style={{
              padding: "5px 12px",
              borderRadius: "14px",
              background: "rgba(59, 130, 246, 0.15)",
              border: "1px solid rgba(59, 130, 246, 0.35)",
              color: "#60A5FA",
              fontSize: "12px",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#60A5FA" }} />
            Google Gemini 2.5 Flash
          </div>

          <div
            style={{
              padding: "5px 12px",
              borderRadius: "14px",
              background: "rgba(55, 217, 155, 0.15)",
              border: "1px solid rgba(55, 217, 155, 0.35)",
              color: "#37D99B",
              fontSize: "12px",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#37D99B" }} />
            Resend API &bull; Delivered
          </div>
        </div>
      </div>

      {/* Email Body */}
      <div style={{ padding: "32px", display: "flex", flexDirection: "column", gap: "20px", flex: 1 }}>
        <div style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.06)", paddingBottom: "14px" }}>
          <span style={{ fontSize: "12px", color: "#9295A5" }}>Subject:</span>
          <h3 style={{ margin: "4px 0 0", color: "#F5F5F7", fontSize: "20px", fontWeight: 700 }}>
            Congratulations on winning 0.5 ETH in NEAR Hackathon 2026!
          </h3>
        </div>

        <div
          style={{
            fontSize: "17px",
            lineHeight: 1.6,
            color: "#D1D5DB",
            whiteSpace: "pre-wrap",
            fontFamily: "'Inter', sans-serif",
            flex: 1,
          }}
        >
          {displayedText}
          {textChars < fullText.length && (
            <span style={{ display: "inline-block", width: "2px", height: "18px", background: "#E51E2B", marginLeft: "2px", verticalAlign: "middle" }} />
          )}
        </div>

        {/* Footer Guarantee */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "14px 20px",
            background: "rgba(255, 255, 255, 0.02)",
            borderRadius: "12px",
            border: "1px solid rgba(255, 255, 255, 0.05)",
          }}
        >
          <span style={{ fontSize: "13px", color: "#9295A5" }}>
            Generated deterministically &bull; Verified recipient routing
          </span>
          <span style={{ fontSize: "13px", color: "#E8B45A", fontWeight: 600 }}>
            0 Manual Organizer Effort Required
          </span>
        </div>
      </div>
    </div>
  );
};
