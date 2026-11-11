import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { VIDEO_CONFIG } from "../config/videoConfig";

interface PaymentRailProps {
  progress?: number; // 0 to 1
  startX?: number;
  endX?: number;
  y?: number;
  color?: string;
  glowColor?: string;
}

export const PaymentRail: React.FC<PaymentRailProps> = ({
  progress = 1,
  startX = 200,
  endX = 1720,
  y = 540,
  color = VIDEO_CONFIG.colors.primaryViolet,
  glowColor = VIDEO_CONFIG.colors.electricPurple,
}) => {
  const frame = useCurrentFrame();
  const width = endX - startX;

  // Moving energy pulse along the line
  const pulseX = startX + ((frame * 14) % width);

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 2,
      }}
    >
      <svg width="1920" height="1080" style={{ position: "absolute", inset: 0 }}>
        <defs>
          <linearGradient id="railGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={color} stopOpacity="0.2" />
            <stop offset="50%" stopColor={glowColor} stopOpacity="0.9" />
            <stop offset="100%" stopColor={color} stopOpacity="0.2" />
          </linearGradient>

          <filter id="railGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Base Track */}
        <line
          x1={startX}
          y1={y}
          x2={startX + width * progress}
          y2={y}
          stroke="rgba(255, 255, 255, 0.12)"
          strokeWidth="2"
          strokeDasharray="6 6"
        />

        {/* Active Flowing Line */}
        <line
          x1={startX}
          y1={y}
          x2={startX + width * progress}
          y2={y}
          stroke="url(#railGrad)"
          strokeWidth="3"
          filter="url(#railGlow)"
        />

        {/* Moving Pulse Packet */}
        {progress > 0.1 && (
          <g transform={`translate(${pulseX}, ${y})`}>
            <circle r="6" fill={glowColor} filter="url(#railGlow)" />
            <circle r="14" fill="none" stroke={glowColor} strokeWidth="1.5" opacity="0.6" />
          </g>
        )}
      </svg>
    </div>
  );
};
