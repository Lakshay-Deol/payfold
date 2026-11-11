import React, { useMemo } from "react";
import { useCurrentFrame } from "remotion";
import { VIDEO_CONFIG } from "../config/videoConfig";

interface ParticleFieldProps {
  count?: number;
  color?: string;
}

export const ParticleField: React.FC<ParticleFieldProps> = ({
  count = 40,
  color = VIDEO_CONFIG.colors.electricPurple,
}) => {
  const frame = useCurrentFrame();

  const particles = useMemo(() => {
    const list = [];
    for (let i = 0; i < count; i++) {
      // Deterministic pseudo-random coordinates
      const seedX = ((i * 137.5) % 1920);
      const seedY = ((i * 223.7) % 1080);
      const size = 1.5 + (i % 3) * 1.2;
      const speed = 0.4 + (i % 5) * 0.2;
      const offset = (i * 17) % 360;
      list.push({ seedX, seedY, size, speed, offset });
    }
    return list;
  }, [count]);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 1,
      }}
    >
      {particles.map((p, idx) => {
        const yPos = (p.seedY - (frame * p.speed) + 1080) % 1080;
        const xDrift = p.seedX + Math.sin((frame + p.offset) * 0.03) * 20;
        const opacity = 0.2 + 0.3 * Math.sin((frame + p.offset) * 0.04);

        return (
          <div
            key={idx}
            style={{
              position: "absolute",
              left: `${xDrift}px`,
              top: `${yPos}px`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              borderRadius: "50%",
              backgroundColor: color,
              boxShadow: `0 0 ${p.size * 3}px ${color}`,
              opacity: Math.max(0.08, opacity),
            }}
          />
        );
      })}
    </div>
  );
};
