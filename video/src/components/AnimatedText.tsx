import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { VIDEO_CONFIG } from "../config/videoConfig";

interface AnimatedTextProps {
  text: string;
  delay?: number;
  fontSize?: number;
  fontWeight?: number | string;
  color?: string;
  lineHeight?: number | string;
  letterSpacing?: string;
  textAlign?: "left" | "center" | "right";
  isGradient?: boolean;
  gradientColors?: [string, string];
  maxWidth?: number | string;
}

export const AnimatedText: React.FC<AnimatedTextProps> = ({
  text,
  delay = 0,
  fontSize = 48,
  fontWeight = 700,
  color = VIDEO_CONFIG.colors.white,
  lineHeight = 1.2,
  letterSpacing = "-0.02em",
  textAlign = "center",
  isGradient = false,
  gradientColors = [VIDEO_CONFIG.colors.white, VIDEO_CONFIG.colors.electricPurple],
  maxWidth = "100%",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame: frame - delay,
    fps,
    config: {
      damping: 18,
      stiffness: 120,
      mass: 0.8,
    },
  });

  const opacity = interpolate(entrance, [0, 1], [0, 1]);
  const translateY = interpolate(entrance, [0, 1], [30, 0]);
  const blur = interpolate(entrance, [0, 1], [8, 0]);

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${translateY}px)`,
        filter: `blur(${blur}px)`,
        fontSize: `${fontSize}px`,
        fontWeight,
        color: isGradient ? "transparent" : color,
        backgroundImage: isGradient
          ? `linear-gradient(135deg, ${gradientColors[0]} 20%, ${gradientColors[1]} 100%)`
          : undefined,
        WebkitBackgroundClip: isGradient ? "text" : undefined,
        lineHeight,
        letterSpacing,
        textAlign,
        maxWidth,
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {text}
    </div>
  );
};
