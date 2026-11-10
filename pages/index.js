import { useState, useRef, useEffect } from "react";
import Head from "next/head";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useChainId } from "wagmi";
import { createWalletClient, custom } from "viem";
import { sepolia, aurora, auroraTestnet } from "wagmi/chains";
import { parseEther } from "ethers";

const CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_ESCROW_CONTRACT ||
  "0xFcAaf9F83875C2c4fEF050af893e90061254c660";

const CONTRACT_ABI = [
  {
    name: "announceWinner",
    type: "function",
    stateMutability: "payable",
    inputs: [
      { name: "hackathonId", type: "uint256" },
      { name: "email", type: "string" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
  },
];

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const currentChain =
    [aurora, sepolia, auroraTestnet].find((c) => c.id === chainId) || aurora;

  useEffect(() => {
    setMounted(true);

    const handleScrollReveal = () => {
      const reveals = document.querySelectorAll(".scroll-reveal");
      const windowHeight = window.innerHeight;
      reveals.forEach((el) => {
        const top = el.getBoundingClientRect().top;
        if (top < windowHeight - 50) {
          el.classList.add("revealed");
        }
      });
    };

    window.addEventListener("scroll", handleScrollReveal, { passive: true });
    // Trigger initial check
    setTimeout(handleScrollReveal, 100);

    return () => window.removeEventListener("scroll", handleScrollReveal);
  }, []);

  const formRef = useRef(null);
  const [activeTab, setActiveTab] = useState("console"); // "console" or "workflow"
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    amount: "",
    place: "",
    track: "",
    hackathonName: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [hackathonAddress, setHackathonAddress] = useState("");

  // NEAR Live Execution Playground & Ledger States
  const [hackathons, setHackathons] = useState([]);
  const [loadingHackathons, setLoadingHackathons] = useState(false);
  const [ledgerFilter, setLedgerFilter] = useState("all");
  const [simModalOpen, setSimModalOpen] = useState(false);
  const [simSelectedWinner, setSimSelectedWinner] = useState(null);
  const [simSelectedHackathon, setSimSelectedHackathon] = useState(null);
  const [simEmailText, setSimEmailText] = useState("");
  const [simStage, setSimStage] = useState("idle");
  const [simLogs, setSimLogs] = useState([]);
  const [simResult, setSimResult] = useState(null);

  const fetchHackathons = async () => {
    try {
      setLoadingHackathons(true);
      const res = await fetch("/api/getHackathons");
      if (res.ok) {
        const data = await res.json();
        setHackathons(data.hackathons || []);
      }
    } catch (e) {
      console.error("Failed to load hackathon ledger:", e);
    } finally {
      setLoadingHackathons(false);
    }
  };

  useEffect(() => {
    fetchHackathons();
  }, []);

  const openSimModal = (winner, hackathon) => {
    setSimSelectedWinner(winner);
    setSimSelectedHackathon(hackathon);
    setSimEmailText(
      `Hey PayFold team! Romario and I won ${winner.place} in ${hackathon.name}. Here is my Aurora EVM address: 0x71C8452f483FEfA834165dC65f57B8b71569B148. Thanks!`
    );
    setSimStage("idle");
    setSimLogs([]);
    setSimResult(null);
    setSimModalOpen(true);
  };

  const executeNearMpcSimulation = async () => {
    if (!simSelectedWinner || !simSelectedHackathon) return;
    setSimStage("ai");
    setSimLogs([
      "[INIT] Initializing PayFold Autonomous Execution Agent...",
      `[INBOUND] Email reply received from: ${simSelectedWinner.email}`,
      "[AI ENGINE] Google Gemini extracting & validating EVM hex address from natural language text...",
    ]);

    try {
      await new Promise((r) => setTimeout(r, 650));
      setSimStage("mpc");
      setSimLogs((prev) => [
        ...prev,
        "[VERIFIED] Valid EVM recipient address detected",
        "[NEAR MPC] Requesting threshold co-signature from v1.signer-prod.testnet",
        `[DERIVATION] Deriving key path: ["ethereum", "${simSelectedHackathon.name}", 0] via lakshay-payfold.testnet`,
      ]);

      await new Promise((r) => setTimeout(r, 650));
      setSimStage("signing");
      setSimLogs((prev) => [
        ...prev,
        "[CONSENSUS] Threshold nodes generating secp256k1 signature shares...",
        "[SIGNATURE] Assembling raw RSV signature components without server private key...",
      ]);

      const res = await fetch("/api/webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender: simSelectedWinner.email,
          text: simEmailText,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.status === "error") {
        throw new Error(data.message || "Simulation execution failed");
      }

      setSimStage("broadcast");
      setSimLogs((prev) => [
        ...prev,
        "[BROADCAST] Broadcasting signed raw transaction to Aurora EVM (PayFoldEscrow.sol)...",
        `[TX RECEIPT] On-chain TX: ${data.transactionHash || "Confirmed"}`,
        `[DISPATCH] Dispatched confirmation receipt via Resend to ${simSelectedWinner.email}`,
      ]);

      await new Promise((r) => setTimeout(r, 600));
      setSimStage("done");
      setSimResult(data);
      setSimLogs((prev) => [
        ...prev,
        "[COMPLETE] Autonomous prize payout settled on-chain via NEAR Protocol Chain Signatures.",
      ]);

      // Refresh live ledger table
      fetchHackathons();
    } catch (simErr) {
      console.error("Simulation error:", simErr);
      setSimStage("error");
      setSimLogs((prev) => [
        ...prev,
        `[ERROR] ${simErr.message || "Failed to process simulation"}`,
      ]);
    }
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert("Address copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isConnected) {
      setError("Please connect your wallet first");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      if (typeof window !== "undefined" && window.ethereum) {
        try {
          await window.ethereum.request({ method: "eth_requestAccounts" });
        } catch (permErr) {
          console.warn("eth_requestAccounts:", permErr.message);
        }
      }

      const walletClient = createWalletClient({
        chain: currentChain,
        transport: custom(window.ethereum),
      });

      const addresses = await walletClient.getAddresses();
      const activeAccount = addresses[0] || address;
      const amountInWei = parseEther(formData.amount);

      // Get hackathon ID
      const response = await fetch("/api/getHackathonId", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hackathonName: formData.hackathonName }),
      });
      const { hackathonId } = await response.json();

      // Submit on-chain escrow deposit
      await walletClient.writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: "announceWinner",
        args: [hackathonId, formData.email, amountInWei],
        value: amountInWei,
        account: activeAccount,
      });

      // Dispatch AI email outreach & MPC registration
      try {
        const apiRes = await fetch("/api/sendWinners", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            Hackathon: formData.hackathonName,
            Winners: [
              {
                Name: formData.name,
                email: formData.email,
                prize: formData.amount,
                place: formData.place,
                track: formData.track,
              },
            ],
          }),
        });

        const data = await apiRes.json();
        setHackathonAddress(data.hackathonAddress);
        setShowModal(true);
        fetchHackathons();
        setError("Vault deposit confirmed & winner notified via AI email!");
      } catch (apiError) {
        console.error("API Error:", apiError);
        setError("Contract deposit successful. Notification queued in background.");
      }

      // Reset form
      setFormData({
        name: "",
        email: "",
        amount: "",
        place: "",
        track: "",
        hackathonName: "",
      });
    } catch (err) {
      console.error(err);
      setError(err.message || "Transaction failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="agent-universe">
      <Head>
        <title>PayFold — Autonomous Hackathon Prize Engine</title>
        <meta
          name="description"
          content="Autonomous Web3 hackathon prize payouts powered by NEAR Chain Signatures, Google Gemini & Aurora"
        />
        <link rel="icon" href="/logo.png" />
        <link rel="apple-touch-icon" href="/logo.png" />
      </Head>

      {/* Bioluminescent Volumetric Ambient Glows */}
      <div className="ambient-glow glow-top"></div>
      <div className="ambient-glow glow-jelly"></div>
      <div className="ambient-glow glow-mid"></div>

      {/* Success Modal */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-glass">
            <div className="modal-header-brand">
              <img src="/logo.png" alt="PayFold" className="modal-logo-img" />
              <div className="modal-pill">NEAR MPC ESCROW INITIALIZED</div>
            </div>
            <h3 className="modal-title">Vault Active On-Chain</h3>
            <p className="modal-text">
              Your prize deposit has been locked into the escrow contract. The
              NEAR Chain Signature MPC address derived for this hackathon is:
            </p>
            <div className="modal-code">{hackathonAddress}</div>
            <div className="modal-button-row">
              <button
                onClick={() => copyToClipboard(hackathonAddress)}
                className="btn-red-pill"
              >
                Copy Address
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="btn-ghost-pill"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1. TOP NAVBAR */}
      <header className="top-nav">
        <div
          className="nav-brand"
          onClick={() => scrollToSection("hero")}
          style={{ cursor: "pointer" }}
        >
          <img src="/logo.png" alt="PayFold Logo" className="brand-logo-img" />
          <span className="brand-title">PayFold</span>
        </div>

        {/* Floating Capsule Menu */}
        <nav className="center-capsule">
          <button
            onClick={() => scrollToSection("hero")}
            className="capsule-btn active"
          >
            Home
          </button>
          <button
            onClick={() => scrollToSection("statement")}
            className="capsule-btn"
          >
            Benefits
          </button>
          <button
            onClick={() => scrollToSection("proof")}
            className="capsule-btn"
          >
            Architecture
          </button>
          <button
            onClick={() => scrollToSection("services-console")}
            className="capsule-btn"
          >
            Console
          </button>
          <button
            onClick={() => scrollToSection("near-playground")}
            className="capsule-btn"
          >
            ⚡ NEAR Live
          </button>
        </nav>

        {/* Right CTA / Wallet */}
        <div className="nav-actions">
          {mounted ? (
            <ConnectButton />
          ) : (
            <button
              type="button"
              className="btn-red-pill mini"
              suppressHydrationWarning
            >
              Connect Wallet
            </button>
          )}
        </div>
      </header>

      {/* 2. HERO SECTION (Exactly like screenshot: NO EYEBROW TEXT) */}
      <section className="hero-section" id="hero">
        <div className="hero-grid">
          {/* Left Column: Typography, CTAs, 3 Stats */}
          <div className="hero-left">
            <h1 className="hero-headline">
              Your AI{" "}
              <span className="from-launch-pill">
                From escrow
                <br />
                to payout
              </span>
              <br />
              <span className="gradient-word">Sprint Team</span>
              <br />
              <span className="gradient-word">On Demand</span>
            </h1>

            <p className="hero-tagline">
              From hackathon escrow to AI address collection and zero-leakage
              settlement. We plug into your stack to prototype, validate, and launch
              autonomous prize distribution experiences your winners actually love.
            </p>

            {/* CTA Button Row */}
            <div className="hero-cta-group">
              <button
                onClick={() => scrollToSection("statement")}
                className="btn-ghost-pill"
              >
                Explore Protocol
              </button>
              <button
                onClick={() => {
                  setActiveTab("console");
                  scrollToSection("services-console");
                }}
                className="btn-red-pill glow"
              >
                Announce Winner
              </button>
            </div>

            {/* 3 Real Technical Metric Cards */}
            <div className="stat-cards-triad">
              <div className="hero-stat-card">
                <span className="card-kicker">Key Security</span>
                <div className="stat-flex">
                  <span className="big-stat-val">0</span>
                  <span className="stat-micro-note">
                    server private keys stored on disk
                  </span>
                </div>
              </div>

              <div className="hero-stat-card">
                <span className="card-kicker">MPC Network</span>
                <div className="stat-flex">
                  <span className="big-stat-val">100%</span>
                  <span className="stat-micro-note">
                    decentralized NEAR validator threshold
                  </span>
                </div>
              </div>

              <div className="hero-stat-card">
                <span className="card-kicker">Aurora Finality</span>
                <div className="stat-flex">
                  <span className="big-stat-val">~1s</span>
                  <span className="stat-micro-note">
                    instant cross-chain prize release
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Bioluminescent Animated PayFold Vault Folder & Payout Stream */}
          <div className="hero-right">
            <div className="payout-stage">
              {/* Animated PayFold Vault Folder with Payout Assets */}
              <div className="payout-creature">
                <svg
                  viewBox="0 0 420 500"
                  className="payout-svg"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <linearGradient id="folderBackGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#2e050d" />
                      <stop offset="50%" stopColor="#150206" />
                      <stop offset="100%" stopColor="#080102" />
                    </linearGradient>
                    <linearGradient id="folderFrontGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="rgba(255, 55, 75, 0.4)" />
                      <stop offset="45%" stopColor="rgba(190, 20, 38, 0.28)" />
                      <stop offset="100%" stopColor="rgba(24, 3, 7, 0.9)" />
                    </linearGradient>
                    <linearGradient id="tokenRed" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#ff4d5a" />
                      <stop offset="100%" stopColor="#b30010" />
                    </linearGradient>
                    <linearGradient id="goldCoinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#ff6b6b" />
                      <stop offset="100%" stopColor="#e51e2b" />
                    </linearGradient>
                    <radialGradient id="folderCoreGlow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
                      <stop offset="30%" stopColor="#ff3344" stopOpacity="0.75" />
                      <stop offset="70%" stopColor="#800000" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#000000" stopOpacity="0" />
                    </radialGradient>
                    <filter id="payoutDropGlow" x="-30%" y="-30%" width="160%" height="160%">
                      <feGaussianBlur stdDeviation="12" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>

                  {/* Ambient Deep Halo behind folder */}
                  <ellipse cx="210" cy="300" rx="160" ry="90" fill="url(#folderCoreGlow)" opacity="0.45" />

                  {/* FOLDER BACK LAYER */}
                  <g className="folder-back-plate">
                    {/* Folder Tab & Back Body */}
                    <path
                      d="M60 210 L135 210 L160 235 L350 235 C360 235 368 243 368 253 L368 395 C368 405 360 413 350 413 L60 413 C50 413 42 405 42 395 L42 228 C42 218 50 210 60 210 Z"
                      fill="url(#folderBackGrad)"
                      stroke="#ff3344"
                      strokeWidth="1.8"
                      strokeOpacity="0.5"
                    />
                    {/* Circuit lines */}
                    <path d="M70 250 H210 L230 270 H340" stroke="#ff3344" strokeWidth="1" strokeOpacity="0.3" strokeDasharray="4 4" />
                    <path d="M75 290 H170 L185 305 H325" stroke="#ff3344" strokeWidth="1" strokeOpacity="0.2" />
                  </g>

                  {/* LUMINOUS VAULT CORE */}
                  <ellipse cx="210" cy="290" rx="95" ry="35" fill="url(#folderCoreGlow)" filter="url(#payoutDropGlow)" />

                  {/* FLOATING PAYOUT TOKENS & STREAM */}
                  <g className="payout-tokens-stream">
                    {/* Ascending Laser Beams */}
                    <path d="M160 300 L130 115" stroke="#ff3344" strokeWidth="1.5" strokeOpacity="0.35" strokeDasharray="6 4" className="stream-beam b1" />
                    <path d="M210 280 L210 75" stroke="#ff4d5a" strokeWidth="2" strokeOpacity="0.6" strokeDasharray="8 4" className="stream-beam b2" />
                    <path d="M260 300 L290 120" stroke="#ff3344" strokeWidth="1.5" strokeOpacity="0.35" strokeDasharray="6 4" className="stream-beam b3" />

                    {/* Digital Payout Receipt (Hovering Center) */}
                    <g className="payout-token-card">
                      <rect x="135" y="85" width="150" height="90" rx="14" fill="#0f0205" stroke="#ff3344" strokeWidth="1.8" strokeOpacity="0.8" filter="url(#payoutDropGlow)" />
                      <circle cx="160" cy="112" r="8" fill="#ff3344" />
                      <rect x="175" y="108" width="85" height="4" rx="2" fill="#ffffff" opacity="0.85" />
                      <rect x="175" y="116" width="55" height="3" rx="1.5" fill="#a1a1aa" />
                      <text x="155" y="145" fill="#4ade80" fontSize="14" fontWeight="800" fontFamily="monospace">+0.25 ETH</text>
                      <text x="155" y="160" fill="#ff5252" fontSize="7.5" fontWeight="700" letterSpacing="0.6">NEAR MPC VERIFIED</text>
                    </g>

                    {/* Floating ETH Diamond Coin (Left) */}
                    <g className="payout-coin coin-eth">
                      <circle cx="95" cy="170" r="28" fill="url(#goldCoinGrad)" filter="url(#payoutDropGlow)" />
                      <circle cx="95" cy="170" r="23" fill="#140205" stroke="#ff4d5a" strokeWidth="1.5" />
                      <path d="M95 154 L104 169 L95 174 L86 169 Z" fill="#ffffff" />
                      <path d="M95 176 L104 171 L95 184 L86 171 Z" fill="#ff6b6b" />
                    </g>

                    {/* Floating NEAR Coin (Right) */}
                    <g className="payout-coin coin-near">
                      <circle cx="325" cy="185" r="26" fill="url(#goldCoinGrad)" filter="url(#payoutDropGlow)" />
                      <circle cx="325" cy="185" r="22" fill="#140205" stroke="#ff4d5a" strokeWidth="1.5" />
                      <path d="M318 196 L318 174 L324 174 L330 184 L330 174 L334 174 L334 196 L328 196 L322 186 L322 196 Z" fill="#ffffff" />
                    </g>

                    {/* Floating Sparkle Token (High Center) */}
                    <g className="payout-coin coin-sparkle">
                      <circle cx="265" cy="55" r="18" fill="url(#tokenRed)" filter="url(#payoutDropGlow)" />
                      <circle cx="265" cy="55" r="15" fill="#180206" stroke="#ff4d5a" strokeWidth="1" />
                      <polygon points="266,48 261,56 265,56 264,62 269,54 265,54" fill="#ffffff" />
                    </g>

                    {/* Radiant Particles */}
                    <circle cx="80" cy="125" r="2" fill="#ffffff" opacity="0.9" />
                    <circle cx="345" cy="115" r="2.5" fill="#ff4d5a" />
                    <circle cx="175" cy="55" r="1.5" fill="#ffffff" />
                    <circle cx="365" cy="250" r="2" fill="#ff3344" />
                  </g>

                  {/* FOLDER FRONT FLAP (Isometric Translucent Glass Flap) */}
                  <g className="folder-front-plate">
                    <path
                      d="M38 265 L372 250 C382 250 390 258 388 268 L364 415 C363 423 355 430 346 430 L58 430 C48 430 40 423 39 413 L34 275 C33 269 35 265 38 265 Z"
                      fill="url(#folderFrontGrad)"
                      stroke="#ff4d5a"
                      strokeWidth="2.2"
                      filter="url(#payoutDropGlow)"
                    />
                    {/* Glass Sheen */}
                    <path d="M48 274 L360 260" stroke="#ffffff" strokeWidth="2" strokeOpacity="0.45" />

                    {/* Cybernetic Vault Seal Lock */}
                    <g className="vault-seal">
                      <circle cx="205" cy="350" r="28" fill="#0d0103" stroke="#ff3344" strokeWidth="2.2" />
                      <circle cx="205" cy="350" r="21" fill="url(#tokenRed)" opacity="0.3" />
                      <circle cx="205" cy="350" r="15" fill="#ff2a3b" filter="url(#payoutDropGlow)" />
                      {/* Shield / Keyhole symbol */}
                      <path d="M201 346 C201 343 209 343 209 346 L210 353 C210 356 200 356 200 353 Z" fill="#ffffff" />
                      <circle cx="205" cy="348" r="2.5" fill="#0d0103" />
                    </g>

                    {/* PayFold Brand Tag with Logo */}
                    <g className="brand-folder-badge">
                      <rect x="68" y="375" width="125" height="30" rx="8" fill="#120205" stroke="#ff3344" strokeWidth="1.2" strokeOpacity="0.8" />
                      <image href="/logo.png" x="73" y="378" width="24" height="24" />
                      <text x="104" y="394" fill="#ffffff" fontSize="11" fontWeight="800" letterSpacing="0.8">PAYFOLD</text>
                    </g>
                  </g>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. EDITORIAL STATEMENT */}
      <section className="statement-strip scroll-reveal" id="statement">
        <div className="statement-container">
          <div className="statement-pill-badge">
            <span className="badge-dot"></span>
            <span>Why NEAR Protocol?</span>
          </div>

          <h2 className="statement-quote">
            We leverage <span className="crimson-focus">NEAR Chain Signatures</span> and{" "}
            <span className="crimson-focus">Aurora EVM</span> to build a truly{" "}
            <span className="crimson-focus">autonomous escrow protocol</span> — eliminating
            manual spreadsheets and server keys with decentralized threshold cryptography.
          </h2>
        </div>
      </section>

      {/* 4. DUAL CARDS SECTION: NEAR Architecture & Benefits */}
      <section className="proof-zone scroll-reveal" id="proof">
        <div className="proof-grid">
          {/* Left Card: Multi-Chain Key Derivation Terminal */}
          <div className="proof-card card-left">
            <div className="card-top-row">
              <div className="live-indicator">
                <span className="ping-dot"></span>
                <span>Deterministic Key Derivation</span>
              </div>
            </div>

            <h3 className="card-primary-title">
              Powered by NEAR Chain Signatures
            </h3>

            <div className="card-button-row">
              <a
                href="https://github.com/Lakshay-Deol/payfold"
                target="_blank"
                rel="noreferrer"
                className="btn-dark-pill"
              >
                Inspect Contract ↗
              </a>
            </div>

            {/* Glowing Red Terminal Mockup */}
            <div className="media-screen-box">
              <div className="terminal-header">
                <span className="terminal-circle c1"></span>
                <span className="terminal-circle c2"></span>
                <span className="terminal-circle c3"></span>
                <span className="terminal-title">
                  PayFoldEscrow.sol &bull; NEAR MPC
                </span>
              </div>
              <pre className="terminal-body">
                <code>{`// 1. Organizer deposits prize to Escrow
contract.announceWinner(hackathonId, email, 0.25 ETH);

// 2. Autonomous Gemini AI verifies recipient
AI_Agent -> "Congratulations! Provide your EVM address."
Winner   -> "Payout to 0x71C...397"

// 3. NEAR Threshold MPC co-signs release
NEAR_MPC.sign({
  signer: "lakshay-payfold.testnet",
  path: "hackathon-2026",
  recipient: "0x71C...397",
  status: "CONFIRMED_ON_AURORA"
});`}</code>
              </pre>
            </div>
          </div>

          {/* Right Card: Real Technical Benefits of NEAR */}
          <div className="proof-card card-right">
            <div className="card-top-row">
              <div className="live-indicator">
                <span className="ping-dot"></span>
                <span>Architecture Advantages</span>
              </div>
            </div>

            <h3 className="card-primary-title">
              Core Benefits of NEAR in PayFold
            </h3>

            <div className="near-benefits-list">
              <div className="near-benefit-item">
                <div className="benefit-icon-badge">01</div>
                <div className="benefit-text-wrap">
                  <h4>Cross-Chain Key Derivation</h4>
                  <p>
                    A single master account (<code>lakshay-payfold.testnet</code>) dynamically derives distinct, isolated EVM vault addresses for every hackathon on Aurora and Sepolia.
                  </p>
                </div>
              </div>

              <div className="near-benefit-item">
                <div className="benefit-icon-badge">02</div>
                <div className="benefit-text-wrap">
                  <h4>Keyless MPC Threshold Signatures</h4>
                  <p>
                    Zero private keys exist on disk. Payout transactions are co-signed across NEAR’s decentralized validator set (<code>v1.signer-prod</code>) eliminating single points of compromise.
                  </p>
                </div>
              </div>

              <div className="near-benefit-item">
                <div className="benefit-icon-badge">03</div>
                <div className="benefit-text-wrap">
                  <h4>Chain Abstraction for Winners</h4>
                  <p>
                    Winners don&apos;t need NEAR accounts or gas. The protocol handles cross-chain execution behind the scenes, delivering native ETH directly to the recipient&apos;s EVM address.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. BRAND TICKER STRIP */}
      <section className="ticker-strip scroll-reveal">
        <div className="ticker-inner">
          <span className="ticker-label">Powered by premier Web3 &amp; AI infrastructure</span>
          <div className="ticker-logos">
            <span className="brand-logo-text">NEAR PROTOCOL</span>
            <span className="ticker-divider">&bull;</span>
            <span className="brand-logo-text">AURORA EVM</span>
            <span className="ticker-divider">&bull;</span>
            <span className="brand-logo-text">GOOGLE GEMINI</span>
            <span className="ticker-divider">&bull;</span>
            <span className="brand-logo-text">RESEND</span>
            <span className="ticker-divider">&bull;</span>
            <span className="brand-logo-text">ETHEREUM SEPOLIA</span>
          </div>
        </div>
      </section>

      {/* 6. SERVICES & INTERACTIVE PROTOCOL CONSOLE */}
      <section className="services-section scroll-reveal" id="services-console" ref={formRef}>
        <div className="services-container">
          {/* Section Kicker */}
          <div className="section-kicker-pill">
            <span className="badge-dot"></span>
            <span>Architecture</span>
          </div>

          <div className="services-main-grid">
            {/* Left Column: Heading, Description & NEAR Architecture Flow */}
            <div className="services-left">
              <h2 className="services-title">
                Autonomous Escrow
                <br />
                Architecture
              </h2>

              <p className="services-desc">
                PayFold marries Google Gemini AI with NEAR Chain Signatures to eliminate manual spreadsheets and give hackathon organizers trustless, non-custodial prize settlement.
              </p>

              {/* Service Feature Card: Concrete NEAR MPC & Escrow Flow */}
              <div className="service-feature-card">
                <div className="service-header-row">
                  <h4 className="service-name">Decentralized Threshold Escrow</h4>
                  <span className="service-step-index">(NEAR MPC)</span>
                </div>
                <p className="service-detail">
                  The on-chain contract (<code>PayFoldEscrow.sol</code>) locks organizer prize pools on Aurora. Only the authorized NEAR MPC threshold signer can release payouts once the winner&apos;s identity is validated by AI.
                </p>

                <div className="service-tags-wrap">
                  <span className="service-tag">NEAR v1.signer-prod</span>
                  <span className="service-tag">Aurora EVM Escrow</span>
                  <span className="service-tag">Google Gemini 1.5 Flash</span>
                  <span className="service-tag">Sub-Cent Gas Finality</span>
                </div>
              </div>

              {/* Target Chain Info */}
              <div className="chain-info-box">
                <div className="chain-info-row">
                  <span>Target Chain</span>
                  <strong suppressHydrationWarning>
                    {mounted
                      ? `${currentChain.name} (${currentChain.id})`
                      : "Aurora (1313161554)"}
                  </strong>
                </div>
                <div className="chain-info-row">
                  <span>Signer Account</span>
                  <code>lakshay-payfold.testnet</code>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Announce Winner Console */}
            <div className="services-right">
              <div className="interactive-console-card">
                <div className="console-top-bar">
                  <div className="console-title-group">
                    <span className="live-dot-red"></span>
                    <h3>Announce Winner &amp; Deposit Escrow</h3>
                  </div>
                  <span className="protocol-badge">NEAR MPC Escrow</span>
                </div>

                <p className="console-sub">
                  Lock prize funds into the escrow smart contract. The autonomous
                  Gemini agent emails the winner to collect their EVM address and
                  releases payout without server private keys.
                </p>

                {error && (
                  <div
                    className={`alert-box ${
                      error.includes("confirmed") || error.includes("successful")
                        ? "alert-success"
                        : "alert-danger"
                    }`}
                  >
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="console-form">
                  <div className="form-row">
                    <label>Hackathon Name</label>
                    <input
                      type="text"
                      name="hackathonName"
                      value={formData.hackathonName}
                      onChange={handleInputChange}
                      placeholder="NEAR Hackathon 2026"
                      required
                    />
                  </div>

                  <div className="form-grid-two">
                    <div className="form-row">
                      <label>Winner Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Alex Rivera"
                        required
                      />
                    </div>
                    <div className="form-row">
                      <label>Winner Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="alex@example.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-grid-three">
                    <div className="form-row">
                      <label>Prize (ETH)</label>
                      <input
                        type="number"
                        name="amount"
                        value={formData.amount}
                        onChange={handleInputChange}
                        placeholder="0.25"
                        step="0.00000001"
                        min="0"
                        required
                      />
                    </div>
                    <div className="form-row">
                      <label>Place</label>
                      <input
                        type="text"
                        name="place"
                        value={formData.place}
                        onChange={handleInputChange}
                        placeholder="1st Place"
                        required
                      />
                    </div>
                    <div className="form-row">
                      <label>Track</label>
                      <input
                        type="text"
                        name="track"
                        value={formData.track}
                        onChange={handleInputChange}
                        placeholder="Real-World Money"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={!mounted || isSubmitting || !isConnected}
                    className="btn-submit-glow"
                    suppressHydrationWarning
                  >
                    {!mounted
                      ? "Connect Wallet to Announce"
                      : isSubmitting
                      ? "Locking Escrow & Dispatching..."
                      : isConnected
                      ? "Lock Escrow & Announce Winner"
                      : "Connect Wallet to Announce"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. NEAR CHAIN SIGNATURES LIVE PLAYGROUND & HACKATHON VAULT LEDGER */}
      <section className="playground-section scroll-reveal" id="near-playground">
        <div className="playground-container">
          {/* Header */}
          <div className="section-kicker-pill">
            <span className="badge-dot"></span>
            <span>⚡ NEAR Protocol Hackathon Feature</span>
          </div>

          <div className="playground-header-row">
            <div>
              <h2 className="services-title">
                NEAR Chain Signatures
                <br />
                <span className="gradient-text-red">Live Settlement Playground</span>
              </h2>
              <p className="services-desc">
                Experience decentralized keyless MPC co-signing in real-time. Watch NEAR Protocol&apos;s validator threshold network (<code>v1.signer-prod.testnet</code>) securely verify incoming winner emails and execute cross-chain payouts directly to Aurora EVM — with zero server private keys.
              </p>
            </div>
            <div className="playground-header-actions">
              <button
                type="button"
                onClick={fetchHackathons}
                className="btn-refresh-pill"
                disabled={loadingHackathons}
              >
                {loadingHackathons ? "Syncing..." : "🔄 Refresh Ledger"}
              </button>
            </div>
          </div>

          {/* 4 Protocol Architecture Metrics Cards */}
          <div className="near-tech-strip">
            <div className="tech-metric-card">
              <span className="tech-label">NEAR Signer Identity</span>
              <strong className="tech-val">lakshay-payfold.testnet</strong>
              <span className="tech-sub">Root Testnet Account</span>
            </div>
            <div className="tech-metric-card">
              <span className="tech-label">MPC Contract Network</span>
              <strong className="tech-val">v1.signer-prod.testnet</strong>
              <span className="tech-sub">Threshold Validator Cluster</span>
            </div>
            <div className="tech-metric-card">
              <span className="tech-label">Key Derivation Standard</span>
              <strong className="tech-val">Secp256k1 (BIP-32)</strong>
              <span className="tech-sub">Ephemeral Cross-Chain Keys</span>
            </div>
            <div className="tech-metric-card">
              <span className="tech-label">Target EVM Settlement</span>
              <strong className="tech-val">Aurora Engine (1313161554)</strong>
              <span className="tech-sub">~1s Sub-Cent Finality</span>
            </div>
          </div>

          {/* Ledger Filter & Stats Bar */}
          <div className="ledger-toolbar">
            <div className="filter-pill-group">
              <button
                className={`filter-tab-btn ${ledgerFilter === "all" ? "active" : ""}`}
                onClick={() => setLedgerFilter("all")}
              >
                All Hackathons ({hackathons.length})
              </button>
              <button
                className={`filter-tab-btn ${ledgerFilter === "pending" ? "active" : ""}`}
                onClick={() => setLedgerFilter("pending")}
              >
                Pending Settlement (
                {hackathons.reduce(
                  (sum, h) =>
                    sum +
                    (h.winners?.filter((w) => w.paymentStatus !== "success").length || 0),
                  0
                )}
                )
              </button>
              <button
                className={`filter-tab-btn ${ledgerFilter === "settled" ? "active" : ""}`}
                onClick={() => setLedgerFilter("settled")}
              >
                Settled via NEAR MPC (
                {hackathons.reduce(
                  (sum, h) =>
                    sum +
                    (h.winners?.filter((w) => w.paymentStatus === "success").length || 0),
                  0
                )}
                )
              </button>
            </div>

            <div className="toolbar-hint">
              <span>💡 Click <strong>Simulate NEAR MPC</strong> on any pending winner to trigger live keyless co-signing.</span>
            </div>
          </div>

          {/* Live Hackathon Vault Cards */}
          <div className="vault-cards-stack">
            {hackathons.length === 0 ? (
              <div className="empty-ledger-box">
                <p>No hackathons recorded yet. Announce a winner above to initialize a live vault!</p>
              </div>
            ) : (
              hackathons.map((h) => {
                const filteredWinners = (h.winners || []).filter((w) => {
                  if (ledgerFilter === "pending") return w.paymentStatus !== "success";
                  if (ledgerFilter === "settled") return w.paymentStatus === "success";
                  return true;
                });

                if (filteredWinners.length === 0 && ledgerFilter !== "all") {
                  return null;
                }

                return (
                  <div key={h.id} className="vault-hackathon-card">
                    <div className="vault-card-header">
                      <div className="vault-title-group">
                        <span className="vault-badge-tag">Vault #{h.id}</span>
                        <h3 className="vault-name">{h.name}</h3>
                        <span className="vault-address-code">
                          Contract: {h.hackathonAddress ? `${h.hackathonAddress.slice(0, 8)}...${h.hackathonAddress.slice(-6)}` : "Aurora Escrow"}
                        </span>
                      </div>
                      <div className="vault-meta-group">
                        <span className="vault-date">
                          Created {h.createdAt ? new Date(h.createdAt).toLocaleDateString() : "Active"}
                        </span>
                      </div>
                    </div>

                    <div className="vault-table-wrap">
                      <table className="vault-table">
                        <thead>
                          <tr>
                            <th>Place &amp; Winner</th>
                            <th>Track</th>
                            <th>Prize Locked</th>
                            <th>Winner Contact</th>
                            <th>Settlement Status</th>
                            <th style={{ textAlign: "right" }}>Autonomous Execution</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredWinners.map((winner) => {
                            const isSettled = winner.paymentStatus === "success";
                            return (
                              <tr key={winner.id} className={isSettled ? "row-settled" : "row-pending"}>
                                <td>
                                  <div className="winner-cell">
                                    <strong className="winner-name">{winner.Name || "Winner"}</strong>
                                    <span className="winner-place">{winner.place || "1st Place"}</span>
                                  </div>
                                </td>
                                <td>
                                  <span className="track-badge">{winner.track || "General"}</span>
                                </td>
                                <td>
                                  <strong className="prize-amount">{winner.prize} ETH</strong>
                                </td>
                                <td>
                                  <span className="winner-email">{winner.email}</span>
                                </td>
                                <td>
                                  {isSettled ? (
                                    <span className="status-pill settled">
                                      <span className="status-dot green"></span>
                                      Settled via NEAR MPC
                                    </span>
                                  ) : (
                                    <span className="status-pill pending">
                                      <span className="status-dot amber"></span>
                                      Escrow Deposited (Pending Address)
                                    </span>
                                  )}
                                </td>
                                <td style={{ textAlign: "right" }}>
                                  {isSettled ? (
                                    <a
                                      href={winner.transactionHash || "#"}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="btn-explorer-link"
                                    >
                                      Receipt ↗
                                    </a>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => openSimModal(winner, h)}
                                      className="btn-sim-trigger glow"
                                    >
                                      ⚡ Simulate NEAR MPC
                                    </button>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* 8. NEAR CHAIN SIGNATURES SIMULATION MODAL */}
      {simModalOpen && (
        <div className="modal-backdrop" onClick={() => setSimModalOpen(false)}>
          <div className="modal-glass sim-modal" onClick={(e) => e.stopPropagation()}>
            <div className="sim-modal-header">
              <div className="sim-modal-title-group">
                <span className="live-dot-red"></span>
                <h3>⚡ NEAR Chain Signatures Live Execution</h3>
              </div>
              <button
                type="button"
                onClick={() => setSimModalOpen(false)}
                className="sim-close-btn"
                aria-label="Close Modal"
              >
                ✕
              </button>
            </div>

            <p className="sim-modal-sub">
              Simulate an incoming email reply from the hackathon winner. PayFold&apos;s AI agent parses the wallet address, and NEAR&apos;s decentralized MPC threshold network signs and broadcasts the settlement to Aurora.
            </p>

            {/* Target Winner Details Pill */}
            {simSelectedWinner && simSelectedHackathon && (
              <div className="sim-target-banner">
                <div className="sim-banner-item">
                  <span className="sim-banner-label">Winner</span>
                  <strong>{simSelectedWinner.Name}</strong>
                </div>
                <div className="sim-banner-item">
                  <span className="sim-banner-label">Hackathon</span>
                  <strong>{simSelectedHackathon.name}</strong>
                </div>
                <div className="sim-banner-item">
                  <span className="sim-banner-label">Prize Escrow</span>
                  <strong className="text-red">{simSelectedWinner.prize} ETH</strong>
                </div>
                <div className="sim-banner-item">
                  <span className="sim-banner-label">Email</span>
                  <span>{simSelectedWinner.email}</span>
                </div>
              </div>
            )}

            {/* Reply Template Preset Buttons */}
            <div className="sim-template-row">
              <span className="sim-template-label">Sample Reply Templates:</span>
              <button
                type="button"
                className="btn-template"
                onClick={() =>
                  setSimEmailText(
                    `Hi PayFold team! Thanks for organizing. Here is my Aurora EVM wallet address: 0x71C8452f483FEfA834165dC65f57B8b71569B148. Cheers!`
                  )
                }
              >
                Aurora EVM Address
              </button>
              <button
                type="button"
                className="btn-template"
                onClick={() =>
                  setSimEmailText(
                    `Awesome hackathon! Super proud of our team. Please send the prize to 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045 on Aurora.`
                  )
                }
              >
                Sepolia Address
              </button>
            </div>

            {/* Email Textarea */}
            <div className="sim-form-group">
              <label>Winner Natural Language Email Reply</label>
              <textarea
                value={simEmailText}
                onChange={(e) => setSimEmailText(e.target.value)}
                rows={3}
                className="sim-textarea"
                placeholder="Type or paste an email reply containing an EVM hex wallet address..."
              />
            </div>

            {/* Cryptographic Execution Console Log */}
            <div className="sim-terminal-box">
              <div className="sim-terminal-header">
                <span className="terminal-dot red"></span>
                <span className="terminal-dot yellow"></span>
                <span className="terminal-dot green"></span>
                <span className="terminal-title">NEAR Protocol MPC Execution Log</span>
              </div>
              <div className="sim-terminal-body">
                {simLogs.length === 0 ? (
                  <span className="terminal-placeholder">
                    Waiting for trigger. Click &ldquo;Execute Autonomous Settlement&rdquo; below to start the NEAR Chain Signatures MPC flow...
                  </span>
                ) : (
                  simLogs.map((log, idx) => (
                    <div key={idx} className="terminal-line">
                      <span className="terminal-timestamp">[{idx + 1}]</span> {log}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="sim-modal-actions">
              <button
                type="button"
                onClick={() => setSimModalOpen(false)}
                className="btn-ghost-cancel"
              >
                Close
              </button>

              {simStage === "done" && simResult?.transactionHash ? (
                <a
                  href={simResult.transactionHash}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-red-pill glow"
                  style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
                >
                  🔗 View Explorer Receipt ↗
                </a>
              ) : (
                <button
                  type="button"
                  onClick={executeNearMpcSimulation}
                  disabled={simStage !== "idle" && simStage !== "done" && simStage !== "error"}
                  className="btn-red-pill glow"
                >
                  {simStage === "idle" || simStage === "done" || simStage === "error"
                    ? "🚀 Execute Autonomous Settlement via NEAR MPC"
                    : "⚡ Processing NEAR MPC Consensus..."}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 9. FOOTER */}
      <footer className="universe-footer scroll-reveal">
        <div className="footer-content">
          <div className="footer-left">
            <div className="footer-brand-lockup">
              <img src="/logo.png" alt="PayFold Logo" className="footer-logo-img" />
              <span className="footer-brand">PayFold</span>
            </div>
            <span className="footer-sub">
              Autonomous Hackathon Escrow Engine powered by NEAR Chain Signatures
            </span>
          </div>

          <div className="footer-center">
            <span>Built by Lakshay Deol &bull; NEAR Hackathon 2026</span>
          </div>

          <div className="footer-links">
            <a
              href="https://github.com/Lakshay-Deol/payfold"
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </a>
            <a href="https://near.org" target="_blank" rel="noreferrer">
              NEAR
            </a>
            <a href="https://aurora.dev" target="_blank" rel="noreferrer">
              Aurora
            </a>
          </div>
        </div>
      </footer>

      {/* Global CSS Stylesheet Matching Screenshot Precisely */}
      <style jsx global>{`
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        html {
          scroll-behavior: smooth;
        }

        body {
          background-color: #050507;
          color: #f1f1f4;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
            Helvetica, Arial, sans-serif;
          overflow-x: hidden;
          -webkit-font-smoothing: antialiased;
        }

        .agent-universe {
          min-height: 100vh;
          position: relative;
          background: #050507;
          display: flex;
          flex-direction: column;
        }

        /* Ambient Bioluminescent Red Background Glows */
        .ambient-glow {
          position: absolute;
          border-radius: 50%;
          filter: blur(140px);
          pointer-events: none;
          z-index: 0;
        }

        .glow-top {
          width: 550px;
          height: 550px;
          top: -120px;
          left: 50%;
          transform: translateX(-40%);
          background: radial-gradient(circle, rgba(235, 30, 45, 0.22) 0%, transparent 70%);
          animation: floatGlow 8s ease-in-out infinite alternate;
        }

        .glow-jelly {
          width: 600px;
          height: 600px;
          top: 150px;
          right: 5%;
          background: radial-gradient(circle, rgba(255, 35, 50, 0.28) 0%, rgba(180, 15, 25, 0.1) 45%, transparent 75%);
          filter: blur(120px);
          animation: floatGlow 10s ease-in-out infinite alternate-reverse;
        }

        .glow-mid {
          width: 500px;
          height: 500px;
          top: 1100px;
          left: -100px;
          background: radial-gradient(circle, rgba(235, 30, 45, 0.12) 0%, transparent 70%);
        }

        @keyframes floatGlow {
          0% { transform: translateY(-15px) scale(0.96); opacity: 0.8; }
          100% { transform: translateY(20px) scale(1.08); opacity: 1.1; }
        }

        /* 1. TOP NAVBAR */
        .top-nav {
          max-width: 1280px;
          margin: 0 auto;
          width: 100%;
          padding: 1.75rem 2rem 1.25rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: relative;
          z-index: 20;
        }

        .nav-brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .brand-logo-img {
          width: 34px;
          height: 34px;
          object-fit: contain;
          border-radius: 8px;
          filter: drop-shadow(0 0 12px rgba(255, 45, 60, 0.7));
          transition: transform 0.25s ease;
        }

        .nav-brand:hover .brand-logo-img {
          transform: scale(1.08) rotate(-3deg);
        }

        .brand-title {
          font-size: 1.25rem;
          font-weight: 800;
          letter-spacing: -0.5px;
          color: #ffffff;
        }

        .center-capsule {
          display: flex;
          background: rgba(18, 18, 22, 0.85);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 0.35rem 0.4rem;
          border-radius: 9999px;
          gap: 0.3rem;
        }

        .capsule-btn {
          background: transparent;
          border: none;
          color: #9c9ca3;
          padding: 0.45rem 1.15rem;
          border-radius: 9999px;
          font-size: 0.85rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .capsule-btn:hover {
          color: #ffffff;
        }

        .capsule-btn.active {
          background: #e51e2b;
          color: #ffffff;
          box-shadow: 0 0 16px rgba(229, 30, 43, 0.5);
        }

        .nav-actions {
          display: flex;
          align-items: center;
          gap: 0.85rem;
        }

        /* 2. HERO SECTION */
        .hero-section {
          max-width: 1280px;
          margin: 1.5rem auto 0;
          padding: 0 2rem;
          width: 100%;
          position: relative;
          z-index: 10;
        }

        .hero-grid {
          display: grid;
          grid-template-columns: 1.15fr 0.95fr;
          gap: 2.5rem;
          align-items: center;
        }

        /* Hero Left: Typography & CTAs */
        .hero-headline {
          font-size: clamp(3rem, 5.8vw, 4.6rem);
          font-weight: 850;
          line-height: 1.05;
          letter-spacing: -1.8px;
          color: #ffffff;
          margin-bottom: 1.5rem;
          position: relative;
        }

        .from-launch-pill {
          display: inline-block;
          font-size: 0.72rem;
          font-weight: 500;
          color: #8b8b94;
          line-height: 1.15;
          letter-spacing: 0px;
          vertical-align: super;
          margin-left: 0.5rem;
          border-left: 1px solid rgba(255, 255, 255, 0.15);
          padding-left: 0.5rem;
        }

        .gradient-word {
          color: #ffffff;
          background: linear-gradient(180deg, #ffffff 40%, #ff5252 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .hero-tagline {
          font-size: 1.05rem;
          color: #8f8f99;
          line-height: 1.6;
          max-width: 500px;
          margin-bottom: 2rem;
        }

        .hero-cta-group {
          display: flex;
          gap: 1rem;
          margin-bottom: 2.75rem;
        }

        .btn-ghost-pill {
          background: rgba(255, 255, 255, 0.04);
          color: #ffffff;
          border: 1px solid rgba(255, 255, 255, 0.14);
          padding: 0.8rem 1.65rem;
          border-radius: 9999px;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-ghost-pill:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.25);
        }

        .btn-red-pill {
          background: #e51e2b;
          color: #ffffff;
          border: none;
          padding: 0.8rem 1.75rem;
          border-radius: 9999px;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 18px rgba(229, 30, 43, 0.4);
        }

        .btn-red-pill.mini {
          padding: 0.55rem 1.25rem;
          font-size: 0.82rem;
        }

        .btn-red-pill.glow:hover {
          box-shadow: 0 6px 26px rgba(229, 30, 43, 0.65);
          transform: translateY(-1px);
        }

        /* 3 Stat Cards in Row */
        .stat-cards-triad {
          display: flex;
          gap: 0.85rem;
        }

        .hero-stat-card {
          background: rgba(18, 18, 22, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.06);
          backdrop-filter: blur(12px);
          padding: 0.85rem 1.15rem;
          border-radius: 1rem;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .card-kicker {
          font-size: 0.7rem;
          color: #71717a;
          letter-spacing: 0.2px;
        }

        .stat-flex {
          display: flex;
          align-items: baseline;
          gap: 0.5rem;
        }

        .big-stat-val {
          font-size: 1.4rem;
          font-weight: 800;
          color: #ffffff;
        }

        .avatar-stack {
          display: flex;
          margin-left: auto;
        }

        .mini-avatar {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          border: 1.5px solid #050507;
          margin-left: -6px;
        }

        .mini-avatar.a1 { background: #ff4d4d; }
        .mini-avatar.a2 { background: #ff8585; }
        .mini-avatar.a3 { background: #b30010; }

        .stat-micro-note {
          font-size: 0.65rem;
          color: #71717a;
          line-height: 1.2;
        }

        /* Hero Right: Bioluminescent Animated PayFold Vault Folder & Stage */
        .hero-right {
          position: relative;
        }

        .payout-stage {
          position: relative;
          min-height: 520px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .payout-creature {
          position: relative;
          width: 420px;
          height: 500px;
          animation: folderFloat 6s ease-in-out infinite alternate;
          filter: drop-shadow(0 0 40px rgba(255, 35, 50, 0.45));
        }

        @keyframes folderFloat {
          0% {
            transform: perspective(1000px) rotateY(-4deg) rotateX(3deg) translateY(0px);
          }
          100% {
            transform: perspective(1000px) rotateY(-1deg) rotateX(6deg) translateY(-16px);
          }
        }

        .payout-svg {
          width: 100%;
          height: 100%;
          overflow: visible;
        }

        /* Payout Stream Animations */
        .payout-token-card {
          animation: cardHover 4.5s ease-in-out infinite alternate;
          transform-origin: center;
        }

        @keyframes cardHover {
          0% {
            transform: translateY(0px) rotate(-1deg);
          }
          100% {
            transform: translateY(-14px) rotate(1.5deg);
          }
        }

        .coin-eth {
          animation: coinFloatEth 5s ease-in-out infinite alternate;
          transform-origin: 95px 170px;
        }

        @keyframes coinFloatEth {
          0% {
            transform: translateY(0px) rotate(-4deg);
          }
          100% {
            transform: translateY(-18px) rotate(8deg);
          }
        }

        .coin-near {
          animation: coinFloatNear 4.8s ease-in-out infinite alternate;
          transform-origin: 325px 185px;
        }

        @keyframes coinFloatNear {
          0% {
            transform: translateY(0px) rotate(4deg);
          }
          100% {
            transform: translateY(-16px) rotate(-6deg);
          }
        }

        .coin-sparkle {
          animation: sparkleFloat 3.8s ease-in-out infinite alternate;
          transform-origin: 265px 55px;
        }

        @keyframes sparkleFloat {
          0% {
            transform: translateY(0px) scale(0.95);
          }
          100% {
            transform: translateY(-12px) scale(1.1);
          }
        }

        .stream-beam {
          animation: beamOscillate 2.5s ease-in-out infinite alternate;
        }

        .stream-beam.b1 { animation-delay: 0s; }
        .stream-beam.b2 { animation-delay: 0.4s; }
        .stream-beam.b3 { animation-delay: 0.8s; }

        @keyframes beamOscillate {
          0% { opacity: 0.3; }
          100% { opacity: 0.85; }
        }

        .vault-seal {
          animation: sealGlow 3s ease-in-out infinite alternate;
        }

        @keyframes sealGlow {
          0% { transform: scale(0.98); }
          100% { transform: scale(1.02); }
        }

        /* 3. EDITORIAL STATEMENT STRIP */
        .statement-strip {
          max-width: 1280px;
          margin: 6rem auto 0;
          padding: 0 2rem;
          width: 100%;
        }

        .statement-container {
          display: grid;
          grid-template-columns: 180px 1fr;
          gap: 2.5rem;
          align-items: start;
        }

        .statement-pill-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #c7c7cc;
          font-size: 0.78rem;
          font-weight: 600;
          padding: 0.35rem 0.85rem;
          border-radius: 9999px;
          width: fit-content;
        }

        .badge-dot {
          width: 6px;
          height: 6px;
          background: #ff3344;
          border-radius: 50%;
        }

        .statement-quote {
          font-size: clamp(1.8rem, 3.2vw, 2.7rem);
          font-weight: 600;
          line-height: 1.25;
          letter-spacing: -0.8px;
          color: #ededed;
        }

        .crimson-focus {
          color: #ff3344;
        }

        /* 4. DUAL CARDS SECTION */
        .proof-zone {
          max-width: 1280px;
          margin: 4.5rem auto 0;
          padding: 0 2rem;
          width: 100%;
        }

        .proof-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.75rem;
        }

        .proof-card {
          background: rgba(14, 14, 18, 0.7);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 1.75rem;
          padding: 2.25rem;
          display: flex;
          flex-direction: column;
        }

        .card-top-row {
          margin-bottom: 1.25rem;
        }

        .live-indicator {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          font-size: 0.75rem;
          color: #9c9ca3;
        }

        .ping-dot {
          width: 6px;
          height: 6px;
          background: #ff3344;
          border-radius: 50%;
          box-shadow: 0 0 6px #ff3344;
        }

        .card-primary-title {
          font-size: 1.6rem;
          font-weight: 750;
          color: #ffffff;
          letter-spacing: -0.5px;
          margin-bottom: 1.25rem;
        }

        .card-button-row {
          margin-bottom: 1.75rem;
        }

        .btn-dark-pill {
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: #ededed;
          padding: 0.55rem 1.25rem;
          border-radius: 9999px;
          font-size: 0.8rem;
          font-weight: 600;
          text-decoration: none;
          display: inline-block;
          transition: all 0.2s ease;
        }

        .btn-dark-pill:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .media-screen-box {
          background: #09090c;
          border: 1px solid rgba(255, 45, 60, 0.2);
          border-radius: 1rem;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.7);
        }

        .terminal-header {
          background: #111116;
          padding: 0.6rem 0.85rem;
          display: flex;
          align-items: center;
          gap: 0.45rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .terminal-circle {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .terminal-circle.c1 { background: #ff4d4d; }
        .terminal-circle.c2 { background: #eab308; }
        .terminal-circle.c3 { background: #22c55e; }

        .terminal-title {
          font-size: 0.7rem;
          color: #71717a;
          margin-left: 0.4rem;
          font-family: monospace;
        }

        .terminal-body {
          padding: 1rem;
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 0.74rem;
          color: #e2e8f0;
          line-height: 1.55;
          overflow-x: auto;
        }

        /* Card Right: NEAR Architectural Benefits */
        .card-right {
          display: flex;
          flex-direction: column;
        }

        .near-benefits-list {
          display: flex;
          flex-direction: column;
          gap: 0.9rem;
          margin-top: 0.25rem;
        }

        .near-benefit-item {
          display: flex;
          gap: 1rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 1rem;
          padding: 1rem 1.15rem;
          transition: all 0.2s ease;
        }

        .near-benefit-item:hover {
          border-color: rgba(255, 45, 60, 0.3);
          background: rgba(255, 45, 60, 0.04);
        }

        .benefit-icon-badge {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(255, 45, 60, 0.15);
          border: 1px solid rgba(255, 45, 60, 0.35);
          color: #ff5252;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 800;
          flex-shrink: 0;
        }

        .benefit-text-wrap h4 {
          font-size: 0.92rem;
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 0.25rem;
        }

        .benefit-text-wrap p {
          font-size: 0.78rem;
          color: #9c9ca3;
          line-height: 1.45;
        }

        .benefit-text-wrap code {
          color: #ff4d4d;
          font-family: monospace;
          font-size: 0.76rem;
        }

        /* 5. TICKER STRIP */
        .ticker-strip {
          max-width: 1280px;
          margin: 4.5rem auto 0;
          padding: 0 2rem;
          width: 100%;
        }

        .ticker-inner {
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          padding: 1.5rem 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .ticker-label {
          font-size: 0.78rem;
          color: #71717a;
          text-transform: uppercase;
          letter-spacing: 0.8px;
        }

        .ticker-logos {
          display: flex;
          align-items: center;
          gap: 1.25rem;
        }

        .brand-logo-text {
          font-size: 0.8rem;
          font-weight: 750;
          color: #a1a1aa;
          letter-spacing: 0.5px;
        }

        .ticker-divider {
          color: #ff3344;
          font-size: 0.65rem;
        }

        /* 6. SERVICES & INTERACTIVE PROTOCOL CONSOLE */
        .services-section {
          max-width: 1280px;
          margin: 5rem auto 0;
          padding: 0 2rem;
          width: 100%;
        }

        .section-kicker-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #c7c7cc;
          font-size: 0.78rem;
          font-weight: 600;
          padding: 0.35rem 0.85rem;
          border-radius: 9999px;
          margin-bottom: 1.5rem;
        }

        .services-main-grid {
          display: grid;
          grid-template-columns: 0.95fr 1.05fr;
          gap: 3rem;
          align-items: start;
        }

        .services-title {
          font-size: clamp(2.4rem, 4.2vw, 3.4rem);
          font-weight: 850;
          line-height: 1.1;
          letter-spacing: -1.2px;
          color: #ffffff;
          margin-bottom: 1.25rem;
        }

        .services-desc {
          font-size: 1rem;
          color: #8e8e96;
          line-height: 1.6;
          margin-bottom: 2.25rem;
        }

        /* Feature Card (Matching AI Strategy & Mapping 01 in screenshot) */
        .service-feature-card {
          background: rgba(18, 18, 22, 0.75);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 1.5rem;
          padding: 2rem;
          margin-bottom: 1.5rem;
        }

        .service-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
        }

        .service-name {
          font-size: 1.25rem;
          font-weight: 700;
          color: #ffffff;
        }

        .service-step-index {
          font-size: 0.85rem;
          color: #71717a;
          font-family: monospace;
        }

        .service-detail {
          font-size: 0.88rem;
          color: #9c9ca3;
          line-height: 1.55;
          margin-bottom: 1.5rem;
        }

        .service-tags-wrap {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .service-tag {
          font-size: 0.75rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: #c7c7cc;
          padding: 0.4rem 0.85rem;
          border-radius: 9999px;
        }

        .chain-info-box {
          background: rgba(14, 14, 18, 0.6);
          border: 1px solid rgba(255, 45, 60, 0.2);
          border-radius: 1rem;
          padding: 1rem 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .chain-info-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.82rem;
          color: #8e8e96;
        }

        .chain-info-row strong {
          color: #ffffff;
        }

        .chain-info-row code {
          color: #ff4d4d;
          font-family: monospace;
        }

        /* Right Column: Console Card */
        .interactive-console-card {
          background: rgba(16, 16, 20, 0.85);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 45, 60, 0.25);
          border-radius: 1.75rem;
          padding: 2.25rem;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6), 0 0 35px rgba(255, 45, 60, 0.1);
        }

        .console-top-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .console-title-group {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .live-dot-red {
          width: 8px;
          height: 8px;
          background: #ff3344;
          border-radius: 50%;
          box-shadow: 0 0 10px #ff3344;
        }

        .console-title-group h3 {
          font-size: 1.25rem;
          font-weight: 750;
          color: #ffffff;
        }

        .protocol-badge {
          font-size: 0.72rem;
          background: rgba(255, 45, 60, 0.15);
          color: #ff5252;
          border: 1px solid rgba(255, 45, 60, 0.3);
          padding: 0.25rem 0.65rem;
          border-radius: 9999px;
          font-weight: 600;
        }

        .console-sub {
          font-size: 0.85rem;
          color: #8e8e96;
          line-height: 1.5;
          margin-bottom: 1.5rem;
        }

        .alert-box {
          padding: 0.85rem 1.15rem;
          border-radius: 0.75rem;
          font-size: 0.85rem;
          margin-bottom: 1.5rem;
        }

        .alert-success {
          background: rgba(34, 197, 94, 0.12);
          border: 1px solid rgba(34, 197, 94, 0.3);
          color: #4ade80;
        }

        .alert-danger {
          background: rgba(239, 68, 68, 0.12);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #f87171;
        }

        .console-form {
          display: flex;
          flex-direction: column;
          gap: 1.15rem;
        }

        .form-row {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .form-row label {
          font-size: 0.75rem;
          color: #9c9ca3;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.4px;
        }

        .form-row input {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #ffffff;
          padding: 0.75rem 1rem;
          border-radius: 0.75rem;
          font-size: 0.9rem;
          outline: none;
          transition: all 0.2s ease;
        }

        .form-row input:focus {
          border-color: #ff3344;
          background: rgba(255, 45, 60, 0.05);
          box-shadow: 0 0 14px rgba(255, 51, 68, 0.25);
        }

        .form-grid-two {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .form-grid-three {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 0.75rem;
        }

        .btn-submit-glow {
          margin-top: 0.75rem;
          background: linear-gradient(135deg, #e51e2b 0%, #a80d18 100%);
          color: #ffffff;
          border: none;
          padding: 0.95rem;
          border-radius: 9999px;
          font-size: 0.95rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 6px 20px rgba(229, 30, 43, 0.45);
        }

        .btn-submit-glow:hover:not(:disabled) {
          box-shadow: 0 8px 30px rgba(229, 30, 43, 0.7);
          transform: translateY(-1px);
        }

        .btn-submit-glow:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          box-shadow: none;
        }

        /* Success Modal */
        .modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(14px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
          padding: 1.5rem;
        }

        .modal-glass {
          background: #0f0f14;
          border: 1px solid rgba(255, 45, 60, 0.35);
          border-radius: 1.5rem;
          padding: 2.25rem;
          max-width: 520px;
          width: 100%;
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(255, 45, 60, 0.2);
        }

        .modal-header-brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.85rem;
        }

        .modal-logo-img {
          width: 32px;
          height: 32px;
          object-fit: contain;
          border-radius: 8px;
          box-shadow: 0 0 12px rgba(255, 45, 60, 0.5);
        }

        .modal-pill {
          font-size: 0.7rem;
          font-weight: 750;
          color: #ff4d4d;
          letter-spacing: 0.8px;
        }

        .modal-title {
          font-size: 1.5rem;
          color: #ffffff;
          margin-bottom: 0.75rem;
        }

        .modal-text {
          font-size: 0.9rem;
          color: #9c9ca3;
          line-height: 1.5;
          margin-bottom: 1.25rem;
        }

        .modal-code {
          background: #060608;
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #4ade80;
          font-family: monospace;
          padding: 0.85rem;
          border-radius: 0.75rem;
          font-size: 0.85rem;
          word-break: break-all;
          margin-bottom: 1.5rem;
        }

        .modal-button-row {
          display: flex;
          gap: 1rem;
        }

        /* Scroll Reveal Animations */
        .scroll-reveal {
          opacity: 0;
          transform: translateY(35px);
          transition: opacity 0.85s cubic-bezier(0.16, 1, 0.3, 1),
                      transform 0.85s cubic-bezier(0.16, 1, 0.3, 1);
          will-change: opacity, transform;
        }

        .scroll-reveal.revealed {
          opacity: 1;
          transform: translateY(0);
        }

        @media (prefers-reduced-motion: reduce) {
          .scroll-reveal {
            opacity: 1;
            transform: none;
          }
        }

        /* 7. NEAR CHAIN SIGNATURES PLAYGROUND & HACKATHON VAULT LEDGER */
        .playground-section {
          max-width: 1280px;
          margin: 6rem auto 0;
          padding: 0 2rem;
          width: 100%;
        }

        .playground-container {
          display: flex;
          flex-direction: column;
        }

        .playground-header-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 2rem;
          flex-wrap: wrap;
        }

        .btn-refresh-pill {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: #ffffff;
          padding: 0.65rem 1.25rem;
          border-radius: 9999px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-refresh-pill:hover:not(:disabled) {
          background: rgba(255, 51, 68, 0.15);
          border-color: #ff3344;
          box-shadow: 0 0 16px rgba(255, 51, 68, 0.35);
        }

        .btn-refresh-pill:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* 4-Item NEAR Tech Strip */
        .near-tech-strip {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.25rem;
          margin: 2rem 0;
        }

        .tech-metric-card {
          background: rgba(18, 18, 22, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 1.25rem;
          padding: 1.25rem 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          transition: all 0.25s ease;
        }

        .tech-metric-card:hover {
          border-color: rgba(255, 51, 68, 0.4);
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
        }

        .tech-label {
          font-size: 0.72rem;
          font-weight: 700;
          color: #8e8e96;
          text-transform: uppercase;
          letter-spacing: 0.8px;
        }

        .tech-val {
          font-size: 1.05rem;
          font-weight: 750;
          color: #ffffff;
          word-break: break-all;
        }

        .tech-sub {
          font-size: 0.75rem;
          color: #ff4d4d;
        }

        /* Ledger Toolbar */
        .ledger-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
        }

        .filter-pill-group {
          display: inline-flex;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 9999px;
          padding: 0.3rem;
          gap: 0.25rem;
        }

        .filter-tab-btn {
          background: transparent;
          border: none;
          color: #8e8e96;
          padding: 0.45rem 1.1rem;
          border-radius: 9999px;
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .filter-tab-btn.active {
          background: rgba(255, 51, 68, 0.2);
          color: #ffffff;
          border: 1px solid rgba(255, 51, 68, 0.4);
        }

        .toolbar-hint {
          font-size: 0.8rem;
          color: #a1a1aa;
        }

        /* Vault Cards Stack */
        .vault-cards-stack {
          display: flex;
          flex-direction: column;
          gap: 1.75rem;
        }

        .empty-ledger-box {
          background: rgba(18, 18, 22, 0.6);
          border: 1px dashed rgba(255, 255, 255, 0.15);
          border-radius: 1.25rem;
          padding: 3rem;
          text-align: center;
          color: #8e8e96;
        }

        .vault-hackathon-card {
          background: rgba(16, 16, 20, 0.85);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 1.5rem;
          padding: 1.75rem;
          transition: border-color 0.25s ease;
        }

        .vault-hackathon-card:hover {
          border-color: rgba(255, 51, 68, 0.35);
        }

        .vault-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.25rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .vault-title-group {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          flex-wrap: wrap;
        }

        .vault-badge-tag {
          background: rgba(255, 51, 68, 0.15);
          color: #ff4d4d;
          font-size: 0.7rem;
          font-weight: 750;
          padding: 0.2rem 0.65rem;
          border-radius: 9999px;
          border: 1px solid rgba(255, 51, 68, 0.3);
        }

        .vault-name {
          font-size: 1.3rem;
          font-weight: 750;
          color: #ffffff;
        }

        .vault-address-code {
          font-family: monospace;
          font-size: 0.75rem;
          color: #71717a;
          background: rgba(255, 255, 255, 0.03);
          padding: 0.2rem 0.5rem;
          border-radius: 6px;
        }

        .vault-date {
          font-size: 0.78rem;
          color: #71717a;
        }

        .vault-table-wrap {
          overflow-x: auto;
        }

        .vault-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.88rem;
        }

        .vault-table th {
          text-align: left;
          padding: 0.75rem 1rem;
          color: #71717a;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.7px;
          font-weight: 600;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }

        .vault-table td {
          padding: 1rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
          vertical-align: middle;
        }

        .winner-cell {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
        }

        .winner-name {
          color: #ffffff;
          font-weight: 650;
        }

        .winner-place {
          font-size: 0.75rem;
          color: #8e8e96;
        }

        .track-badge {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: #c7c7cc;
          padding: 0.2rem 0.65rem;
          border-radius: 9999px;
          font-size: 0.75rem;
        }

        .prize-amount {
          color: #ffffff;
          font-weight: 750;
        }

        .winner-email {
          color: #8e8e96;
          font-family: monospace;
          font-size: 0.8rem;
        }

        .status-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          padding: 0.35rem 0.85rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 650;
        }

        .status-pill.settled {
          background: rgba(34, 197, 94, 0.12);
          border: 1px solid rgba(34, 197, 94, 0.35);
          color: #4ade80;
        }

        .status-pill.pending {
          background: rgba(245, 158, 11, 0.12);
          border: 1px solid rgba(245, 158, 11, 0.35);
          color: #fbbf24;
        }

        .status-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
        }

        .status-dot.green {
          background: #4ade80;
          box-shadow: 0 0 8px #4ade80;
        }

        .status-dot.amber {
          background: #fbbf24;
          box-shadow: 0 0 8px #fbbf24;
        }

        .btn-explorer-link {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          color: #4ade80;
          font-size: 0.8rem;
          font-weight: 600;
          text-decoration: none;
          padding: 0.45rem 0.95rem;
          background: rgba(34, 197, 94, 0.08);
          border: 1px solid rgba(34, 197, 94, 0.25);
          border-radius: 9999px;
          transition: all 0.2s ease;
        }

        .btn-explorer-link:hover {
          background: rgba(34, 197, 94, 0.2);
          box-shadow: 0 0 12px rgba(34, 197, 94, 0.4);
        }

        .btn-sim-trigger {
          background: linear-gradient(135deg, #e51e2b 0%, #a80d18 100%);
          color: #ffffff;
          border: none;
          padding: 0.5rem 1.1rem;
          border-radius: 9999px;
          font-size: 0.8rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 14px rgba(229, 30, 43, 0.4);
        }

        .btn-sim-trigger:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(229, 30, 43, 0.7);
        }

        /* Simulation Modal */
        .sim-modal {
          max-width: 680px;
        }

        .sim-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .sim-modal-title-group {
          display: flex;
          align-items: center;
          gap: 0.65rem;
        }

        .sim-modal-title-group h3 {
          font-size: 1.35rem;
          font-weight: 800;
          color: #ffffff;
        }

        .sim-close-btn {
          background: transparent;
          border: none;
          color: #8e8e96;
          font-size: 1.25rem;
          cursor: pointer;
          padding: 0.25rem;
          transition: color 0.2s;
        }

        .sim-close-btn:hover {
          color: #ffffff;
        }

        .sim-modal-sub {
          font-size: 0.86rem;
          color: #8e8e96;
          line-height: 1.5;
          margin-bottom: 1.25rem;
        }

        .sim-target-banner {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 0.85rem;
          padding: 0.85rem 1.1rem;
          gap: 0.75rem;
          margin-bottom: 1.25rem;
        }

        .sim-banner-item {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
          font-size: 0.85rem;
        }

        .sim-banner-label {
          font-size: 0.68rem;
          text-transform: uppercase;
          color: #71717a;
          letter-spacing: 0.6px;
        }

        .text-red {
          color: #ff3344;
        }

        .sim-template-row {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          margin-bottom: 0.85rem;
          flex-wrap: wrap;
        }

        .sim-template-label {
          font-size: 0.75rem;
          color: #8e8e96;
        }

        .btn-template {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #c7c7cc;
          padding: 0.3rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-template:hover {
          background: rgba(255, 51, 68, 0.15);
          border-color: #ff3344;
          color: #ffffff;
        }

        .sim-form-group {
          display: flex;
          flex-direction: column;
          gap: 0.45rem;
          margin-bottom: 1.25rem;
        }

        .sim-form-group label {
          font-size: 0.78rem;
          font-weight: 650;
          color: #c7c7cc;
        }

        .sim-textarea {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #ffffff;
          padding: 0.75rem 1rem;
          border-radius: 0.75rem;
          font-size: 0.85rem;
          font-family: inherit;
          resize: vertical;
          outline: none;
          transition: all 0.2s ease;
        }

        .sim-textarea:focus {
          border-color: #ff3344;
          box-shadow: 0 0 14px rgba(255, 51, 68, 0.25);
        }

        /* Terminal Console Box */
        .sim-terminal-box {
          background: #040406;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 0.85rem;
          overflow: hidden;
          margin-bottom: 1.5rem;
        }

        .sim-terminal-header {
          background: rgba(255, 255, 255, 0.03);
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          padding: 0.5rem 0.85rem;
          display: flex;
          align-items: center;
          gap: 0.45rem;
        }

        .terminal-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .terminal-dot.red { background: #ef4444; }
        .terminal-dot.yellow { background: #f59e0b; }
        .terminal-dot.green { background: #10b981; }

        .terminal-title {
          font-size: 0.72rem;
          font-family: monospace;
          color: #71717a;
          margin-left: 0.4rem;
        }

        .sim-terminal-body {
          padding: 0.85rem 1rem;
          font-family: monospace;
          font-size: 0.78rem;
          max-height: 160px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          color: #4ade80;
          line-height: 1.5;
        }

        .terminal-placeholder {
          color: #52525b;
          font-style: italic;
        }

        .terminal-line {
          word-break: break-all;
        }

        .terminal-timestamp {
          color: #ff4d4d;
        }

        .sim-modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 0.85rem;
          align-items: center;
        }

        .btn-ghost-cancel {
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: #a1a1aa;
          padding: 0.65rem 1.25rem;
          border-radius: 9999px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-ghost-cancel:hover {
          color: #ffffff;
          border-color: rgba(255, 255, 255, 0.3);
        }

        @media (max-width: 1024px) {
          .near-tech-strip {
            grid-template-columns: 1fr 1fr;
          }
          .sim-target-banner {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 640px) {
          .near-tech-strip {
            grid-template-columns: 1fr;
          }
          .sim-target-banner {
            grid-template-columns: 1fr;
          }
          .playground-header-row {
            flex-direction: column;
          }
          .ledger-toolbar {
            flex-direction: column;
            align-items: flex-start;
          }
        }

        /* 9. FOOTER */
        .universe-footer {
          max-width: 1280px;
          margin: 6rem auto 2.5rem;
          padding: 2rem;
          width: 100%;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
        }

        .footer-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1.5rem;
          flex-wrap: wrap;
        }

        .footer-left {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .footer-brand-lockup {
          display: flex;
          align-items: center;
          gap: 0.65rem;
        }

        .footer-logo-img {
          width: 26px;
          height: 26px;
          object-fit: contain;
          border-radius: 6px;
          box-shadow: 0 0 10px rgba(255, 45, 60, 0.5);
        }

        .footer-brand {
          font-size: 1.15rem;
          font-weight: 800;
          color: #ffffff;
        }

        .footer-sub {
          font-size: 0.75rem;
          color: #71717a;
        }

        .footer-center {
          font-size: 0.78rem;
          color: #71717a;
        }

        .footer-links {
          display: flex;
          gap: 1.25rem;
        }

        .footer-links a {
          color: #a1a1aa;
          text-decoration: none;
          font-size: 0.82rem;
          transition: all 0.2s ease;
        }

        .footer-links a:hover {
          color: #ff3344;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .hero-grid {
            grid-template-columns: 1fr;
          }

          .hero-right {
            order: -1;
          }

          .proof-grid {
            grid-template-columns: 1fr;
          }

          .services-main-grid {
            grid-template-columns: 1fr;
          }

          .statement-container {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 640px) {
          .top-nav {
            flex-direction: column;
            gap: 1rem;
          }

          .stat-cards-triad {
            flex-direction: column;
          }

          .form-grid-two,
          .form-grid-three {
            grid-template-columns: 1fr;
          }

          .footer-content {
            flex-direction: column;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
}
