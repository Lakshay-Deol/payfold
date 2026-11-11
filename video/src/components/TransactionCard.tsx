import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { VIDEO_CONFIG } from "../config/videoConfig";

export const TransactionCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 120 },
  });

  const cardScale = interpolate(entrance, [0, 1], [0.92, 1]);
  const cardOpacity = interpolate(entrance, [0, 1], [0, 1]);

  return (
    <div
      style={{
        width: "920px",
        borderRadius: "24px",
        background: "rgba(16, 18, 27, 0.95)",
        border: "1px solid rgba(55, 217, 155, 0.4)",
        boxShadow: "0 30px 80px rgba(55, 217, 155, 0.18), 0 0 60px rgba(139, 92, 246, 0.15)",
        backdropFilter: "blur(24px)",
        transform: `scale(${cardScale})`,
        opacity: cardOpacity,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, rgba(55, 217, 155, 0.15) 0%, rgba(139, 92, 246, 0.1) 100%)",
          padding: "28px 36px",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #37D99B 0%, #10B981 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#08090D",
              boxShadow: "0 0 25px rgba(55, 217, 155, 0.6)",
            }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M5 13L9 17L19 7" stroke="#08090D" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <h2 style={{ margin: 0, color: "#fff", fontSize: "24px", fontWeight: 800, letterSpacing: "-0.02em" }}>
              PAYMENT SUCCESSFUL
            </h2>
            <span style={{ fontSize: "14px", color: "#37D99B", fontWeight: 600 }}>
              On-chain settlement executed autonomously via NEAR MPC
            </span>
          </div>
        </div>

        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "36px", fontWeight: 900, color: "#E8B45A", letterSpacing: "-0.03em" }}>
            0.5 ETH
          </div>
          <span style={{ fontSize: "12px", color: "#9295A5" }}>Aurora EVM Testnet</span>
        </div>
      </div>

      {/* Details Table */}
      <div style={{ padding: "32px 36px", display: "flex", flexDirection: "column", gap: "16px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div style={{ padding: "14px 18px", borderRadius: "12px", background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.05)" }}>
            <span style={{ fontSize: "12px", color: "#9295A5", display: "block" }}>Recipient Winner</span>
            <span style={{ fontSize: "16px", color: "#fff", fontWeight: 700 }}>Lakshay (1st Place)</span>
          </div>

          <div style={{ padding: "14px 18px", borderRadius: "12px", background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.05)" }}>
            <span style={{ fontSize: "12px", color: "#9295A5", display: "block" }}>NEAR MPC Signer Account</span>
            <span style={{ fontSize: "14px", fontFamily: "monospace", color: "#A78BFA", fontWeight: 600 }}>
              lakshay-payfold.testnet
            </span>
          </div>
        </div>

        <div style={{ padding: "14px 18px", borderRadius: "12px", background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.05)" }}>
          <span style={{ fontSize: "12px", color: "#9295A5", display: "block" }}>Extracted EVM Wallet</span>
          <span style={{ fontSize: "15px", fontFamily: "monospace", color: "#37D99B", fontWeight: 600 }}>
            0x71C8452f483FEfA834165dC65f57B8b71569B148
          </span>
        </div>

        <div style={{ padding: "14px 18px", borderRadius: "12px", background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.05)" }}>
          <span style={{ fontSize: "12px", color: "#9295A5", display: "block" }}>Aurora Testnet Explorer Receipt</span>
          <span style={{ fontSize: "13px", fontFamily: "monospace", color: "#60A5FA", wordBreak: "break-all" }}>
            https://explorer.testnet.aurora.dev/tx/0x4a9d72e61284fae39b78119857d42cf23cb7a8b3e10f81d9f456c802194a5e31
          </span>
        </div>
      </div>

      {/* Bottom Summary Bar */}
      <div
        style={{
          background: "rgba(8, 9, 13, 0.6)",
          padding: "16px 36px",
          borderTop: "1px solid rgba(255, 255, 255, 0.06)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ fontSize: "13px", color: "#9295A5" }}>
          Confirmation email dispatched via Resend to winner
        </span>
        <span
          style={{
            padding: "4px 12px",
            borderRadius: "10px",
            background: "rgba(55, 217, 155, 0.15)",
            color: "#37D99B",
            fontSize: "12px",
            fontWeight: 700,
          }}
        >
          FINALIZED &bull; ZERO MANUAL KEYS
        </span>
      </div>
    </div>
  );
};
