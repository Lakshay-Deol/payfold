import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import { Scene01Problem } from "./scenes/Scene01Problem";
import { Scene02Introduction } from "./scenes/Scene02Introduction";
import { Scene03Dashboard } from "./scenes/Scene03Dashboard";
import { Scene04EmailOutreach } from "./scenes/Scene04EmailOutreach";
import { Scene05WalletExtraction } from "./scenes/Scene05WalletExtraction";
import { Scene06NearArchitecture } from "./scenes/Scene06NearArchitecture";
import { Scene07PayoutSuccess } from "./scenes/Scene07PayoutSuccess";
import { Scene08Closing } from "./scenes/Scene08Closing";
import { VIDEO_CONFIG } from "./config/videoConfig";

export const PayFoldVideo: React.FC = () => {
  const frame = useCurrentFrame();

  // Synchronized dynamic narration subtitles
  const getSubtitle = () => {
    if (frame < 90) return "You won the hackathon... but where is your prize?";
    if (frame < 180) return "Organizers lose weeks chasing wallet addresses across Discord and Telegram.";
    if (frame < 360) return "Meet Rob: 50 winners, 12 timezones, and endless spreadsheet chaos.";
    if (frame < 500) return "Introducing PayFold: The autonomous hackathon payout protocol.";
    if (frame < 660) return "From winner announcement to on-chain settlement, completely automated.";
    if (frame < 870) return "Rob locks the prize escrow in PayFoldEscrow.sol on Aurora EVM.";
    if (frame < 1080) return "Zero custodial risk: funds are locked in non-custodial smart contracts.";
    if (frame < 1270) return "Google Gemini crafts personalized winner congratulatory outreach.";
    if (frame < 1470) return "Dispatched instantly via Resend API to every hackathon winner.";
    if (frame < 1660) return "Lakshay replies with natural language text containing his wallet address.";
    if (frame < 1860) return "PayFold's AI validates the format and matches the pending escrow recipient.";
    if (frame < 2070) return "NEAR Chain Signatures: Decentralized MPC threshold co-signing.";
    if (frame < 2280) return "Phala TEE + Shade Agent: Confidential execution inside Intel TDX enclaves.";
    if (frame < 2490) return "No private keys on server: Raw transactions broadcast directly to Aurora EVM.";
    if (frame < 2650) return "Settlement executed! 0.5 ETH transferred autonomously to Lakshay.";
    if (frame < 2820) return "On-chain transaction confirmed on Aurora Testnet Explorer.";
    return "PayFold: Announce. Automate. Distribute. Powered by NEAR.";
  };

  const currentSubtitle = getSubtitle();

  return (
    <AbsoluteFill style={{ backgroundColor: VIDEO_CONFIG.colors.background }}>
      {/* 8 Sequenced Scenes */}
      <Sequence from={VIDEO_CONFIG.scenes.scene01.start} durationInFrames={VIDEO_CONFIG.scenes.scene01.duration}>
        <Scene01Problem />
      </Sequence>

      <Sequence from={VIDEO_CONFIG.scenes.scene02.start} durationInFrames={VIDEO_CONFIG.scenes.scene02.duration}>
        <Scene02Introduction />
      </Sequence>

      <Sequence from={VIDEO_CONFIG.scenes.scene03.start} durationInFrames={VIDEO_CONFIG.scenes.scene03.duration}>
        <Scene03Dashboard />
      </Sequence>

      <Sequence from={VIDEO_CONFIG.scenes.scene04.start} durationInFrames={VIDEO_CONFIG.scenes.scene04.duration}>
        <Scene04EmailOutreach />
      </Sequence>

      <Sequence from={VIDEO_CONFIG.scenes.scene05.start} durationInFrames={VIDEO_CONFIG.scenes.scene05.duration}>
        <Scene05WalletExtraction />
      </Sequence>

      <Sequence from={VIDEO_CONFIG.scenes.scene06.start} durationInFrames={VIDEO_CONFIG.scenes.scene06.duration}>
        <Scene06NearArchitecture />
      </Sequence>

      <Sequence from={VIDEO_CONFIG.scenes.scene07.start} durationInFrames={VIDEO_CONFIG.scenes.scene07.duration}>
        <Scene07PayoutSuccess />
      </Sequence>

      <Sequence from={VIDEO_CONFIG.scenes.scene08.start} durationInFrames={VIDEO_CONFIG.scenes.scene08.duration}>
        <Scene08Closing />
      </Sequence>

      {/* Cinematic Synchronized Narration Subtitle Pill */}
      <div
        style={{
          position: "absolute",
          bottom: "36px",
          left: "50%",
          transform: "translateX(-50%)",
          background: "rgba(8, 9, 13, 0.85)",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          padding: "10px 28px",
          borderRadius: "24px",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.7)",
          backdropFilter: "blur(12px)",
          color: "#F5F5F7",
          fontSize: "15px",
          fontWeight: 600,
          letterSpacing: "-0.01em",
          textAlign: "center",
          maxWidth: "1000px",
          zIndex: 99,
          pointerEvents: "none",
        }}
      >
        <span style={{ color: "#E51E2B", marginRight: "10px", fontWeight: 800 }}>&bull;</span>
        {currentSubtitle}
      </div>
    </AbsoluteFill>
  );
};
