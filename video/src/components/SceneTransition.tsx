import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";

interface SceneTransitionProps {
  durationInFrames: number;
  fadeInFrames?: number;
  fadeOutFrames?: number;
  children: React.ReactNode;
}

export const SceneTransition: React.FC<SceneTransitionProps> = ({
  durationInFrames,
  fadeInFrames = 15,
  fadeOutFrames = 15,
  children,
}) => {
  const frame = useCurrentFrame();

  const opacityIn = interpolate(frame, [0, fadeInFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const opacityOut = interpolate(
    frame,
    [durationInFrames - fadeOutFrames, durationInFrames],
    [1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  const opacity = Math.min(opacityIn, opacityOut);

  // Subtle camera push-in
  const scale = interpolate(frame, [0, durationInFrames], [1, 1.04], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        opacity,
        transform: `scale(${scale})`,
        overflow: "hidden",
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
