import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate, Img, staticFile } from "remotion";
import { SceneTransition } from "../components/SceneTransition";
import { Background } from "../components/Background";
import { GlowEffect } from "../components/GlowEffect";
import { ParticleField } from "../components/ParticleField";
import { AnimatedText } from "../components/AnimatedText";
import { VIDEO_CONFIG } from "../config/videoConfig";

export const Scene08Closing: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const duration = VIDEO_CONFIG.scenes.scene08.duration;

  const logoEntrance = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 90 },
  });

  const logoScale = interpolate(logoEntrance, [0, 1], [0.85, 1]);
  const logoOpacity = interpolate(logoEntrance, [0, 1], [0, 1]);

  // Circular rotating ring angle
  const ringRotate = (frame * 1.5) % 360;

  return (
    <SceneTransition durationInFrames={duration} fadeInFrames={15} fadeOutFrames={25}>
      <Background accentColor="#8B5CF6" glowIntensity={1.3} />
      <ParticleField count={45} color="#E8B45A" />
      <GlowEffect color="#E51E2B" size={600} x="50%" y="45%" opacity={0.35} blur={90} />

      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 3,
        }}
      >
        {/* Logo with Circular Glowing Rail */}
        <div style={{ position: "relative", marginBottom: "32px" }}>
          {/* Circular Orbiting Ring */}
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: "180px",
              height: "180px",
              transform: `translate(-50%, -50%) rotate(${ringRotate}deg)`,
              borderRadius: "50%",
              border: "2px dashed rgba(229, 30, 43, 0.4)",
              pointerEvents: "none",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "-5px",
                left: "50%",
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                background: "#E8B45A",
                boxShadow: "0 0 16px #E8B45A",
              }}
            />
          </div>

          <div
            style={{
              width: 120,
              height: 120,
              borderRadius: "28px",
              background: "rgba(16, 18, 27, 0.95)",
              border: "2px solid rgba(229, 30, 43, 0.6)",
              boxShadow: "0 20px 60px rgba(229, 30, 43, 0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transform: `scale(${logoScale})`,
              opacity: logoOpacity,
              overflow: "hidden",
            }}
          >
            <Img
              src={staticFile("logo.png")}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </div>
        </div>

        {/* Triple Punchline */}
        <div style={{ display: "flex", gap: "24px", marginBottom: "20px" }}>
          <AnimatedText text="ANNOUNCE." fontSize={48} fontWeight={900} color="#FFFFFF" delay={10} />
          <AnimatedText text="AUTOMATE." fontSize={48} fontWeight={900} color="#E51E2B" delay={25} />
          <AnimatedText text="DISTRIBUTE." fontSize={48} fontWeight={900} color="#37D99B" delay={40} />
        </div>

        {/* Payoff Line */}
        <AnimatedText
          text="Autonomous payouts. Powered by NEAR."
          fontSize={26}
          fontWeight={600}
          color="#A78BFA"
          letterSpacing="-0.01em"
          delay={55}
        />

        {/* Hackathon & Author Credential Footer */}
        <div
          style={{
            marginTop: "48px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "8px",
            borderTop: "1px solid rgba(255, 255, 255, 0.08)",
            paddingTop: "20px",
          }}
        >
          <span style={{ fontSize: "14px", color: "#9295A5", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Built for NEAR HACKATHON 2026
          </span>
          <span style={{ fontSize: "16px", color: "#fff", fontWeight: 700 }}>
            Developed by Lakshay Deol
          </span>
        </div>
      </AbsoluteFill>
    </SceneTransition>
  );
};
