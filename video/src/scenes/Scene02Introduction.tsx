import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate, Img, staticFile } from "remotion";
import { SceneTransition } from "../components/SceneTransition";
import { Background } from "../components/Background";
import { GlowEffect } from "../components/GlowEffect";
import { ParticleField } from "../components/ParticleField";
import { PaymentRail } from "../components/PaymentRail";
import { AnimatedText } from "../components/AnimatedText";
import { VIDEO_CONFIG } from "../config/videoConfig";

export const Scene02Introduction: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const duration = VIDEO_CONFIG.scenes.scene02.duration;

  const logoEntrance = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 90 },
  });

  const logoScale = interpolate(logoEntrance, [0, 1], [0.8, 1]);
  const logoOpacity = interpolate(logoEntrance, [0, 1], [0, 1]);

  // Payment rail progress
  const railProgress = interpolate(frame, [40, 200], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Light sweep angle
  const sweepPos = interpolate(frame, [20, 160], [-400, 1920]);

  return (
    <SceneTransition durationInFrames={duration} fadeInFrames={15} fadeOutFrames={15}>
      <Background accentColor={VIDEO_CONFIG.colors.primaryViolet} glowIntensity={1.2} />
      <ParticleField count={30} color="#A78BFA" />
      <GlowEffect color="#E51E2B" size={600} x="50%" y="42%" opacity={0.35} blur={90} />

      {/* Dynamic Payment Rail flowing horizontally */}
      <PaymentRail progress={railProgress} startX={160} endX={1760} y={480} color="#E51E2B" glowColor="#A78BFA" />

      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 3,
        }}
      >
        {/* Center Logo with Purple/Crimson Glow */}
        <div
          style={{
            transform: `scale(${logoScale})`,
            opacity: logoOpacity,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            position: "relative",
          }}
        >
          {/* Logo Frame */}
          <div
            style={{
              width: 140,
              height: 140,
              borderRadius: "32px",
              background: "rgba(16, 18, 27, 0.9)",
              border: "2px solid rgba(229, 30, 43, 0.5)",
              boxShadow: "0 20px 60px rgba(229, 30, 43, 0.35), 0 0 40px rgba(139, 92, 246, 0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "36px",
              overflow: "hidden",
              position: "relative",
            }}
          >
            {/* Local Logo */}
            <Img
              src={staticFile("logo.png")}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />

            {/* Light Sweep Effect */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: `${sweepPos - 700}px`,
                width: "80px",
                height: "100%",
                background: "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)",
                transform: "skewX(-20deg)",
                pointerEvents: "none",
              }}
            />
          </div>

          {/* Title */}
          <AnimatedText
            text="PAYFOLD"
            fontSize={78}
            fontWeight={900}
            color="#FFFFFF"
            letterSpacing="-0.03em"
            delay={10}
          />

          {/* Subtitle */}
          <div style={{ marginTop: "12px" }}>
            <AnimatedText
              text="Autonomous Hackathon Payouts"
              fontSize={32}
              fontWeight={700}
              color="#A78BFA"
              letterSpacing="-0.01em"
              delay={25}
            />
          </div>

          {/* Description */}
          <div style={{ marginTop: "24px" }}>
            <AnimatedText
              text="From winner announcement to on-chain settlement."
              fontSize={22}
              fontWeight={500}
              color="#9295A5"
              delay={40}
            />
          </div>
        </div>
      </AbsoluteFill>
    </SceneTransition>
  );
};
