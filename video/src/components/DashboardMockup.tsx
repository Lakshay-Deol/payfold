import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { VIDEO_CONFIG } from "../config/videoConfig";

interface DashboardMockupProps {
  step?: "filling" | "submitting" | "locked";
}

export const DashboardMockup: React.FC<DashboardMockupProps> = ({ step = "filling" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame,
    fps,
    config: { damping: 16, stiffness: 100 },
  });

  const cardScale = interpolate(entrance, [0, 1], [0.92, 1]);
  const cardOpacity = interpolate(entrance, [0, 1], [0, 1]);

  // Simulated cursor movement
  const cursorX = interpolate(frame, [30, 90, 160, 220], [600, 750, 850, 960], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const cursorY = interpolate(frame, [30, 90, 160, 220], [400, 480, 560, 680], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const isClicking = frame > 215 && frame < 235;

  const isLocked = frame > 230;

  return (
    <div
      style={{
        width: "1280px",
        height: "760px",
        borderRadius: "24px",
        background: "rgba(16, 18, 27, 0.88)",
        border: `1px solid ${isLocked ? "rgba(55, 217, 155, 0.5)" : "rgba(255, 255, 255, 0.1)"}`,
        boxShadow: isLocked
          ? "0 25px 60px rgba(55, 217, 155, 0.18), 0 0 40px rgba(139, 92, 246, 0.12)"
          : "0 25px 60px rgba(0, 0, 0, 0.6), 0 0 30px rgba(229, 30, 43, 0.15)",
        backdropFilter: "blur(20px)",
        transform: `scale(${cardScale})`,
        opacity: cardOpacity,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Window Title Bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "18px 28px",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          background: "rgba(8, 9, 13, 0.6)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{ display: "flex", gap: "8px" }}>
            <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#FF5F56" }} />
            <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#FFBD2E" }} />
            <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#27C93F" }} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginLeft: "12px" }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: "8px",
                background: "linear-gradient(135deg, #E51E2B 0%, #8B5CF6 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 900,
                color: "#fff",
                fontSize: 14,
              }}
            >
              P
            </div>
            <span style={{ color: "#fff", fontWeight: 700, fontSize: "16px", letterSpacing: "-0.01em" }}>
              PayFold &bull; Organizer Console
            </span>
            <span
              style={{
                fontSize: "12px",
                color: "#A78BFA",
                background: "rgba(139, 92, 246, 0.15)",
                padding: "3px 10px",
                borderRadius: "12px",
                border: "1px solid rgba(139, 92, 246, 0.3)",
              }}
            >
              NEAR Hackathon 2026
            </span>
          </div>
        </div>

        {/* Connected Wallet Badge */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 14px",
              borderRadius: "20px",
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              fontSize: "13px",
              color: "#9295A5",
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#37D99B" }} />
            <span style={{ color: "#fff", fontWeight: 600 }}>Rob (Organizer)</span>
            <span style={{ fontFamily: "monospace", color: "#A78BFA" }}>0xRob...9214</span>
          </div>

          <div
            style={{
              padding: "6px 14px",
              borderRadius: "20px",
              background: "rgba(229, 30, 43, 0.15)",
              border: "1px solid rgba(229, 30, 43, 0.3)",
              fontSize: "13px",
              color: "#E51E2B",
              fontWeight: 700,
            }}
          >
            Aurora EVM
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", padding: "32px", gap: "32px", flex: 1 }}>
        {/* Left Form: Winner Announcement */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.02)",
            borderRadius: "18px",
            padding: "26px",
            border: "1px solid rgba(255, 255, 255, 0.06)",
            display: "flex",
            flexDirection: "column",
            gap: "18px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h3 style={{ margin: 0, fontSize: "20px", color: "#fff", fontWeight: 700 }}>
                Announce & Lock Prize Escrow
              </h3>
              <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#9295A5" }}>
                Funds are held trustlessly in PayFoldEscrow.sol on Aurora
              </p>
            </div>
            {isLocked && (
              <span
                style={{
                  background: "rgba(55, 217, 155, 0.15)",
                  color: "#37D99B",
                  border: "1px solid rgba(55, 217, 155, 0.4)",
                  padding: "4px 12px",
                  borderRadius: "12px",
                  fontSize: "12px",
                  fontWeight: 700,
                }}
              >
                ESCROW ACTIVE
              </span>
            )}
          </div>

          {/* Form Rows */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={{ fontSize: "12px", color: "#9295A5", display: "block", marginBottom: "6px" }}>
                Hackathon
              </label>
              <div
                style={{
                  padding: "12px 16px",
                  borderRadius: "10px",
                  background: "rgba(0, 0, 0, 0.4)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  color: "#fff",
                  fontSize: "14px",
                  fontWeight: 600,
                }}
              >
                NEAR Hackathon 2026
              </div>
            </div>

            <div>
              <label style={{ fontSize: "12px", color: "#9295A5", display: "block", marginBottom: "6px" }}>
                Winner Name
              </label>
              <div
                style={{
                  padding: "12px 16px",
                  borderRadius: "10px",
                  background: "rgba(0, 0, 0, 0.4)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  color: "#fff",
                  fontSize: "14px",
                  fontWeight: 600,
                }}
              >
                Lakshay
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 0.6fr", gap: "16px" }}>
            <div>
              <label style={{ fontSize: "12px", color: "#9295A5", display: "block", marginBottom: "6px" }}>
                Winner Email
              </label>
              <div
                style={{
                  padding: "12px 16px",
                  borderRadius: "10px",
                  background: "rgba(0, 0, 0, 0.4)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  color: "#fff",
                  fontSize: "14px",
                  fontFamily: "monospace",
                }}
              >
                lakshayld26@gmail.com
              </div>
            </div>

            <div>
              <label style={{ fontSize: "12px", color: "#9295A5", display: "block", marginBottom: "6px" }}>
                Prize Lock
              </label>
              <div
                style={{
                  padding: "12px 16px",
                  borderRadius: "10px",
                  background: "rgba(232, 180, 90, 0.12)",
                  border: "1px solid rgba(232, 180, 90, 0.4)",
                  color: "#E8B45A",
                  fontSize: "15px",
                  fontWeight: 700,
                }}
              >
                0.5 ETH
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={{ fontSize: "12px", color: "#9295A5", display: "block", marginBottom: "6px" }}>
                Placement
              </label>
              <div
                style={{
                  padding: "12px 16px",
                  borderRadius: "10px",
                  background: "rgba(0, 0, 0, 0.4)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  color: "#fff",
                  fontSize: "14px",
                }}
              >
                1st Place
              </div>
            </div>

            <div>
              <label style={{ fontSize: "12px", color: "#9295A5", display: "block", marginBottom: "6px" }}>
                Track
              </label>
              <div
                style={{
                  padding: "12px 16px",
                  borderRadius: "10px",
                  background: "rgba(0, 0, 0, 0.4)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  color: "#fff",
                  fontSize: "14px",
                }}
              >
                Agent Economy
              </div>
            </div>
          </div>

          {/* Submit Action Button */}
          <div
            style={{
              marginTop: "10px",
              padding: "16px",
              borderRadius: "12px",
              background: isLocked
                ? "linear-gradient(135deg, #37D99B 0%, #10B981 100%)"
                : "linear-gradient(135deg, #E51E2B 0%, #8B5CF6 100%)",
              color: "#fff",
              textAlign: "center",
              fontWeight: 700,
              fontSize: "16px",
              letterSpacing: "-0.01em",
              boxShadow: isLocked
                ? "0 10px 30px rgba(55, 217, 155, 0.4)"
                : "0 10px 30px rgba(229, 30, 43, 0.4)",
              transform: isClicking ? "scale(0.97)" : "scale(1)",
              transition: "transform 0.1s ease",
            }}
          >
            {isLocked ? "PRIZE FUNDS LOCKED IN ESCROW" : "Lock Escrow & Trigger AI Outreach"}
          </div>
        </div>

        {/* Right Panel: Live Smart Contract Vault Status */}
        <div
          style={{
            background: "rgba(0, 0, 0, 0.35)",
            borderRadius: "18px",
            padding: "26px",
            border: "1px solid rgba(255, 255, 255, 0.06)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#E51E2B" }} />
              <h4 style={{ margin: 0, fontSize: "16px", color: "#fff", fontWeight: 700 }}>
                PayFoldEscrow.sol Vault
              </h4>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ padding: "12px", background: "rgba(255, 255, 255, 0.03)", borderRadius: "8px" }}>
                <span style={{ fontSize: "11px", color: "#9295A5", display: "block" }}>Escrow Address</span>
                <span style={{ fontSize: "13px", fontFamily: "monospace", color: "#A78BFA" }}>
                  0xFcAaf9F83875C2c4fEF050af893e90061254c660
                </span>
              </div>

              <div style={{ padding: "12px", background: "rgba(255, 255, 255, 0.03)", borderRadius: "8px" }}>
                <span style={{ fontSize: "11px", color: "#9295A5", display: "block" }}>NEAR Agent Signer</span>
                <span style={{ fontSize: "13px", fontFamily: "monospace", color: "#37D99B" }}>
                  lakshay-payfold.testnet
                </span>
              </div>

              <div style={{ padding: "12px", background: "rgba(255, 255, 255, 0.03)", borderRadius: "8px" }}>
                <span style={{ fontSize: "11px", color: "#9295A5", display: "block" }}>Vault Balance</span>
                <span style={{ fontSize: "22px", fontWeight: 800, color: "#E8B45A" }}>
                  {isLocked ? "0.5 ETH LOCKED" : "0.0 ETH"}
                </span>
              </div>
            </div>
          </div>

          {/* Non-Custodial Guarantee Badge */}
          <div
            style={{
              padding: "12px",
              borderRadius: "10px",
              background: "rgba(139, 92, 246, 0.1)",
              border: "1px solid rgba(139, 92, 246, 0.25)",
              fontSize: "12px",
              color: "#A78BFA",
              lineHeight: 1.4,
            }}
          >
            <strong>Zero Custody:</strong> Funds can only be released through decentralized NEAR MPC co-signing to the verified recipient.
          </div>
        </div>
      </div>

      {/* Floating Animated Cursor */}
      <div
        style={{
          position: "absolute",
          left: `${cursorX}px`,
          top: `${cursorY}px`,
          width: 24,
          height: 24,
          pointerEvents: "none",
          transform: isClicking ? "scale(0.85)" : "scale(1)",
          filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.5))",
          zIndex: 10,
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M5.5 3.5L18.5 13.5L12.5 14.5L10 20.5L7.5 19.5L10 13.5L5.5 3.5Z"
            fill="#FFFFFF"
            stroke="#000000"
            strokeWidth="1.5"
          />
        </svg>
      </div>
    </div>
  );
};
