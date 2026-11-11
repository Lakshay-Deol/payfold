export const VIDEO_CONFIG = {
  width: 1920,
  height: 1080,
  fps: 30,
  totalFrames: 3000, // 100 seconds
  colors: {
    background: "#08090D",
    secondaryBg: "#10121B",
    primaryViolet: "#8B5CF6",
    electricPurple: "#A78BFA",
    crimson: "#E51E2B",
    crimsonGlow: "rgba(229, 30, 43, 0.45)",
    gold: "#E8B45A",
    goldGlow: "rgba(232, 180, 90, 0.4)",
    white: "#F5F5F7",
    secondaryText: "#9295A5",
    success: "#37D99B",
    danger: "#F43F5E",
    cardGlass: "rgba(16, 18, 27, 0.85)",
    cardBorder: "rgba(255, 255, 255, 0.08)",
    cardBorderHighlight: "rgba(139, 92, 246, 0.4)",
  },
  meta: {
    organizer: "Rob",
    hackathonName: "NEAR Hackathon 2026",
    winnerName: "Lakshay",
    prize: "0.5 ETH",
    place: "1st Place",
    track: "Agent Economy",
    walletAddress: "0x71C8452f483FEfA834165dC65f57B8b71569B148",
    escrowContract: "0xFcAaf9F83875C2c4fEF050af893e90061254c660",
    nearAccount: "lakshay-payfold.testnet",
    mpcContract: "v1.signer-prod.testnet",
    derivationPath: "ethereum,NEAR Hackathon 2026,0",
    auroraExplorerUrl: "https://explorer.testnet.aurora.dev/tx/0x4a9d72e61284fae39b78119857d42cf23cb7a8b3e10f81d9f456c802194a5e31",
  },
  scenes: {
    scene01: { start: 0, duration: 360 }, // The Problem (Rob's Nightmare) (12s)
    scene02: { start: 360, duration: 300 }, // PayFold Introduction (10s)
    scene03: { start: 660, duration: 420 }, // Organizer Dashboard (Rob Locks Escrow) (14s)
    scene04: { start: 1080, duration: 390 }, // AI Email Outreach (Gemini & Resend) (13s)
    scene05: { start: 1470, duration: 390 }, // Intelligent Wallet Extraction (13s)
    scene06: { start: 1860, duration: 630 }, // NEAR Technology Stack Hero Architecture (21s)
    scene07: { start: 2490, duration: 330 }, // Payout Success on Aurora (11s)
    scene08: { start: 2820, duration: 180 }, // The Closing (6s)
  },
};
