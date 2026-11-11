import React from "react";
import { Composition } from "remotion";
import { PayFoldVideo } from "./PayFoldVideo";
import { VIDEO_CONFIG } from "./config/videoConfig";

export const Root: React.FC = () => {
  return (
    <>
      <Composition
        id="PayFoldPitch"
        component={PayFoldVideo}
        durationInFrames={VIDEO_CONFIG.totalFrames}
        fps={VIDEO_CONFIG.fps}
        width={VIDEO_CONFIG.width}
        height={VIDEO_CONFIG.height}
      />
    </>
  );
};
