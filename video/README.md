# PayFold Cinematic Pitch Video (Remotion)

A production-quality 100-second (3000 frames @ 30 FPS, 1920x1080) cinematic product launch film for **PayFold**, built for **NEAR HACKATHON 2026**.

## Story & Narrative Flow

1. **Scene 01 — The Problem (Rob's Hackathon Nightmare)** `[0s – 12s, 360 frames]`
   - Deep atmospheric opening: *"YOU WON. NOW WHERE'S YOUR PRIZE?"*
   - Rob, the Hackathon Organizer: 50+ winners across 12 timezones, 34 missing wallet addresses.
   - Chaotic spreadsheets, Telegram/Discord DM chases, typo hazards, and weeks of payout delays.
2. **Scene 02 — PayFold Introduction** `[12s – 22s, 300 frames]`
   - Center PayFold logo reveal with purple/crimson light sweep.
   - Glowing horizontal payment rail traveling across the screen.
   - *"PAYFOLD: Autonomous Hackathon Payouts &bull; From winner announcement to on-chain settlement."*
3. **Scene 03 — Organizer Dashboard (Escrow Lock)** `[22s – 36s, 420 frames]`
   - High-fidelity dark glassmorphic PayFold dashboard.
   - Connected organizer wallet (`0xRob...9214`).
   - Winner announcement for Lakshay (1st Place, Agent Economy, 0.5 ETH).
   - Animated cursor clicking *"Lock Escrow & Trigger AI Outreach"*.
   - Non-custodial lock: Funds deposited safely into `PayFoldEscrow.sol` on Aurora EVM.
4. **Scene 04 — AI-Powered Winner Outreach** `[36s – 49s, 390 frames]`
   - Personalized congratulatory email automatically crafted by Google Gemini.
   - Dispatched immediately via Resend API.
   - Dynamic typing animation prompting winner to reply with their EVM address.
5. **Scene 05 — Intelligent Wallet Extraction** `[49s – 62s, 390 frames]`
   - Natural language email reply received from winner Lakshay.
   - Address `0x71C8452f483FEfA834165dC65f57B8b71569B148` highlighted with glowing neon beam.
   - 3 Automated Checkpoints:
     1. Address Extracted
     2. EIP-55 Format Validated
     3. Recipient Matched to Escrow Lock
   - Status: *"READY FOR AUTONOMOUS EXECUTION"*.
6. **Scene 06 — The NEAR Hero Architecture** `[62s – 83s, 630 frames]`
   - Three-layer interconnected architecture:
     - **Center**: PayFold Autonomous Agent (Decentralized Orchestrator).
     - **Node 1**: NEAR Chain Signatures (MPC Threshold Signing via `v1.signer-prod.testnet`).
     - **Node 2**: Shade Agent + Phala TEE (Confidential execution inside Intel TDX enclave).
     - **Node 3**: Aurora EVM (On-chain smart contract settlement with 1-second finality).
   - Core guarantee: *"NO EVM PRIVATE KEY STORED ON THE APPLICATION SERVER"*.
7. **Scene 07 — Payout Success** `[83s – 94s, 330 frames]`
   - Golden transaction particle flows along the rail:
     `ORGANIZER ESCROW → NEAR MPC SIGNING → AURORA EVM → WINNER WALLET`.
   - Revealed premium fintech receipt card: 0.5 ETH Confirmed on Aurora Testnet Explorer.
   - Automated delivery confirmation emailed to winner.
8. **Scene 08 — The Closing** `[94s – 100s, 180 frames]`
   - PayFold logo enclosed in an orbiting circular payment rail.
   - Triple punchline: *"ANNOUNCE. AUTOMATE. DISTRIBUTE."*
   - Payoff: *"Autonomous payouts. Powered by NEAR."*
   - Credential: *"Built for NEAR HACKATHON 2026 &bull; Developed by Lakshay Deol"*.

---

## Technical Specifications

- **Framework**: Remotion 4.x with React & TypeScript
- **Resolution**: 1920 x 1080 (16:9 Full HD)
- **Frame Rate**: 30 FPS
- **Duration**: 3000 frames (100.00 seconds)
- **Renderer**: Headless Chromium (Angle / Skia) + FFmpeg H.264
- **Color Palette**:
  - Background: `#08090D`
  - Secondary: `#10121B`
  - Primary Violet: `#8B5CF6`
  - Electric Purple: `#A78BFA`
  - PayFold Crimson: `#E51E2B`
  - Gold: `#E8B45A`
  - Success Green: `#37D99B`

---

## Commands

```bash
# Enter video workspace
cd video

# Interactive Remotion Studio preview
npm run dev

# Render production MP4
npm run build
```

Rendered video artifact: `public/PayFold-Pitch.mp4`
