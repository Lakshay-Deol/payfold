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
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const currentChain =
    [aurora, sepolia, auroraTestnet].find((c) => c.id === chainId) || aurora;

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

      {/* Ambient Bioluminescent Red Glows */}
      <div className="ambient-glow top-center"></div>
      <div className="ambient-glow right-mid"></div>
      <div className="ambient-glow bottom-left"></div>

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
                className="btn-crimson"
              >
                Copy Address
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="btn-glass"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Navbar */}
      <header className="top-nav">
        <div className="brand-lockup">
          <div className="brand-dot"></div>
          <span className="brand-name">PayFold</span>
        </div>

        <nav className="center-pill-menu">
          <button
            onClick={() => setActiveTab("console")}
            className={`pill-item ${activeTab === "console" ? "active" : ""}`}
          >
            Console
          </button>
          <button
            onClick={() => setActiveTab("workflow")}
            className={`pill-item ${activeTab === "workflow" ? "active" : ""}`}
          >
            Workflow
          </button>
          <a
            href="https://github.com/Lakshay-Deol/payfold"
            target="_blank"
            rel="noreferrer"
            className="pill-item"
          >
            Docs
          </a>
        </nav>

        <div className="nav-actions">
          <div className="near-tag">
            <span className="live-pulse"></span>
            NEAR Protocol
          </div>
          <ConnectButton />
        </div>
      </header>

      {/* Main Hero Container */}
      <section className="hero-zone">
        <div className="hero-columns">
          {/* Left Column: Headlines & CTAs */}
          <div className="hero-content">
            <div className="eyebrow-pill">
              <span className="pill-spark">⚡</span>
              <span>AI-Driven Autonomous Payouts</span>
            </div>

            <h1 className="hero-main-title">
              Your Autonomous
              <br />
              Prize Engine
              <br />
              <span className="crimson-highlight">On Demand</span>
            </h1>

            <p className="hero-subtext">
              From hackathon escrow to AI address collection and zero-leakage
              settlement. We automate the entire prize distribution lifecycle on-chain
              with <strong>NEAR Chain Signatures</strong>.
            </p>

            <div className="cta-row">
              <button
                onClick={() => {
                  setActiveTab("console");
                  scrollToSection("app-console");
                }}
                className="btn-crimson"
              >
                Announce Winner
              </button>
              <button
                onClick={() => setActiveTab("workflow")}
                className="btn-glass"
              >
                Explore Workflow
              </button>
            </div>

            {/* Quick Micro Stat Pills */}
            <div className="stat-pills-row">
              <div className="stat-card">
                <span className="stat-num">0</span>
                <span className="stat-label">Keys on Server</span>
              </div>
              <div className="stat-card">
                <span className="stat-num">1s</span>
                <span className="stat-label">Aurora Finality</span>
              </div>
              <div className="stat-card">
                <span className="stat-num">100%</span>
                <span className="stat-label">Non-Custodial</span>
              </div>
            </div>
          </div>

          {/* Right Column: Bioluminescent Visual Orb & Floating Glass Card */}
          <div className="hero-visual">
            <div className="visual-stage">
              <div className="glow-sphere"></div>
              
              {/* Ethereal Floating Jellyfish-Inspired Radial Accent */}
              <div className="jelly-glow"></div>

              {/* Floating Glass Metric Card */}
              <div className="floating-metric-card">
                <div className="metric-header">
                  <span className="metric-tag">VAULT METRICS</span>
                  <span className="metric-time">LIVE</span>
                </div>
                <div className="metric-big-num">10.00 NEAR</div>
                <div className="metric-sub">
                  Escrow Signer: <code>lakshay-payfold.testnet</code>
                </div>

                <div className="metric-divider"></div>

                <div className="metric-row">
                  <span>Network Target</span>
                  <strong>{currentChain.name} ({currentChain.id})</strong>
                </div>
                <div className="metric-row">
                  <span>Engine</span>
                  <strong>NEAR Chain Signatures MPC</strong>
                </div>
                <div className="metric-row">
                  <span>AI Agent</span>
                  <strong>Google Gemini 1.5 Flash</strong>
                </div>

                <button
                  onClick={() => {
                    setActiveTab("console");
                    scrollToSection("app-console");
                  }}
                  className="card-book-btn"
                >
                  Deposit Escrow ↗
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Editorial Statement Section (Matching Screenshot) */}
      <section className="statement-zone">
        <div className="statement-inner">
          <p className="statement-text">
            We <span className="red-word">architect</span> and deploy{" "}
            <span className="red-word">autonomous payout protocols</span> with security
            at the core, ensuring every prize disbursement{" "}
            <span className="red-word">enhances real user experiences</span> without manual friction.
          </p>
        </div>
      </section>

      {/* Interactive App & Workflow Section */}
      <section className="app-workspace" id="app-console" ref={formRef}>
        <div className="workspace-inner">
          {activeTab === "workflow" ? (
            /* Workflow Cards */
            <div className="workflow-deck">
              <div className="deck-card">
                <div className="step-count">01</div>
                <h3>Lock Prize in Escrow</h3>
                <p>
                  The organizer deposits the hackathon prize tokens into the
                  on-chain <code>PayFoldEscrow</code> contract. Funds remain trustlessly
                  locked in vault until winner identity is verified.
                </p>
                <div className="card-badge">Aurora &amp; Sepolia EVM</div>
              </div>

              <div className="deck-card">
                <div className="step-count">02</div>
                <h3>AI Outreach &amp; Extraction</h3>
                <p>
                  An autonomous Gemini AI agent contacts the winner with personalized
                  congratulations and instructions. When they reply, AI parses their EVM
                  wallet address without forms.
                </p>
                <div className="card-badge">Google Gemini + Resend</div>
              </div>

              <div className="deck-card glowing-border">
                <div className="step-count">03</div>
                <h3>NEAR MPC Disbursement</h3>
                <p>
                  NEAR&apos;s decentralized validator threshold network co-signs the
                  release transaction, broadcasting the payout directly to the winner
                  without any private keys on server disk.
                </p>
                <div className="card-badge red-badge">NEAR Chain Signatures</div>
              </div>
            </div>
          ) : (
            /* Console Form */
            <div className="console-split">
              {/* Left Side: Summary Card */}
              <div className="glass-summary-panel">
                <div className="summary-header">
                  <span className="chip-bullet"></span>
                  <span>Autonomous Payout Console</span>
                </div>
                <h2>Zero Spreadsheets. Verifiable On-Chain.</h2>
                <p className="summary-desc">
                  Deposit prize pools once. The agent handles communication, address
                  collection, cryptographic validation, and instant on-chain release.
                </p>

                <div className="protocol-pills">
                  <div className="proto-pill">
                    <strong>MPC Threshold</strong>
                    <span>NEAR v1.signer-prod</span>
                  </div>
                  <div className="proto-pill">
                    <strong>Settlement Speed</strong>
                    <span>~1 Second Finality</span>
                  </div>
                </div>

                <div className="audit-note">
                  🔒 Protected by Phala TEE &amp; NEAR Decentralized Validator Set.
                </div>
              </div>

              {/* Right Side: Form */}
              <div className="glass-form-panel">
                <div className="form-title-bar">
                  <h3>Announce Winner</h3>
                  <p>Deposit funds into escrow &amp; trigger AI email outreach</p>
                </div>

                {error && (
                  <div
                    className={`feedback-msg ${
                      error.includes("confirmed") || error.includes("successful")
                        ? "success"
                        : "danger"
                    }`}
                  >
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="agent-form">
                  <div className="form-group">
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

                  <div className="form-grid-2">
                    <div className="form-group">
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
                    <div className="form-group">
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

                  <div className="form-grid-3">
                    <div className="form-group">
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
                    <div className="form-group">
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
                    <div className="form-group">
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
                    disabled={isSubmitting || !isConnected}
                    className="submit-action-btn"
                  >
                    {isSubmitting
                      ? "Locking Escrow & Dispatching..."
                      : isConnected
                      ? "Lock Escrow & Announce Winner"
                      : "Connect Wallet to Announce"}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Sleek Minimal Footer */}
      <footer className="agent-footer">
        <div className="footer-container">
          <div className="footer-left">
            <span className="f-logo">PayFold</span>
            <span className="f-tagline">
              Autonomous Hackathon Prize Engine on NEAR Protocol
            </span>
          </div>

          <div className="footer-mid">
            <span>Built by Lakshay Deol &bull; NEAR HACKATHON 2026</span>
          </div>

          <div className="footer-right">
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

      {/* Sleek Dark Mode Bioluminescent Stylesheet */}
      <style jsx global>{`
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        body {
          background-color: #070709;
          color: #ededed;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
            Helvetica, Arial, sans-serif;
          overflow-x: hidden;
          -webkit-font-smoothing: antialiased;
        }

        .agent-universe {
          min-height: 100vh;
          position: relative;
          background: #070709;
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

        .ambient-glow.top-center {
          width: 600px;
          height: 600px;
          top: -150px;
          left: 50%;
          transform: translateX(-30%);
          background: radial-gradient(circle, rgba(255, 45, 60, 0.18) 0%, transparent 70%);
          animation: pulseAmbient 10s ease-in-out infinite alternate;
        }

        .ambient-glow.right-mid {
          width: 500px;
          height: 500px;
          top: 30%;
          right: -100px;
          background: radial-gradient(circle, rgba(255, 45, 60, 0.12) 0%, transparent 70%);
        }

        .ambient-glow.bottom-left {
          width: 550px;
          height: 550px;
          bottom: 10%;
          left: -150px;
          background: radial-gradient(circle, rgba(255, 45, 60, 0.08) 0%, transparent 70%);
        }

        @keyframes pulseAmbient {
          0% {
            opacity: 0.8;
            transform: translateX(-30%) scale(0.95);
          }
          100% {
            opacity: 1.2;
            transform: translateX(-30%) scale(1.08);
          }
        }

        /* 1. TOP NAVBAR */
        .top-nav {
          max-width: 1280px;
          margin: 0 auto;
          width: 100%;
          padding: 1.5rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: relative;
          z-index: 10;
        }

        .brand-lockup {
          display: flex;
          align-items: center;
          gap: 0.65rem;
        }

        .brand-dot {
          width: 12px;
          height: 12px;
          background: #ff2d3c;
          border-radius: 50%;
          box-shadow: 0 0 16px #ff2d3c;
        }

        .brand-name {
          font-size: 1.35rem;
          font-weight: 800;
          letter-spacing: -0.5px;
          color: #ffffff;
        }

        .center-pill-menu {
          display: flex;
          background: rgba(255, 255, 255, 0.04);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 0.3rem 0.4rem;
          border-radius: 9999px;
          gap: 0.25rem;
        }

        .pill-item {
          background: transparent;
          border: none;
          color: #8e8e93;
          padding: 0.45rem 1.15rem;
          border-radius: 9999px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          text-decoration: none;
          transition: all 0.2s ease;
        }

        .pill-item:hover {
          color: #ffffff;
        }

        .pill-item.active {
          background: rgba(255, 45, 60, 0.18);
          color: #ff4d5a;
          border: 1px solid rgba(255, 45, 60, 0.35);
        }

        .nav-actions {
          display: flex;
          align-items: center;
          gap: 1.25rem;
        }

        .near-tag {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: #c7c7cc;
          font-size: 0.8rem;
          font-weight: 600;
          padding: 0.4rem 0.85rem;
          border-radius: 9999px;
        }

        .live-pulse {
          width: 7px;
          height: 7px;
          background: #ff2d3c;
          border-radius: 50%;
          box-shadow: 0 0 8px #ff2d3c;
          animation: pulseDot 2s infinite;
        }

        @keyframes pulseDot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.85); }
        }

        /* 2. HERO ZONE */
        .hero-zone {
          max-width: 1280px;
          margin: 2.5rem auto 0;
          padding: 0 2rem;
          width: 100%;
          position: relative;
          z-index: 5;
        }

        .hero-columns {
          display: grid;
          grid-template-columns: 1.15fr 0.95fr;
          gap: 3.5rem;
          align-items: center;
        }

        .eyebrow-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          background: rgba(255, 45, 60, 0.1);
          border: 1px solid rgba(255, 45, 60, 0.25);
          color: #ff6b76;
          font-size: 0.8rem;
          font-weight: 700;
          padding: 0.35rem 0.9rem;
          border-radius: 9999px;
          margin-bottom: 1.5rem;
          letter-spacing: 0.2px;
        }

        .pill-spark {
          font-size: 0.85rem;
        }

        .hero-main-title {
          font-size: clamp(2.8rem, 5.5vw, 4.4rem);
          font-weight: 900;
          line-height: 1.08;
          letter-spacing: -1.5px;
          color: #ffffff;
          margin-bottom: 1.5rem;
        }

        .crimson-highlight {
          color: #ff3344;
          text-shadow: 0 0 35px rgba(255, 51, 68, 0.55);
        }

        .hero-subtext {
          font-size: 1.15rem;
          color: #98989f;
          line-height: 1.65;
          max-width: 560px;
          margin-bottom: 2.25rem;
        }

        .hero-subtext strong {
          color: #ffffff;
        }

        .cta-row {
          display: flex;
          gap: 1.25rem;
          margin-bottom: 3rem;
        }

        .btn-crimson {
          background: linear-gradient(135deg, #ff3344 0%, #d41728 100%);
          color: #ffffff;
          border: none;
          padding: 0.95rem 2rem;
          border-radius: 9999px;
          font-size: 1rem;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 8px 24px rgba(255, 51, 68, 0.35);
          transition: all 0.2s ease;
          text-decoration: none;
          display: inline-block;
        }

        .btn-crimson:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 30px rgba(255, 51, 68, 0.5);
        }

        .btn-glass {
          background: rgba(255, 255, 255, 0.05);
          color: #ededed;
          border: 1px solid rgba(255, 255, 255, 0.12);
          padding: 0.95rem 1.85rem;
          border-radius: 9999px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          text-decoration: none;
          display: inline-block;
        }

        .btn-glass:hover {
          background: rgba(255, 255, 255, 0.09);
          border-color: rgba(255, 255, 255, 0.2);
        }

        .stat-pills-row {
          display: flex;
          gap: 1.5rem;
        }

        .stat-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          padding: 0.85rem 1.25rem;
          border-radius: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }

        .stat-num {
          font-size: 1.5rem;
          font-weight: 800;
          color: #ffffff;
        }

        .stat-label {
          font-size: 0.75rem;
          color: #7a7a80;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        /* Hero Visual (Right Column) */
        .visual-stage {
          position: relative;
          min-height: 480px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .jelly-glow {
          position: absolute;
          width: 320px;
          height: 380px;
          background: radial-gradient(ellipse at center, rgba(255, 45, 60, 0.35) 0%, rgba(255, 20, 40, 0.1) 50%, transparent 75%);
          filter: blur(50px);
          animation: floatOrb 6s ease-in-out infinite alternate;
        }

        @keyframes floatOrb {
          0% { transform: translateY(-10px) scale(0.98); }
          100% { transform: translateY(15px) scale(1.04); }
        }

        .floating-metric-card {
          position: relative;
          z-index: 2;
          background: rgba(18, 18, 24, 0.75);
          backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 45, 60, 0.3);
          border-radius: 1.5rem;
          padding: 2.25rem;
          width: 100%;
          max-width: 390px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6), 0 0 30px rgba(255, 45, 60, 0.15);
        }

        .metric-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .metric-tag {
          font-size: 0.7rem;
          font-weight: 800;
          letter-spacing: 1px;
          color: #ff4d5a;
        }

        .metric-time {
          font-size: 0.7rem;
          color: #ff3344;
          font-weight: 700;
        }

        .metric-big-num {
          font-size: 2.5rem;
          font-weight: 900;
          color: #ffffff;
          letter-spacing: -1px;
          margin-bottom: 0.3rem;
        }

        .metric-sub {
          font-size: 0.8rem;
          color: #7a7a80;
          margin-bottom: 1.25rem;
        }

        .metric-sub code {
          color: #ededed;
          background: rgba(255, 255, 255, 0.08);
          padding: 0.1rem 0.35rem;
          border-radius: 0.3rem;
        }

        .metric-divider {
          height: 1px;
          background: rgba(255, 255, 255, 0.08);
          margin-bottom: 1.25rem;
        }

        .metric-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.85rem;
          margin-bottom: 0.75rem;
          color: #98989f;
        }

        .metric-row strong {
          color: #ffffff;
        }

        .card-book-btn {
          width: 100%;
          background: linear-gradient(135deg, #ff3344 0%, #b80f1e 100%);
          border: none;
          color: #ffffff;
          padding: 0.85rem;
          border-radius: 0.85rem;
          font-weight: 700;
          font-size: 0.95rem;
          cursor: pointer;
          margin-top: 1rem;
          transition: all 0.2s ease;
        }

        .card-book-btn:hover {
          box-shadow: 0 0 20px rgba(255, 51, 68, 0.5);
        }

        /* 3. EDITORIAL STATEMENT ZONE */
        .statement-zone {
          max-width: 1100px;
          margin: 5rem auto;
          padding: 0 2rem;
          text-align: center;
          position: relative;
          z-index: 5;
        }

        .statement-inner {
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          padding: 3.5rem 1rem;
        }

        .statement-text {
          font-size: clamp(1.5rem, 3vw, 2.3rem);
          font-weight: 700;
          line-height: 1.45;
          letter-spacing: -0.5px;
          color: #ffffff;
          max-width: 880px;
          margin: 0 auto;
        }

        .red-word {
          color: #ff3344;
          text-shadow: 0 0 20px rgba(255, 51, 68, 0.4);
        }

        /* 4. WORKSPACE / APP SECTION */
        .app-workspace {
          max-width: 1240px;
          margin: 0 auto 5rem;
          padding: 0 2rem;
          width: 100%;
          position: relative;
          z-index: 5;
        }

        .workspace-inner {
          width: 100%;
        }

        /* Workflow Cards Grid */
        .workflow-deck {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 1.75rem;
        }

        .deck-card {
          background: rgba(18, 18, 24, 0.6);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 1.5rem;
          padding: 2.25rem;
          display: flex;
          flex-direction: column;
          position: relative;
          transition: all 0.3s ease;
        }

        .deck-card:hover {
          border-color: rgba(255, 255, 255, 0.2);
          transform: translateY(-4px);
        }

        .deck-card.glowing-border {
          border-color: rgba(255, 51, 68, 0.4);
          box-shadow: 0 0 35px rgba(255, 51, 68, 0.12);
        }

        .step-count {
          font-size: 2.2rem;
          font-weight: 900;
          color: #ff3344;
          margin-bottom: 1rem;
          opacity: 0.9;
        }

        .deck-card h3 {
          font-size: 1.35rem;
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 0.65rem;
        }

        .deck-card p {
          color: #8e8e93;
          font-size: 0.95rem;
          line-height: 1.6;
          flex: 1;
        }

        .deck-card code {
          color: #ff6b76;
          background: rgba(255, 51, 68, 0.1);
          padding: 0.15rem 0.35rem;
          border-radius: 0.3rem;
        }

        .card-badge {
          margin-top: 1.75rem;
          align-self: flex-start;
          font-size: 0.75rem;
          font-weight: 700;
          background: rgba(255, 255, 255, 0.05);
          color: #c7c7cc;
          padding: 0.35rem 0.85rem;
          border-radius: 9999px;
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .card-badge.red-badge {
          background: rgba(255, 51, 68, 0.15);
          color: #ff4d5a;
          border-color: rgba(255, 51, 68, 0.3);
        }

        /* Console Split Layout */
        .console-split {
          display: grid;
          grid-template-columns: 1fr 1.25fr;
          gap: 2.5rem;
          align-items: stretch;
        }

        .glass-summary-panel {
          background: rgba(18, 18, 24, 0.75);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 1.75rem;
          padding: 2.5rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .summary-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #ff4d5a;
          font-size: 0.8rem;
          font-weight: 700;
          letter-spacing: 0.5px;
          margin-bottom: 1rem;
        }

        .chip-bullet {
          width: 8px;
          height: 8px;
          background: #ff2d3c;
          border-radius: 50%;
          box-shadow: 0 0 8px #ff2d3c;
        }

        .glass-summary-panel h2 {
          font-size: 2rem;
          font-weight: 800;
          line-height: 1.25;
          color: #ffffff;
          margin-bottom: 0.75rem;
        }

        .summary-desc {
          color: #8e8e93;
          font-size: 1rem;
          line-height: 1.6;
          margin-bottom: 2rem;
        }

        .protocol-pills {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
          margin-bottom: 2rem;
        }

        .proto-pill {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          padding: 0.85rem 1.15rem;
          border-radius: 0.85rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.85rem;
        }

        .proto-pill strong {
          color: #ededed;
        }

        .proto-pill span {
          color: #ff6b76;
          font-family: monospace;
        }

        .audit-note {
          font-size: 0.8rem;
          color: #636366;
          padding-top: 1rem;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
        }

        /* Form Panel */
        .glass-form-panel {
          background: rgba(18, 18, 24, 0.85);
          backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 45, 60, 0.25);
          border-radius: 1.75rem;
          padding: 2.5rem;
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.7), 0 0 40px rgba(255, 45, 60, 0.1);
        }

        .form-title-bar {
          margin-bottom: 1.75rem;
        }

        .form-title-bar h3 {
          font-size: 1.6rem;
          font-weight: 800;
          color: #ffffff;
          margin-bottom: 0.35rem;
        }

        .form-title-bar p {
          color: #8e8e93;
          font-size: 0.9rem;
        }

        .feedback-msg {
          padding: 0.85rem 1rem;
          border-radius: 0.75rem;
          font-size: 0.9rem;
          margin-bottom: 1.5rem;
        }

        .feedback-msg.success {
          background: rgba(0, 255, 135, 0.12);
          border: 1px solid rgba(0, 255, 135, 0.3);
          color: #00ff87;
        }

        .feedback-msg.danger {
          background: rgba(255, 45, 60, 0.12);
          border: 1px solid rgba(255, 45, 60, 0.35);
          color: #ff6b76;
        }

        .agent-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.45rem;
          flex: 1;
        }

        .form-group label {
          font-size: 0.8rem;
          font-weight: 700;
          color: #c7c7cc;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .form-group input {
          width: 100%;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 0.9rem 1.15rem;
          border-radius: 0.75rem;
          color: #ffffff;
          font-size: 0.95rem;
          transition: all 0.2s ease;
        }

        .form-group input:focus {
          outline: none;
          border-color: #ff3344;
          box-shadow: 0 0 0 3px rgba(255, 51, 68, 0.25);
          background: rgba(255, 255, 255, 0.06);
        }

        .form-grid-2 {
          display: flex;
          gap: 1.15rem;
        }

        .form-grid-3 {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 1.15rem;
        }

        .submit-action-btn {
          width: 100%;
          padding: 1.15rem;
          background: linear-gradient(135deg, #ff3344 0%, #c41221 100%);
          border: none;
          color: #ffffff;
          font-size: 1.05rem;
          font-weight: 800;
          border-radius: 9999px;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 10px 25px rgba(255, 51, 68, 0.35);
          margin-top: 0.75rem;
        }

        .submit-action-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 14px 35px rgba(255, 51, 68, 0.5);
        }

        .submit-action-btn:disabled {
          background: rgba(255, 255, 255, 0.08);
          color: #55555c;
          cursor: not-allowed;
          box-shadow: none;
        }

        /* Modal */
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
          z-index: 9999;
          padding: 1.5rem;
        }

        .modal-glass {
          background: #111117;
          border: 1px solid rgba(255, 51, 68, 0.35);
          border-radius: 1.5rem;
          padding: 2.5rem;
          max-width: 500px;
          width: 100%;
          text-align: center;
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(255, 51, 68, 0.2);
        }

        .modal-pill {
          display: inline-block;
          font-size: 0.75rem;
          font-weight: 800;
          color: #ff4d5a;
          background: rgba(255, 51, 68, 0.15);
          padding: 0.35rem 0.85rem;
          border-radius: 9999px;
          margin-bottom: 1rem;
        }

        .modal-title {
          font-size: 1.8rem;
          font-weight: 800;
          color: #ffffff;
          margin-bottom: 0.5rem;
        }

        .modal-text {
          font-size: 0.95rem;
          color: #8e8e93;
          line-height: 1.55;
          margin-bottom: 1.5rem;
        }

        .modal-code {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 0.85rem;
          border-radius: 0.75rem;
          font-family: monospace;
          color: #ff6b76;
          font-size: 0.85rem;
          word-break: break-all;
          margin-bottom: 1.75rem;
        }

        .modal-button-row {
          display: flex;
          gap: 1rem;
          justify-content: center;
        }

        /* 5. FOOTER */
        .agent-footer {
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          padding: 2.5rem 2rem;
          position: relative;
          z-index: 5;
        }

        .footer-container {
          max-width: 1280px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.9rem;
          color: #7a7a80;
        }

        .footer-left {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .f-logo {
          font-weight: 800;
          color: #ffffff;
        }

        .f-tagline {
          color: #55555c;
        }

        .footer-mid {
          color: #8e8e93;
        }

        .footer-right {
          display: flex;
          gap: 1.25rem;
        }

        .footer-right a {
          color: #98989f;
          text-decoration: none;
          transition: color 0.2s;
        }

        .footer-right a:hover {
          color: #ff3344;
        }

        /* RESPONSIVE */
        @media (max-width: 960px) {
          .hero-columns {
            grid-template-columns: 1fr;
            text-align: center;
          }
          .hero-subtext {
            margin: 0 auto 2rem;
          }
          .cta-row {
            justify-content: center;
          }
          .stat-pills-row {
            justify-content: center;
          }
          .console-split {
            grid-template-columns: 1fr;
          }
          .top-nav {
            flex-direction: column;
            gap: 1.25rem;
          }
          .footer-container {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
          }
        }

        @media (max-width: 640px) {
          .form-grid-2,
          .form-grid-3 {
            grid-template-columns: 1fr;
            flex-direction: column;
          }
          .cta-row {
            flex-direction: column;
          }
          .stat-pills-row {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}
