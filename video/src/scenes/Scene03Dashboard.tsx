import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { SceneTransition } from "../components/SceneTransition";
import { Background } from "../components/Background";
import { GlowEffect } from "../components/GlowEffect";
import { DashboardMockup } from "../components/DashboardMockup";
import { AnimatedText } from "../components/AnimatedText";
import { VIDEO_CONFIG } from "../config/videoConfig";

export const Scene03Dashboard: React.FC = () => {
  const frame = useCurrentFrame();
  const duration = VIDEO_CONFIG.scenes.scene03.duration;

  return (
    <SceneTransition durationInFrames={duration} fadeInFrames={15} fadeOutFrames={15}>
      <Background accentColor="#8B5CF6" glowIntensity={0.9} />
      <GlowEffect color="#E8B45A" size={500} x="80%" y="60%" opacity={0.25} />

      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px",
          zIndex: 2,
        }}
      >
        {/* Scene Header */}
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <AnimatedText
            text="STEP 1: ORGANIZER LOCKS ESCROW"
            fontSize={36}
            fontWeight={800}
            color="#FFFFFF"
            letterSpacing="-0.02em"
          />
          <div style={{ marginTop: "6px" }}>
            <span style={{ fontSize: "16px", color: "#9295A5" }}>
              Rob deposits 0.5 ETH into PayFoldEscrow.sol &bull; Funds locked trustlessly on Aurora EVM
            </span>
          </div>
        </div>

        {/* Dashboard Component */}
        <DashboardMockup />
      </AbsoluteFill>
    </SceneTransition>
  );
};
