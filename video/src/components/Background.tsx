import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { VIDEO_CONFIG } from "../config/videoConfig";

interface BackgroundProps {
  accentColor?: string;
  glowIntensity?: number;
}

export const Background: React.FC<BackgroundProps> = ({
  accentColor = VIDEO_CONFIG.colors.primaryViolet,
  glowIntensity = 1,
}) => {
  const frame = useCurrentFrame();

  // Subtle breathing oscillation
  const pulse = interpolate(
    Math.sin(frame * 0.04),
    [-1, 1],
    [0.85 * glowIntensity, 1.15 * glowIntensity]
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: VIDEO_CONFIG.colors.background,
        overflow: "hidden",
        zIndex: 0,
      }}
    >
      {/* Subtle Grid Lines */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: "64px 64px",
          opacity: 0.6,
        }}
      />

      {/* Primary Ambient Glow (Top Left) */}
      <div
        style={{
          position: "absolute",
          top: "-20%",
          left: "-10%",
          width: "900px",
          height: "900px",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${accentColor} 0%, transparent 68%)`,
          opacity: 0.22 * pulse,
          filter: "blur(90px)",
          pointerEvents: "none",
        }}
      />

      {/* Crimson / Gold Subtle Ambient Glow (Bottom Right) */}
      <div
        style={{
          position: "absolute",
          bottom: "-25%",
          right: "-10%",
          width: "850px",
          height: "850px",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${VIDEO_CONFIG.colors.crimson} 0%, transparent 70%)`,
          opacity: 0.16 * pulse,
          filter: "blur(100px)",
          pointerEvents: "none",
        }}
      />

      {/* Deep Center Radial Vignette */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(circle at center, transparent 30%, #050608 95%)",
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};
