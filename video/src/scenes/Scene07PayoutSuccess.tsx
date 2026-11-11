import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { SceneTransition } from "../components/SceneTransition";
import { Background } from "../components/Background";
import { GlowEffect } from "../components/GlowEffect";
import { PaymentRail } from "../components/PaymentRail";
import { TransactionCard } from "../components/TransactionCard";
import { AnimatedText } from "../components/AnimatedText";
import { VIDEO_CONFIG } from "../config/videoConfig";

export const Scene07PayoutSuccess: React.FC = () => {
  const frame = useCurrentFrame();
  const duration = VIDEO_CONFIG.scenes.scene07.duration;

  // Rail flow animation
  const railProgress = interpolate(frame, [0, 80], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const showCard = frame > 40;

  return (
    <SceneTransition durationInFrames={duration} fadeInFrames={15} fadeOutFrames={15}>
      <Background accentColor="#37D99B" glowIntensity={1.2} />
      <GlowEffect color="#E8B45A" size={600} x="50%" y="50%" opacity={0.3} blur={100} />

      {/* Gold Payment Rail flowing into Winner Wallet */}
      <PaymentRail progress={railProgress} startX={200} endX={1720} y={180} color="#E8B45A" glowColor="#37D99B" />

      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px",
          zIndex: 3,
        }}
      >
        {/* Settlement Pipeline Breadcrumb */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "32px",
            background: "rgba(16, 18, 27, 0.8)",
            padding: "10px 24px",
            borderRadius: "30px",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <span style={{ color: "#9295A5", fontSize: "14px" }}>ORGANIZER ESCROW</span>
          <span style={{ color: "#E8B45A" }}>&rarr;</span>
          <span style={{ color: "#A78BFA", fontSize: "14px", fontWeight: 700 }}>NEAR MPC SIGNING</span>
          <span style={{ color: "#E8B45A" }}>&rarr;</span>
          <span style={{ color: "#37D99B", fontSize: "14px" }}>AURORA EVM</span>
          <span style={{ color: "#E8B45A" }}>&rarr;</span>
          <span style={{ color: "#fff", fontSize: "14px", fontWeight: 700 }}>WINNER WALLET</span>
        </div>

        {/* Revealed Transaction Card */}
        {showCard && <TransactionCard />}
      </AbsoluteFill>
    </SceneTransition>
  );
};
