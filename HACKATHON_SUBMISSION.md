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
- **Demo Video**: [https://youtu.be/payfold-demo](https://youtu.be/payfold-demo) *(link placeholder to be updated)*

## 2. The Problem & Solution
- **The Problem**: Hackathons, grant programs, and DAO bounties lose weeks manually collecting winner wallet addresses through Google Forms and spreadsheets, chasing email threads, verifying identities, and executing individual wallet transfers.
- **The Solution**: PayFold automates the entire payout lifecycle. The organizer announces the winner and places prize funds in escrow. An AI agent emails the winner, intelligently extracts their wallet address from natural language replies, and triggers a NEAR Chain Signature (MPC) smart contract call to release funds on Aurora/Ethereum.
- **Brand & Interface**: Featuring the official geometric PayFold card-fold emblem, high-performance scroll-reveal transitions, and clean non-custodial architecture.
- **NEAR's Concrete Role**:
  - **NEAR Chain Signatures (MPC)**: Deterministically derives hackathon escrow addresses and executes cross-chain transfers without managing hot private keys.
  - **Phala Cloud / TEE Integration**: Runs autonomous agent logic inside a confidential virtual machine (DStack / TDX) ensuring tamper-proof payout decisions.

## 3. Machine-Readable "Do X - See Y" Verification
1. **Do**: `yarn test`
   - **See**: 9 tests passing across data schema, decimal precision, branding assets, AI providers, email simulation, vault queries, and zero-emoji typography enforcement.
2. **Do**: `yarn build`
   - **See**: Next.js production build completes with all static and dynamic routes compiled.
3. **Do**: `yarn dev`
   - **See**: Web application serves on `http://localhost:3000` with RainbowKit wallet connect, Announce Winner console, and interactive NEAR Chain Signatures Live Playground.
4. **Do**: `POST /api/getHackathonId` with `{"hackathonName": "Near AI Hackathon"}`
   - **See**: JSON response `{"hackathonId": 0}` from local ledger.
5. **Do**: `GET /api/getHackathons`
   - **See**: JSON response listing all hackathon vaults, escrow addresses, and winner settlement statuses.
6. **Do**: `POST /api/webhook` with `{"sender": "lakshayld26@gmail.com", "text": "Here is my Aurora address: 0x71C8452f483FEfA834165dC65f57B8b71569B148"}`
   - **See**: Autonomous settlement completed with `nearDetails` showing `lakshay-payfold.testnet` and `v1.signer-prod.testnet` threshold MPC co-signing.

