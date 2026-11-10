# PayFold 💳

> **Autonomous Hackathon Prize Distribution & Web3 Payout Automation Platform**  
> *Developed & Maintained by **Lakshay Deol** (<lakshayld26@gmail.com>)*

---

## 🌟 Overview

**PayFold** is a decentralized, autonomous payout execution system designed for hackathon organizers, grant programs, and Web3 event managers. It eliminates the manual friction of collecting wallet addresses, validating recipients, and sending prize payouts one-by-one.

With PayFold:
1. **Organizers Announce Winners**: Connect a Web3 wallet (via RainbowKit/Wagmi on Aurora/Sepolia) and enter hackathon winner details (Winner Name, Email, Prize Amount, Place, and Track).
2. **Autonomous Email Outreach**: PayFold's backend integrates OpenAI and Composio (Gmail) to automatically compose and send a personalized congratulatory email to the winner, requesting their payout wallet address.
3. **Smart Inbound Webhook**: When the winner replies via email, PayFold parses their wallet address using AI-driven extraction.
4. **Verifiable Autonomous Payout**: PayFold triggers an on-chain transaction via NEAR Chain Signatures (MPC) and Phala TEE (Trusted Execution Environment) to distribute funds securely to the verified winner's address on Aurora/Ethereum.
5. **Instant Confirmation**: PayFold updates its ledger and sends a follow-up email with the on-chain explorer transaction link.

---

## 🏗️ Architecture

```
                                  +---------------------------+
                                  |     PayFold Frontend      |
                                  | (Next.js 14, Wagmi, viem) |
                                  +-------------+-------------+
                                                |
                       1. Announce Winner       |  2. Deposit & Register
                          & Winner Form         v
                                  +-------------+-------------+
                                  |     PayFold API Engine    |
                                  |   (Next.js Serverless)    |
                                  +------+--------------+-----+
                                         |              |
                3. Send AI Email Outreach|              | 4. Derive Hackathon Address
                                         v              v
               +---------------------------+    +----------------------------+
               |   OpenAI + Composio       |    | NEAR Chain Signatures /    |
               |   (Gmail Toolset)         |    | Shade Agent MPC (EVM)      |
               +-------------+-------------+    +--------------+-------------+
                             |                                 |
              5. Winner email|                                 |
                 reply       v                                 |
               +---------------------------+                   |
               | PayFold Webhook Processor |                   | 6. Sign & Distribute
               |  (AI Address Extraction)  |-------------------+    Prize On-Chain
               +-------------+-------------+                   |
                             |                                 v
                             |                    +---------------------------+
                             +------------------->| Aurora / EVM Blockchain   |
                              7. Confirmation Tx  +---------------------------+
```

---

## 🚀 Key Features & Inherited Improvements

- **Web3 Wallet Connectivity**: Intuitive connection via RainbowKit and Wagmi with support for Aurora, Sepolia, and EVM networks.
- **Autonomous Address Collection**: Replaces tedious spreadsheets and forms with conversational, AI-driven email workflows.
- **NEAR Chain Signature Integration**: Uses decentralized MPC keys to derive hackathon escrow addresses and sign transactions without exposing private keys.
- **Confidential Computing (TEE)**: Compatible with Phala Cloud DStack/TDX confidential virtual machines for tamper-proof execution.
- **Audit Ledger**: Local persistent JSON ledger (`data.json`) tracking hackathons, winners, email statuses, and on-chain transaction hashes.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (Pages Router), React 18, RainbowKit, Wagmi, Viem, Ethers.js v6
- **Styling**: CSS Modules, responsive Web3 glassmorphism design
- **AI & Automation**: OpenAI API (GPT-4 / GPT-3.5-Turbo), Composio Core SDK (Gmail toolset)
- **Decentralized Infrastructure**: NEAR Protocol Chain Signatures (`chainsig.js`), `@neardefi/shade-agent-js`
- **Deployment**: Docker, Docker Compose, Phala Cloud CVM

---

## ⚙️ Environment Configuration

Create a `.env.development.local` file in the root directory (based on `.env.development.local.example`):

```bash
# NEAR Configuration for Chain Signatures / MPC
NEAR_ACCOUNT_ID=your-account.testnet
NEAR_SEED_PHRASE="your twelve word seed phrase here"

# Contract Configuration (ac-proxy for local, ac-sandbox for Phala Cloud)
NEXT_PUBLIC_contractId=ac-proxy.your-account.testnet

# Shade Agent API Configuration
API_CODEHASH=ec43db0f65f8e05937df2a5810931e6d9f491c5df34013b8f9838129c32a3fcf
APP_CODEHASH=f6552a63eddc6c8d0c78e76461e8be427711b23d429fd130d2b49d114dc695a4

# AI & Automation Credentials
OPENAI_API_KEY=your_openai_api_key
COMPOSIO_API_KEY=your_composio_api_key

# Optional: Custom EVM RPC
ETHEREUM_RPC_URL=https://1rpc.io/aurora

# Phala Cloud Deployment (Optional)
DOCKER_TAG=your_dockerhub_user/payfold
PHALA_API_KEY=your_phala_cloud_api_key
```

---

## 📦 Getting Started

### 1. Prerequisites
- **Node.js**: v18.0.0+ (v20+ recommended)
- **Yarn**: Yarn 4 Berry (configured via `.yarnrc.yml` and `.yarn/releases`)

### 2. Install Dependencies
```bash
yarn install
```

### 3. Start Development Server
```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
yarn build
```

---

## 📜 License

Licensed under the Apache License, Version 2.0. See [LICENSE](LICENSE) for details.

**Author**: Lakshay Deol (<lakshayld26@gmail.com>)
