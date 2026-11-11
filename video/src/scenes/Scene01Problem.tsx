import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { SceneTransition } from "../components/SceneTransition";
import { Background } from "../components/Background";
import { AnimatedText } from "../components/AnimatedText";
import { VIDEO_CONFIG } from "../config/videoConfig";

export const Scene01Problem: React.FC = () => {
  const frame = useCurrentFrame();
  const duration = VIDEO_CONFIG.scenes.scene01.duration;

  // Staged narrative sequence
  // 0 - 90: "YOU WON."
  // 90 - 180: "NOW WHERE'S YOUR PRIZE?"
  // 180 - 360: Rob's spreadsheet chaos & manual nightmare

  const showChaos = frame > 170;

  // Spreadsheets and chaotic alerts drifting and rotating slightly
  const chaosOffset1 = interpolate(frame, [170, 360], [40, -40]);
  const chaosOffset2 = interpolate(frame, [170, 360], [-30, 30]);

  return (
    <SceneTransition durationInFrames={duration} fadeInFrames={10} fadeOutFrames={20}>
      <Background accentColor="#E51E2B" glowIntensity={0.6} />

      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "60px",
          zIndex: 2,
        }}
      >
        {/* Phase 1: Bold Opening Inquiries */}
        {frame < 170 && (
          <div style={{ textAlign: "center", maxWidth: "1200px" }}>
            {frame < 90 ? (
              <AnimatedText
                text="YOU WON."
                fontSize={96}
                fontWeight={900}
                color="#FFFFFF"
                letterSpacing="-0.04em"
              />
            ) : (
              <div>
                <AnimatedText
                  text="NOW WHERE'S YOUR PRIZE?"
                  fontSize={84}
                  fontWeight={900}
                  color="#E51E2B"
                  letterSpacing="-0.03em"
                />
                <div style={{ marginTop: "24px" }}>
                  <AnimatedText
                    text="Weeks of manual spreadsheets. Lost wallet addresses. Zero transparency."
                    fontSize={26}
                    fontWeight={500}
                    color="#9295A5"
                    delay={20}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Phase 2: Rob The Organizer's Spreadsheet Nightmare */}
        {showChaos && (
          <div style={{ width: "100%", maxWidth: "1300px", position: "relative", height: "700px" }}>
            <div style={{ textAlign: "center", marginBottom: "30px" }}>
              <AnimatedText
                text="ROB'S HACKATHON NIGHTMARE"
                fontSize={44}
                fontWeight={800}
                color="#FFFFFF"
                letterSpacing="-0.02em"
              />
              <span style={{ fontSize: "18px", color: "#E51E2B", fontWeight: 600 }}>
                50+ Winners &bull; 12 Timezones &bull; 34 Missing Wallet Addresses
              </span>
            </div>

            {/* Chaotic Floating Spreadsheet Window 1 */}
            <div
              style={{
                position: "absolute",
                left: "40px",
                top: `${80 + chaosOffset1}px`,
                width: "680px",
                background: "rgba(16, 18, 27, 0.94)",
                borderRadius: "16px",
                border: "1px solid rgba(244, 63, 94, 0.4)",
                boxShadow: "0 20px 50px rgba(0,0,0,0.8), 0 0 30px rgba(244, 63, 94, 0.15)",
                overflow: "hidden",
                transform: "rotate(-2deg)",
              }}
            >
              <div style={{ padding: "12px 18px", background: "rgba(244, 63, 94, 0.15)", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#fff", fontSize: "13px", fontWeight: 700 }}>
                  NEAR_Hackathon_Payouts_FINAL_v4_REVISED.xlsx
                </span>
                <span style={{ color: "#F43F5E", fontSize: "12px", fontWeight: 700 }}>42 ERRORS</span>
              </div>
              <div style={{ padding: "16px" }}>
                <table style={{ width: "100%", textAlign: "left", fontSize: "13px", color: "#D1D5DB" }}>
                  <thead>
                    <tr style={{ color: "#9295A5", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                      <th style={{ padding: "8px" }}>Winner</th>
                      <th>Track</th>
                      <th>Prize</th>
                      <th>Wallet Address</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      <td style={{ padding: "10px 8px" }}>Lakshay</td>
                      <td>Agent Economy</td>
                      <td>0.5 ETH</td>
                      <td style={{ color: "#F43F5E" }}>[Chasing on Telegram...]</td>
                      <td><span style={{ background: "rgba(244, 63, 94, 0.2)", color: "#F43F5E", padding: "2px 8px", borderRadius: "6px" }}>UNPAID</span></td>
                    </tr>
                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      <td style={{ padding: "10px 8px" }}>Alex</td>
                      <td>Chain Abstraction</td>
                      <td>0.3 ETH</td>
                      <td style={{ color: "#F43F5E" }}>[Typo in 0x address]</td>
                      <td><span style={{ background: "rgba(244, 63, 94, 0.2)", color: "#F43F5E", padding: "2px 8px", borderRadius: "6px" }}>FAILED</span></td>
                    </tr>
                    <tr>
                      <td style={{ padding: "10px 8px" }}>Elena</td>
                      <td>DeFi Infra</td>
                      <td>0.2 ETH</td>
                      <td style={{ color: "#F43F5E" }}>[No response to email]</td>
                      <td><span style={{ background: "rgba(244, 63, 94, 0.2)", color: "#F43F5E", padding: "2px 8px", borderRadius: "6px" }}>STALLED</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Chaotic Floating Alert Card 2 */}
            <div
              style={{
                position: "absolute",
                right: "60px",
                top: `${130 + chaosOffset2}px`,
                width: "480px",
                background: "rgba(16, 18, 27, 0.95)",
                borderRadius: "16px",
                border: "1px solid rgba(232, 180, 90, 0.4)",
                padding: "24px",
                boxShadow: "0 20px 50px rgba(0,0,0,0.8)",
                transform: "rotate(3deg)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#E8B45A" }} />
                <strong style={{ color: "#fff", fontSize: "15px" }}>The Organizer Problem:</strong>
              </div>
              <ul style={{ margin: 0, paddingLeft: "18px", color: "#D1D5DB", fontSize: "14px", lineHeight: 1.8 }}>
                <li>Manual Google Forms and Discord DMs</li>
                <li>Sponsor funds stuck in personal hot wallets</li>
                <li>Irreversible risks from wrong copy-pasting</li>
                <li>Weeks of delays damaging hackathon reputation</li>
              </ul>
            </div>

            {/* Warning Message Bar */}
            <div
              style={{
                position: "absolute",
                bottom: "20px",
                left: "50%",
                transform: "translateX(-50%)",
                background: "rgba(8, 9, 13, 0.9)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                padding: "14px 32px",
                borderRadius: "30px",
                color: "#F5F5F7",
                fontSize: "18px",
                fontWeight: 700,
                boxShadow: "0 10px 40px rgba(0,0,0,0.9)",
              }}
            >
              THERE HAS TO BE A BETTER WAY.
            </div>
          </div>
        )}
      </AbsoluteFill>
    </SceneTransition>
  );
};
