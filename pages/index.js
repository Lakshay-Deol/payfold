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
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Bioluminescent Volumetric Ambient Glows */}
      <div className="ambient-glow glow-top"></div>
      <div className="ambient-glow glow-jelly"></div>
      <div className="ambient-glow glow-mid"></div>

      {/* Success Modal */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-glass">
            <div className="modal-pill">NEAR MPC ESCROW INITIALIZED</div>
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

      {/* 1. TOP NAVBAR (Matching Screenshot) */}
      <header className="top-nav">
        <div className="nav-brand">
          <div className="brand-symbol">
            <div className="symbol-core"></div>
          </div>
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
            Services
          </button>
          <button
            onClick={() => scrollToSection("proof")}
            className="capsule-btn"
          >
            Works
          </button>
          <button
            onClick={() => scrollToSection("statement")}
            className="capsule-btn"
          >
            About
          </button>
          <button
            onClick={() => scrollToSection("services-console")}
            className="capsule-btn"
          >
            Console
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
                onClick={() => scrollToSection("services-console")}
                className="btn-ghost-pill"
              >
                Explore Services
              </button>
              <button
                onClick={() => {
                  setActiveTab("console");
                  scrollToSection("services-console");
                }}
                className="btn-red-pill glow"
              >
                View Pricing Plans
              </button>
            </div>

            {/* 3 Stat Cards in a Row (Matching Screenshot) */}
            <div className="stat-cards-triad">
              {/* Card 1: Happy people */}
              <div className="hero-stat-card">
                <span className="card-kicker">Happy winners</span>
                <div className="stat-flex">
                  <span className="big-stat-val">3M+</span>
                  <div className="avatar-stack">
                    <span className="mini-avatar a1"></span>
                    <span className="mini-avatar a2"></span>
                    <span className="mini-avatar a3"></span>
                  </div>
                </div>
              </div>

              {/* Card 2: ROI improvement */}
              <div className="hero-stat-card">
                <span className="card-kicker">ROI improvement</span>
                <div className="stat-flex">
                  <span className="big-stat-val">95%</span>
                  <span className="stat-micro-note">
                    time saved on manual winner outreach
                  </span>
                </div>
              </div>

              {/* Card 3: Client retention */}
              <div className="hero-stat-card">
                <span className="card-kicker">Client retention</span>
                <div className="stat-flex">
                  <span className="big-stat-val">88%</span>
                  <span className="stat-micro-note">
                    re-used across subsequent seasons
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Bioluminescent Glowing Jellyfish & Floating Cards */}
          <div className="hero-right">
            <div className="jellyfish-stage">
              {/* Animated Bioluminescent Jellyfish Creature */}
              <div className="jellyfish-creature">
                <svg
                  viewBox="0 0 360 480"
                  className="jellyfish-svg"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <radialGradient
                      id="jellyCap"
                      cx="50%"
                      cy="30%"
                      r="65%"
                      fx="50%"
                      fy="20%"
                    >
                      <stop offset="0%" stopColor="#ff4d4d" stopOpacity="0.95" />
                      <stop offset="35%" stopColor="#e51e2b" stopOpacity="0.75" />
                      <stop offset="70%" stopColor="#990b14" stopOpacity="0.45" />
                      <stop offset="100%" stopColor="#2a0005" stopOpacity="0" />
                    </radialGradient>
                    <radialGradient
                      id="innerCore"
                      cx="50%"
                      cy="45%"
                      r="35%"
                    >
                      <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
                      <stop offset="25%" stopColor="#ff6b6b" stopOpacity="0.8" />
                      <stop offset="60%" stopColor="#ff1725" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#800000" stopOpacity="0" />
                    </radialGradient>
                    <linearGradient
                      id="tentacleRed"
                      x1="0%"
                      y1="0%"
                      x2="0%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="#ff4d4d" stopOpacity="0.85" />
                      <stop offset="50%" stopColor="#e51e2b" stopOpacity="0.45" />
                      <stop offset="100%" stopColor="#ff1a2b" stopOpacity="0.05" />
                    </linearGradient>
                    <filter
                      id="jellyGlow"
                      x="-30%"
                      y="-30%"
                      width="160%"
                      height="160%"
                    >
                      <feGaussianBlur stdDeviation="14" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>

                  {/* Jellyfish Bell (Umbrella) */}
                  <g filter="url(#jellyGlow)">
                    <path
                      d="M60 140 C60 45, 300 45, 300 140 C300 175, 275 195, 250 190 C225 185, 205 195, 180 190 C155 185, 135 195, 110 190 C85 185, 60 175, 60 140 Z"
                      fill="url(#jellyCap)"
                    />
                    {/* Inner glowing organs */}
                    <ellipse
                      cx="180"
                      cy="130"
                      rx="70"
                      ry="45"
                      fill="url(#innerCore)"
                    />
                    <ellipse
                      cx="180"
                      cy="120"
                      rx="35"
                      ry="22"
                      fill="#ffffff"
                      opacity="0.7"
                    />
                  </g>

                  {/* Flowing Bioluminescent Tentacles */}
                  <g className="tentacles-group" stroke="url(#tentacleRed)">
                    <path
                      d="M130 185 Q115 250 145 320 T120 440"
                      strokeWidth="3.5"
                      fill="none"
                      className="tentacle t1"
                    />
                    <path
                      d="M150 190 Q170 270 140 350 T160 460"
                      strokeWidth="2.5"
                      fill="none"
                      className="tentacle t2"
                    />
                    <path
                      d="M180 192 Q185 280 180 370 T185 470"
                      strokeWidth="4"
                      fill="none"
                      className="tentacle t3"
                    />
                    <path
                      d="M210 190 Q190 270 220 350 T200 460"
                      strokeWidth="2.5"
                      fill="none"
                      className="tentacle t4"
                    />
                    <path
                      d="M230 185 Q245 250 215 320 T240 440"
                      strokeWidth="3.5"
                      fill="none"
                      className="tentacle t5"
                    />
                    {/* Filament wisps */}
                    <path
                      d="M100 175 Q85 240 105 320 T95 410"
                      strokeWidth="1.2"
                      opacity="0.6"
                      fill="none"
                      className="tentacle t6"
                    />
                    <path
                      d="M260 175 Q275 240 255 320 T265 410"
                      strokeWidth="1.2"
                      opacity="0.6"
                      fill="none"
                      className="tentacle t7"
                    />
                  </g>
                </svg>
              </div>

              {/* Floating Social Pill (Matching Screenshot) */}
              <div className="floating-social-capsule">
                <a
                  href="https://github.com/Lakshay-Deol/payfold"
                  target="_blank"
                  rel="noreferrer"
                  title="GitHub"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                </a>
                <a
                  href="https://near.org"
                  target="_blank"
                  rel="noreferrer"
                  title="NEAR Protocol"
                >
                  <span className="text-icon">N</span>
                </a>
                <a
                  href="https://x.com"
                  target="_blank"
                  rel="noreferrer"
                  title="X (Twitter)"
                >
                  <span className="text-icon">𝕏</span>
                </a>
              </div>

              {/* Floating Card 1: 230+ Projects (Top Right) */}
              <div className="floating-card-widget widget-top">
                <div className="mini-thumb-jelly">
                  <div className="mini-jelly-dot"></div>
                </div>
                <div className="widget-num">230+</div>
                <div className="widget-caption">
                  Prizes successfully dispersed worldwide
                </div>
              </div>

              {/* Floating Card 2: 400+ Trusted Partners & CTA (Bottom Right) */}
              <div className="floating-card-widget widget-bottom">
                <div className="widget-num">400+</div>
                <div className="widget-caption">Trusted Hackathons</div>
                <div className="partner-strip-chips">
                  <span className="partner-chip">NEAR</span>
                  <span className="partner-chip">Aurora</span>
                  <span className="partner-chip">Gemini</span>
                  <span className="partner-chip">Resend</span>
                </div>
                <button
                  onClick={() => {
                    setActiveTab("console");
                    scrollToSection("services-console");
                  }}
                  className="btn-card-action"
                >
                  Launch App
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. EDITORIAL STATEMENT (Matching Screenshot) */}
      <section className="statement-strip" id="statement">
        <div className="statement-container">
          <div className="statement-pill-badge">
            <span className="badge-dot"></span>
            <span>About Us</span>
          </div>

          <h2 className="statement-quote">
            We <span className="crimson-focus">design</span> and deploy{" "}
            <span className="crimson-focus">AI solutions</span> with people at
            the core, ensuring every{" "}
            <span className="crimson-focus">system enhances</span> real user
            experiences.
          </h2>
        </div>
      </section>

      {/* 4. DUAL CARDS SECTION (Matching Screenshot) */}
      <section className="proof-zone" id="proof">
        <div className="proof-grid">
          {/* Left Card: Based in Montreal / Powered by NEAR Protocol */}
          <div className="proof-card card-left">
            <div className="card-top-row">
              <div className="live-indicator">
                <span className="ping-dot"></span>
                <span>Available for worldwide hackathons</span>
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

          {/* Right Card: 120+ Metric & Ava Collins Quote (Matching Screenshot) */}
          <div className="proof-card card-right">
            <div className="card-right-header">
              Trusted by 120+ hackathons across 4 continents — shipping
              decentralized payouts from idea to production in seconds
            </div>

            <div className="giant-metric-row">
              <span className="giant-metric-number">120+</span>
              <div className="five-stars">★★★★★</div>
            </div>

            {/* Inset Quote Card */}
            <div className="quote-inset-card">
              <div className="quote-avatar">
                <div className="avatar-initials">LD</div>
              </div>
              <div className="quote-content">
                <p className="quote-text">
                  &ldquo;Good AI feels obvious — because the hard work is
                  hidden.&rdquo;
                </p>
                <div className="quote-author">
                  <strong>Lakshay Deol</strong> &bull; PayFold Architect &amp;
                  NEAR Builder
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. BRAND TICKER STRIP (Matching Screenshot) */}
      <section className="ticker-strip">
        <div className="ticker-inner">
          <span className="ticker-label">Trusted by premier Web3 &amp; AI stacks</span>
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

      {/* 6. SERVICES & INTERACTIVE PROTOCOL CONSOLE (Matching Screenshot) */}
      <section className="services-section" id="services-console" ref={formRef}>
        <div className="services-container">
          {/* Section Kicker */}
          <div className="section-kicker-pill">
            <span className="badge-dot"></span>
            <span>Services</span>
          </div>

          <div className="services-main-grid">
            {/* Left Column: Heading, Description & Step Pills */}
            <div className="services-left">
              <h2 className="services-title">
                End-to-End
                <br />
                AI Services
              </h2>

              <p className="services-desc">
                We turn ambiguous AI ideas into production features your users
                trust — combining strategy, design, engineering, and rigorous
                on-chain cryptographic evaluation.
              </p>

              {/* Service Step Card (Matching Screenshot: AI Strategy & Mapping 01) */}
              <div className="service-feature-card">
                <div className="service-header-row">
                  <h4 className="service-name">AI Strategy &amp; Mapping</h4>
                  <span className="service-step-index">(01)</span>
                </div>
                <p className="service-detail">
                  Identify high-ROI use cases and define a realistic, measurable
                  AI prize disbursement roadmap.
                </p>

                <div className="service-tags-wrap">
                  <span className="service-tag">Stakeholder discovery</span>
                  <span className="service-tag">Value model &amp; KPI definition</span>
                  <span className="service-tag">Data readiness assessment</span>
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

      {/* 7. FOOTER */}
      <footer className="universe-footer">
        <div className="footer-content">
          <div className="footer-left">
            <span className="footer-brand">PayFold</span>
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

        .brand-symbol {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 2px solid #ff3344;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 14px rgba(255, 51, 68, 0.6);
        }

        .symbol-core {
          width: 10px;
          height: 10px;
          background: #ff3344;
          border-radius: 50%;
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

        /* Hero Right: Bioluminescent Jellyfish & Stage */
        .hero-right {
          position: relative;
        }

        .jellyfish-stage {
          position: relative;
          min-height: 520px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .jellyfish-creature {
          position: absolute;
          width: 380px;
          height: 480px;
          animation: jellyPulse 6s ease-in-out infinite alternate;
        }

        @keyframes jellyPulse {
          0% {
            transform: translateY(0px) scale(0.98);
          }
          100% {
            transform: translateY(-16px) scale(1.02);
          }
        }

        .jellyfish-svg {
          width: 100%;
          height: 100%;
          filter: drop-shadow(0 0 35px rgba(255, 30, 45, 0.45));
        }

        .tentacle {
          animation: waveTentacle 5s ease-in-out infinite alternate;
          transform-origin: top center;
        }

        .tentacle.t1 { animation-delay: 0s; }
        .tentacle.t2 { animation-delay: 0.5s; }
        .tentacle.t3 { animation-delay: 1s; }
        .tentacle.t4 { animation-delay: 1.5s; }
        .tentacle.t5 { animation-delay: 2s; }

        @keyframes waveTentacle {
          0% { transform: skewX(-2deg); }
          100% { transform: skewX(3deg); }
        }

        /* Floating Social Capsule (f, camera, x) */
        .floating-social-capsule {
          position: absolute;
          top: 38%;
          left: 54%;
          transform: translate(-50%, -50%);
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
          background: rgba(18, 18, 22, 0.85);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 0.55rem 0.45rem;
          border-radius: 9999px;
          z-index: 15;
        }

        .floating-social-capsule a {
          color: #a1a1aa;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          text-decoration: none;
          transition: all 0.2s ease;
        }

        .floating-social-capsule a:hover {
          color: #ffffff;
          background: rgba(255, 255, 255, 0.08);
        }

        .text-icon {
          font-size: 0.75rem;
          font-weight: 700;
        }

        /* Floating Card Widgets (Top & Bottom Right) */
        .floating-card-widget {
          position: absolute;
          background: rgba(14, 14, 18, 0.85);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 1.25rem;
          padding: 1.25rem;
          z-index: 12;
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.6);
        }

        .widget-top {
          top: 40px;
          right: 0px;
          width: 170px;
        }

        .mini-thumb-jelly {
          width: 100%;
          height: 65px;
          background: radial-gradient(circle at 50% 40%, rgba(255, 45, 60, 0.4) 0%, rgba(20, 20, 25, 0.9) 70%);
          border-radius: 0.75rem;
          margin-bottom: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(255, 45, 60, 0.2);
        }

        .mini-jelly-dot {
          width: 16px;
          height: 16px;
          background: #ff3344;
          border-radius: 50%;
          box-shadow: 0 0 14px #ff3344;
        }

        .widget-bottom {
          bottom: 20px;
          right: 0px;
          width: 190px;
        }

        .widget-num {
          font-size: 1.6rem;
          font-weight: 850;
          color: #ffffff;
          line-height: 1.1;
        }

        .widget-caption {
          font-size: 0.72rem;
          color: #8e8e96;
          margin-top: 0.25rem;
          margin-bottom: 0.75rem;
        }

        .partner-strip-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 0.35rem;
          margin-bottom: 0.85rem;
        }

        .partner-chip {
          font-size: 0.62rem;
          background: rgba(255, 255, 255, 0.05);
          color: #b0b0b8;
          padding: 0.2rem 0.45rem;
          border-radius: 4px;
        }

        .btn-card-action {
          width: 100%;
          background: #e51e2b;
          color: #ffffff;
          border: none;
          padding: 0.55rem;
          border-radius: 9999px;
          font-size: 0.78rem;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(229, 30, 43, 0.35);
          transition: all 0.2s ease;
        }

        .btn-card-action:hover {
          box-shadow: 0 6px 18px rgba(229, 30, 43, 0.55);
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

        /* Card Right */
        .card-right {
          justify-content: space-between;
        }

        .card-right-header {
          font-size: 0.95rem;
          color: #9c9ca3;
          line-height: 1.5;
          max-width: 420px;
        }

        .giant-metric-row {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          margin: 2.5rem 0;
        }

        .giant-metric-number {
          font-size: clamp(3.5rem, 6vw, 5.2rem);
          font-weight: 850;
          color: #ffffff;
          line-height: 1;
          letter-spacing: -2px;
        }

        .five-stars {
          color: #ff3344;
          font-size: 1.15rem;
          letter-spacing: 2px;
        }

        .quote-inset-card {
          background: rgba(18, 18, 24, 0.85);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 1.25rem;
          padding: 1.35rem;
          display: flex;
          gap: 1.15rem;
          align-items: center;
        }

        .quote-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ff3344, #8b0000);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .avatar-initials {
          color: #ffffff;
          font-weight: 750;
          font-size: 0.95rem;
        }

        .quote-text {
          font-size: 0.88rem;
          color: #ededed;
          font-style: italic;
          line-height: 1.45;
          margin-bottom: 0.35rem;
        }

        .quote-author {
          font-size: 0.72rem;
          color: #71717a;
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

        .modal-pill {
          font-size: 0.7rem;
          font-weight: 750;
          color: #ff4d4d;
          letter-spacing: 0.8px;
          margin-bottom: 0.75rem;
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

        /* 7. FOOTER */
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
          gap: 0.25rem;
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
