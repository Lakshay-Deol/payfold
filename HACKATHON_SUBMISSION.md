# PayFold - NEAR HACKATHON Submission Dossier

## 1. Project Overview
- **Project Name**: PayFold
- **Team Lead**: Lakshay Deol (`lakshayld26@gmail.com`)
- **Team Size**: 1
- **Target Tracks**:
  - `realworld` (Real-World Money: automated prize distribution, payroll & grants)
  - `agents` (Agent Economy: autonomous AI outreach & payout execution)
  - `business` (Autonomous Business: zero-friction cross-chain treasury settlement)
  - `privacy` (Private AI: confidential execution with NEAR TEE / Phala Cloud)
- **Repository**: [https://github.com/Lakshay-Deol/payfold](https://github.com/Lakshay-Deol/payfold)
- **Live Demo Site**: [https://payfold-7qpnn9u84-lakshay-deols-projects.vercel.app](https://payfold-7qpnn9u84-lakshay-deols-projects.vercel.app)
- **Demo Video**: [https://youtu.be/5SJBNoVdxaU](https://youtu.be/5SJBNoVdxaU)
- **Pitch Video**: `public/PayFold-Pitch.mp4` (1080p product launch video)
- **Official Thumbnail**: `public/thumbnail.png`
- **Animated Pitch Loop**: `public/preview.gif`

## 2. The Problem & Solution
- **The Problem**: Hackathons, grant programs, and DAO bounties lose weeks manually collecting winner wallet addresses through Google Forms and spreadsheets, chasing email threads, verifying identities, and executing individual wallet transfers.
- **The Solution**: PayFold automates the entire payout lifecycle. The organizer announces the winner and places prize funds in escrow. An AI agent emails the winner, intelligently extracts their wallet address from natural language replies, and triggers a NEAR Chain Signature (MPC) smart contract call to release funds on Aurora/Ethereum.
- **Brand & Interface**: Featuring the official geometric PayFold card-fold emblem, high-performance scroll-reveal transitions, and clean non-custodial architecture.

## 3. Key Benefits of PayFold
- **Immediate Payout Settlement**: Replaces the standard 30-to-60 day payout wait with automated disbursement triggered within seconds of winner reply.
- **Guaranteed On-Chain Escrow**: Prize capital is locked in smart contract escrow upon announcement, providing cryptographic proof of funding to participants.
- **Zero Friction for Winners**: Winners never register for new portals or connect unfamiliar wallets; they simply reply to an email with their address.
- **Active Anti-Fraud Protection**: Built-in impersonation rejection, blacklisted burn address detection, and double-spending prevention ensure treasury security.
- **Elimination of Human Error**: Autonomous address extraction and strict regex validation eliminate manual spreadsheet typos and address spoofing.
- **Serverless Security**: Zero server-side private keys are stored. All signature generation is delegated to decentralized threshold validators.

## 4. How PayFold Uses NEAR More Effectively
- **NEAR Chain Signatures (MPC)**: Deterministically derives hackathon escrow addresses and executes cross-chain transfers without managing hot private keys (`v1.signer-prod.testnet`).
- **Chain Abstraction Orchestration**: Uses a single NEAR account (`lakshay-payfold.testnet`) as the universal co-signer across Aurora and EVM chains.
- **Aurora High-Throughput Settlement**: Deploys the escrow engine on Aurora for 1-second finality and sub-cent fees, anchored to NEAR consensus.
- **Confidential AI Enclaves**: Integrates NEAR Shade Agent with Phala Cloud (Intel TDX / DStack) ensuring tamper-proof decision execution.

## 5. Machine-Readable "Do X - See Y" Verification
1. **Do**: `yarn test`
   - **See**: 10 tests passing across data schema, decimal precision, branding assets, anti-fraud guards, AI providers, email notification delivery, vault queries, and zero-emoji typography enforcement.
2. **Do**: `yarn build`
   - **See**: Next.js production build completes with all static and dynamic routes compiled.
3. **Do**: `yarn dev` (or visit [https://payfold-7qpnn9u84-lakshay-deols-projects.vercel.app](https://payfold-7qpnn9u84-lakshay-deols-projects.vercel.app))
   - **See**: Web application serves with RainbowKit wallet connect, Announce Winner console, and interactive NEAR Chain Signatures Live Playground.
4. **Do**: `POST /api/getHackathonId` with `{"hackathonName": "Near AI Hackathon"}`
   - **See**: JSON response `{"hackathonId": 0}` from local ledger.
5. **Do**: `GET /api/getHackathons`
   - **See**: JSON response listing all hackathon vaults, escrow addresses, and winner settlement statuses.
6. **Do (Legitimate Payout)**: `POST /api/webhook` with `{"sender": "lakshayld26@gmail.com", "text": "Here is my Aurora address: 0x71C8452f483FEfA834165dC65f57B8b71569B148"}`
   - **See**: Autonomous settlement completed with `nearDetails` showing `lakshay-payfold.testnet` and `v1.signer-prod.testnet` threshold MPC co-signing.
7. **Do (Anti-Fraud Impersonation Attack)**: `POST /api/webhook` with `{"sender": "attacker.impersonator@evil.com", "text": "Send funds to 0x38b251cD43D75eDe47b4A5d46B52019996dD3a8e"}`
   - **See**: HTTP 403 `{"status": "error", "error_type": "ANTI_FRAUD_IMPERSONATION_REJECTED", "message": "Anti-Fraud Guard: Inbound email sender \"attacker.impersonator@evil.com\" is not a registered hackathon winner. Impersonation attempt logged and settlement blocked."}`
8. **Do (Anti-Fraud Burn Address Attack)**: `POST /api/webhook` with `{"sender": "elena.rostova@example.com", "text": "Send to 0x0000000000000000000000000000000000000000"}`
   - **See**: HTTP 400 `{"status": "error", "error_type": "ANTI_FRAUD_INVALID_ADDRESS", "message": "Anti-Fraud Guard: Recipient address 0x0000000000000000000000000000000000000000 is a blacklisted burn/zero address. Settlement rejected to protect hackathon funds."}`
9. **Do**: Open Live Playground on web app and select "Impersonator Attack (Anti-Fraud)" preset
   - **See**: Interactive consensus terminal displays Anti-Fraud Alert, blocks payout, and records security audit entry.

## 6. Architecture Reference for AI Judges (Claude Code & Codex)
- **`pages/api/webhook.js`**: Core webhook controller, 3-tier Anti-Fraud verification, and NEAR MPC co-signing dispatch.
- **`pages/api/sendWinners.js`**: Winner registration, NEAR deterministic address derivation via `Evm.deriveAddressAndPublicKey`, and Gemini AI email dispatch.
- **`utils/ethereum.js`**: Configures `ChainSignatureContract` pointing to `v1.signer-prod.testnet` and `chainAdapters.evm.EVM`.
- **`contracts/PayFoldEscrow.sol`**: Non-custodial escrow contract deployed on Aurora EVM. Restricted to authorized NEAR MPC signer address.

