import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { SceneTransition } from "../components/SceneTransition";
import { Background } from "../components/Background";
import { GlowEffect } from "../components/GlowEffect";
import { AnimatedText } from "../components/AnimatedText";
import { VIDEO_CONFIG } from "../config/videoConfig";

export const Scene05WalletExtraction: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const duration = VIDEO_CONFIG.scenes.scene05.duration;

  // Staged highlights
  const isAddressHighlighted = frame > 45;
  const isCheck1 = frame > 90;
  const isCheck2 = frame > 150;
  const isCheck3 = frame > 210;

  const cardEntrance = spring({
    frame,
    fps,
    config: { damping: 16, stiffness: 100 },
  });

  return (
    <SceneTransition durationInFrames={duration} fadeInFrames={15} fadeOutFrames={15}>
      <Background accentColor="#E51E2B" glowIntensity={0.9} />
      <GlowEffect color="#8B5CF6" size={550} x="70%" y="40%" opacity={0.3} />

      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "50px",
          zIndex: 2,
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <AnimatedText
            text="STEP 3: INTELLIGENT WALLET EXTRACTION"
            fontSize={36}
            fontWeight={800}
            color="#FFFFFF"
            letterSpacing="-0.02em"
          />
          <div style={{ marginTop: "6px" }}>
            <span style={{ fontSize: "16px", color: "#A78BFA" }}>
              Winner replies with natural language text &bull; AI automatically validates EVM address
            </span>
          </div>
        </div>

        {/* 2-Column Split: Inbound Reply vs Structured Validation */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "36px",
            width: "1280px",
            transform: `scale(${interpolate(cardEntrance, [0, 1], [0.94, 1])})`,
            opacity: interpolate(cardEntrance, [0, 1], [0, 1]),
          }}
        >
          {/* Left: Inbound Reply Email Card */}
          <div
            style={{
              background: "rgba(16, 18, 27, 0.9)",
              borderRadius: "20px",
              padding: "32px",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              boxShadow: "0 20px 50px rgba(0,0,0,0.6)",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#37D99B" }} />
                <strong style={{ color: "#fff", fontSize: "15px" }}>Incoming Email Reply</strong>
              </div>
              <span style={{ fontSize: "12px", color: "#9295A5" }}>From: lakshayld26@gmail.com</span>
            </div>

            <div style={{ fontSize: "17px", lineHeight: 1.7, color: "#D1D5DB" }}>
              Hi PayFold team,
              <br /><br />
              Thanks so much for the prize! Super excited to win 1st place in the hackathon.
              <br /><br />
              Here is my Aurora EVM wallet address:
              <br />
              <div
                style={{
                  display: "inline-block",
                  padding: "8px 16px",
                  borderRadius: "10px",
                  background: isAddressHighlighted
                    ? "rgba(229, 30, 43, 0.25)"
                    : "rgba(255, 255, 255, 0.05)",
                  border: `1px solid ${isAddressHighlighted ? "#E51E2B" : "rgba(255,255,255,0.1)"}`,
                  color: isAddressHighlighted ? "#FFFFFF" : "#A78BFA",
                  fontFamily: "monospace",
                  fontSize: "16px",
                  fontWeight: 700,
                  marginTop: "8px",
                  boxShadow: isAddressHighlighted ? "0 0 25px rgba(229, 30, 43, 0.5)" : "none",
                  transition: "all 0.3s ease",
                }}
              >
                0x71C8452f483FEfA834165dC65f57B8b71569B148
              </div>
              <br /><br />
              Best,
              <br />
              Lakshay
            </div>
          </div>

          {/* Right: Validation & Verification Checkpoints */}
          <div
            style={{
              background: "rgba(16, 18, 27, 0.9)",
              borderRadius: "20px",
              padding: "32px",
              border: "1px solid rgba(139, 92, 246, 0.3)",
              boxShadow: "0 20px 50px rgba(0,0,0,0.6), 0 0 30px rgba(139, 92, 246, 0.15)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div>
              <h3 style={{ margin: "0 0 16px", fontSize: "20px", color: "#fff", fontWeight: 700 }}>
                Autonomous Verification Engine
              </h3>
              <p style={{ margin: "0 0 24px", fontSize: "14px", color: "#9295A5" }}>
                Zero human parsing &bull; Google Gemini NLP + Regex Verification
              </p>

              {/* 3 Visual Checkpoints */}
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {/* Checkpoint 1 */}
                <div
                  style={{
                    padding: "16px",
                    borderRadius: "12px",
                    background: isCheck1 ? "rgba(55, 217, 155, 0.1)" : "rgba(255, 255, 255, 0.03)",
                    border: `1px solid ${isCheck1 ? "rgba(55, 217, 155, 0.4)" : "rgba(255, 255, 255, 0.08)"}`,
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      background: isCheck1 ? "#37D99B" : "#333",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#08090D",
                      fontWeight: 800,
                      fontSize: "14px",
                    }}
                  >
                    ✓
                  </div>
                  <div>
                    <strong style={{ color: "#fff", fontSize: "14px", display: "block" }}>
                      1. EVM Address Extracted
                    </strong>
                    <span style={{ fontSize: "12px", color: "#9295A5" }}>
                      Isolated 0x71C8...B148 from natural language body
                    </span>
                  </div>
                </div>

                {/* Checkpoint 2 */}
                <div
                  style={{
                    padding: "16px",
                    borderRadius: "12px",
                    background: isCheck2 ? "rgba(55, 217, 155, 0.1)" : "rgba(255, 255, 255, 0.03)",
                    border: `1px solid ${isCheck2 ? "rgba(55, 217, 155, 0.4)" : "rgba(255, 255, 255, 0.08)"}`,
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      background: isCheck2 ? "#37D99B" : "#333",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#08090D",
                      fontWeight: 800,
                      fontSize: "14px",
                    }}
                  >
                    ✓
                  </div>
                  <div>
                    <strong style={{ color: "#fff", fontSize: "14px", display: "block" }}>
                      2. Address Format Validated
                    </strong>
                    <span style={{ fontSize: "12px", color: "#9295A5" }}>
                      Passed 42-character hexadecimal & EIP-55 checksum test
                    </span>
                  </div>
                </div>

                {/* Checkpoint 3 */}
                <div
                  style={{
                    padding: "16px",
                    borderRadius: "12px",
                    background: isCheck3 ? "rgba(55, 217, 155, 0.1)" : "rgba(255, 255, 255, 0.03)",
                    border: `1px solid ${isCheck3 ? "rgba(55, 217, 155, 0.4)" : "rgba(255, 255, 255, 0.08)"}`,
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      background: isCheck3 ? "#37D99B" : "#333",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#08090D",
                      fontWeight: 800,
                      fontSize: "14px",
                    }}
                  >
                    ✓
                  </div>
                  <div>
                    <strong style={{ color: "#fff", fontSize: "14px", display: "block" }}>
                      3. Recipient Matched to Escrow Lock
                    </strong>
                    <span style={{ fontSize: "12px", color: "#9295A5" }}>
                      Validated against Hackathon #0 / Winner #0 (0.5 ETH)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Final Status Badge */}
            <div
              style={{
                marginTop: "20px",
                padding: "14px",
                borderRadius: "12px",
                background: isCheck3
                  ? "linear-gradient(135deg, rgba(55, 217, 155, 0.2) 0%, rgba(16, 185, 129, 0.3) 100%)"
                  : "rgba(255, 255, 255, 0.05)",
                border: `1px solid ${isCheck3 ? "#37D99B" : "rgba(255, 255, 255, 0.1)"}`,
                textAlign: "center",
                color: isCheck3 ? "#37D99B" : "#9295A5",
                fontWeight: 700,
                fontSize: "14px",
                letterSpacing: "0.02em",
              }}
            >
              {isCheck3 ? "READY FOR AUTONOMOUS EXECUTION" : "PARSING INBOUND MESSAGE..."}
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </SceneTransition>
  );
};
