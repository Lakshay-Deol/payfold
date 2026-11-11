import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { SceneTransition } from "../components/SceneTransition";
import { Background } from "../components/Background";
import { GlowEffect } from "../components/GlowEffect";
import { NearArchitecture } from "../components/NearArchitecture";
import { AnimatedText } from "../components/AnimatedText";
import { VIDEO_CONFIG } from "../config/videoConfig";

export const Scene06NearArchitecture: React.FC = () => {
  const frame = useCurrentFrame();
  const duration = VIDEO_CONFIG.scenes.scene06.duration;

  return (
    <SceneTransition durationInFrames={duration} fadeInFrames={15} fadeOutFrames={15}>
      <Background accentColor="#8B5CF6" glowIntensity={1.1} />
      <GlowEffect color="#E51E2B" size={600} x="30%" y="30%" opacity={0.25} />
      <GlowEffect color="#37D99B" size={600} x="70%" y="70%" opacity={0.25} />

      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "30px",
          zIndex: 2,
        }}
      >
        {/* Hero Title */}
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <AnimatedText
            text="THE NEAR TECHNOLOGY STACK"
            fontSize={40}
            fontWeight={900}
            color="#FFFFFF"
            letterSpacing="-0.02em"
          />
          <div style={{ marginTop: "6px" }}>
            <span style={{ fontSize: "16px", color: "#A78BFA", fontWeight: 600 }}>
              Chain Abstraction &bull; MPC Threshold Signatures &bull; Confidential Hardware TEE
            </span>
          </div>
        </div>

        {/* 3-Layer Visual Architecture Component */}
        <NearArchitecture />
      </AbsoluteFill>
    </SceneTransition>
  );
};
