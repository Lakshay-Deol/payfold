import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { SceneTransition } from "../components/SceneTransition";
import { Background } from "../components/Background";
import { GlowEffect } from "../components/GlowEffect";
import { EmailMockup } from "../components/EmailMockup";
import { AnimatedText } from "../components/AnimatedText";
import { VIDEO_CONFIG } from "../config/videoConfig";

export const Scene04EmailOutreach: React.FC = () => {
  const frame = useCurrentFrame();
  const duration = VIDEO_CONFIG.scenes.scene04.duration;

  return (
    <SceneTransition durationInFrames={duration} fadeInFrames={15} fadeOutFrames={15}>
      <Background accentColor="#3B82F6" glowIntensity={0.8} />
      <GlowEffect color="#37D99B" size={500} x="20%" y="70%" opacity={0.2} />

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
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <AnimatedText
            text="STEP 2: AI-POWERED WINNER OUTREACH"
            fontSize={36}
            fontWeight={800}
            color="#FFFFFF"
            letterSpacing="-0.02em"
          />
          <div style={{ marginTop: "6px" }}>
            <span style={{ fontSize: "16px", color: "#60A5FA" }}>
              Google Gemini drafts personalized email &bull; Resend delivers instantaneously
            </span>
          </div>
        </div>

        {/* Email Interface Component */}
        <EmailMockup />
      </AbsoluteFill>
    </SceneTransition>
  );
};
