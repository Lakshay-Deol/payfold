import React from "react";
import { useCurrentFrame, interpolate } from "remotion";

interface GlowEffectProps {
  color: string;
  size?: number;
  x?: string | number;
  y?: string | number;
  opacity?: number;
  blur?: number;
}

export const GlowEffect: React.FC<GlowEffectProps> = ({
  color,
  size = 500,
  x = "50%",
  y = "50%",
  opacity = 0.3,
  blur = 80,
}) => {
  const frame = useCurrentFrame();
  const breathe = interpolate(Math.sin(frame * 0.05), [-1, 1], [0.9, 1.1]);

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: `${size}px`,
        height: `${size}px`,
        transform: "translate(-50%, -50%)",
        borderRadius: "50%",
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        opacity: opacity * breathe,
        filter: `blur(${blur}px)`,
        pointerEvents: "none",
        zIndex: 1,
      }}
    />
  );
};
