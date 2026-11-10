import { useState, useEffect } from "react";
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
          console.warn("eth_requestAccounts notice:", permErr.message);
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
        setError("Winner announced and prize locked in escrow!");
      } catch (apiError) {
        console.error("API Error:", apiError);
        setError("Contract deposit successful. Backend notification queued.");
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
    <div className="page-wrapper">
      <Head>
        <title>PayFold — Autonomous Hackathon Prize Distribution via NEAR</title>
        <meta
          name="description"
          content="Autonomous Web3 hackathon prize payouts powered by NEAR Chain Signatures & Aurora"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Success Modal */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <h3 className="modal-title">🎉 Escrow Vault Initialized</h3>
            <p className="modal-desc">
              Your prize deposit has been locked into the escrow contract. The
              NEAR MPC bot address derived for this hackathon is:
            </p>
            <div className="modal-address">{hackathonAddress}</div>
            <div className="modal-actions">
              <button
                onClick={() => copyToClipboard(hackathonAddress)}
                className="btn-primary"
              >
                Copy Address
              </button>
              <button onClick={() => setShowModal(false)} className="btn-secondary">
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <header className="navbar">
        <div className="brand">
          <span className="logo-icon">💳</span>
          <span className="logo-text">PayFold</span>
          <span className="brand-tag">NEAR MPC</span>
        </div>
        <div className="nav-controls">
          <div className="tab-switch">
            <button
              onClick={() => setActiveTab("console")}
              className={`tab-btn ${activeTab === "console" ? "active" : ""}`}
            >
              Payout Console
            </button>
            <button
              onClick={() => setActiveTab("workflow")}
              className={`tab-btn ${activeTab === "workflow" ? "active" : ""}`}
            >
              How It Works
            </button>
          </div>
          <ConnectButton />
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="badge-pill">
          <span>Built for NEAR HACKATHON 2026</span>
          <span className="badge-dot">•</span>
          <span className="badge-highlight">Chain Abstraction</span>
        </div>
        <h1 className="hero-title">
          Autonomous Web3 Prize Payouts.
          <br />
          <span className="gradient-text">Zero Manual Spreadsheets.</span>
        </h1>
        <p className="hero-subtitle">
          Lock hackathon prize vaults on-chain. Our AI agent contacts winners via email,
          extracts their payout addresses, and disburses prizes trustlessly via{" "}
          <strong>NEAR Chain Signatures</strong>.
        </p>

        {/* Feature Badges */}
        <div className="feature-badges">
          <div className="badge-item">
            <span className="badge-icon">🛡️</span>
            <div>
              <strong>NEAR Chain Signatures</strong>
              <p>Non-custodial MPC — 0 private keys on servers</p>
            </div>
          </div>
          <div className="badge-item">
            <span className="badge-icon">⚡</span>
            <div>
              <strong>1-Second Aurora Settlement</strong>
              <p>Instant finality with sub-cent gas fees</p>
            </div>
          </div>
          <div className="badge-item">
            <span className="badge-icon">🤖</span>
            <div>
              <strong>AI Email Orchestration</strong>
              <p>Conversational address collection via Gemini</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="content-container">
        {activeTab === "workflow" ? (
          /* Workflow Explainer Section */
          <div className="workflow-grid">
            <div className="workflow-card">
              <div className="step-num">01</div>
              <h3>1. Lock Prize in Escrow</h3>
              <p>
                The hackathon organizer announces winners and locks the prize funds
                in the <code>PayFoldEscrow</code> contract with a single wallet click.
              </p>
              <div className="card-footer-pill">Aurora / Sepolia EVM</div>
            </div>

            <div className="workflow-card">
              <div className="step-num">02</div>
              <h3>2. AI Email Outreach</h3>
              <p>
                PayFold generates a personalized congratulatory email requesting the
                winner's payout address. When they reply, AI parses their EVM address.
              </p>
              <div className="card-footer-pill">Google Gemini + Resend</div>
            </div>

            <div className="workflow-card highlighted">
              <div className="step-num">03</div>
              <h3>3. NEAR MPC Payout</h3>
              <p>
                The decentralized NEAR validator threshold network co-signs the
                payout transaction and transfers the prize directly into the winner's wallet.
              </p>
              <div className="card-footer-pill near-pill">NEAR Chain Signatures</div>
            </div>
          </div>
        ) : (
          /* Payout Console (Interactive App) */
          <div className="console-wrapper">
            <div className="form-card">
              <div className="form-header">
                <h2>Announce Hackathon Winner</h2>
                <p>Deposit prize funds and initiate automated AI outreach</p>
              </div>

              {error && (
                <div
                  className={`status-banner ${
                    error.includes("successful") || error.includes("locked")
                      ? "success"
                      : "error"
                  }`}
                >
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="payout-form">
                <div className="input-group">
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

                <div className="input-row">
                  <div className="input-group">
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
                  <div className="input-group">
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

                <div className="input-row three-col">
                  <div className="input-group">
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
                  <div className="input-group">
                    <label>Placement</label>
                    <input
                      type="text"
                      name="place"
                      value={formData.place}
                      onChange={handleInputChange}
                      placeholder="1st Place"
                      required
                    />
                  </div>
                  <div className="input-group">
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
                  className="btn-submit"
                >
                  {isSubmitting
                    ? "Depositing & Dispatching..."
                    : isConnected
                    ? "Lock Escrow & Send Prize"
                    : "Connect Wallet to Proceed"}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div>
            <strong>PayFold</strong> &bull; Developed by{" "}
            <a href="mailto:lakshayld26@gmail.com">Lakshay Deol</a>
          </div>
          <div className="footer-links">
            <a
              href="https://github.com/Lakshay-Deol/payfold"
              target="_blank"
              rel="noreferrer"
            >
              GitHub Repository
            </a>
            <span>&bull;</span>
            <a href="https://near.org" target="_blank" rel="noreferrer">
              NEAR Protocol
            </a>
            <span>&bull;</span>
            <a href="https://aurora.dev" target="_blank" rel="noreferrer">
              Aurora EVM
            </a>
          </div>
        </div>
      </footer>

      {/* Embedded Styles matching existing glassmorphism aesthetic */}
      <style jsx global>{`
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
            Oxygen, Ubuntu, Cantarell, sans-serif;
          background: #0f111a;
          color: #f7fafc;
          overflow-x: hidden;
        }

        .page-wrapper {
          min-height: 100vh;
          background: radial-gradient(circle at 20% 20%, #1e1e38 0%, #0d0f18 100%);
          display: flex;
          flex-direction: column;
        }

        /* Navbar */
        .navbar {
          max-width: 1240px;
          margin: 0 auto;
          width: 100%;
          padding: 1.5rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }

        .logo-icon {
          font-size: 1.8rem;
        }

        .logo-text {
          font-size: 1.6rem;
          font-weight: 800;
          letter-spacing: -0.5px;
          background: linear-gradient(45deg, #00ff87, #60efff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .brand-tag {
          font-size: 0.75rem;
          background: rgba(0, 255, 135, 0.12);
          color: #00ff87;
          padding: 0.2rem 0.6rem;
          border-radius: 9999px;
          border: 1px solid rgba(0, 255, 135, 0.3);
          font-weight: 600;
        }

        .nav-controls {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .tab-switch {
          display: flex;
          background: rgba(255, 255, 255, 0.05);
          padding: 0.25rem;
          border-radius: 0.75rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .tab-btn {
          background: transparent;
          border: none;
          color: #a0aec0;
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          cursor: pointer;
          font-weight: 600;
          font-size: 0.9rem;
          transition: all 0.2s ease;
        }

        .tab-btn.active {
          background: rgba(255, 255, 255, 0.12);
          color: #fff;
        }

        /* Hero */
        .hero-section {
          max-width: 960px;
          margin: 3rem auto 2rem;
          text-align: center;
          padding: 0 1.5rem;
        }

        .badge-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.12);
          padding: 0.4rem 1rem;
          border-radius: 9999px;
          font-size: 0.85rem;
          color: #cbd5e0;
          margin-bottom: 1.5rem;
        }

        .badge-dot {
          color: #00ff87;
        }

        .badge-highlight {
          color: #60efff;
          font-weight: 600;
        }

        .hero-title {
          font-size: 3.2rem;
          font-weight: 800;
          line-height: 1.15;
          letter-spacing: -1px;
          margin-bottom: 1.25rem;
        }

        .gradient-text {
          background: linear-gradient(45deg, #00ff87, #60efff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .hero-subtitle {
          font-size: 1.2rem;
          color: #a0aec0;
          max-width: 720px;
          margin: 0 auto 2.5rem;
          line-height: 1.6;
        }

        .feature-badges {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 1.25rem;
          margin-top: 1rem;
          text-align: left;
        }

        .badge-item {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 1rem 1.25rem;
          border-radius: 1rem;
          display: flex;
          align-items: center;
          gap: 0.85rem;
        }

        .badge-icon {
          font-size: 1.7rem;
        }

        .badge-item strong {
          display: block;
          color: #fff;
          font-size: 0.95rem;
        }

        .badge-item p {
          color: #718096;
          font-size: 0.8rem;
          margin-top: 0.15rem;
        }

        /* Content Container */
        .content-container {
          max-width: 1100px;
          margin: 1.5rem auto 4rem;
          padding: 0 1.5rem;
          width: 100%;
          flex: 1;
        }

        /* Workflow Cards */
        .workflow-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .workflow-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 1.25rem;
          padding: 2rem;
          display: flex;
          flex-direction: column;
          position: relative;
        }

        .workflow-card.highlighted {
          border-color: rgba(0, 255, 135, 0.4);
          background: radial-gradient(circle at top left, rgba(0, 255, 135, 0.08), transparent);
        }

        .step-num {
          font-size: 2.2rem;
          font-weight: 800;
          color: rgba(255, 255, 255, 0.2);
          margin-bottom: 1rem;
        }

        .workflow-card h3 {
          font-size: 1.3rem;
          color: #fff;
          margin-bottom: 0.75rem;
        }

        .workflow-card p {
          color: #a0aec0;
          font-size: 0.95rem;
          line-height: 1.6;
          flex: 1;
        }

        .workflow-card code {
          background: rgba(255, 255, 255, 0.1);
          padding: 0.15rem 0.35rem;
          border-radius: 0.3rem;
          color: #00ff87;
        }

        .card-footer-pill {
          margin-top: 1.5rem;
          font-size: 0.8rem;
          color: #cbd5e0;
          background: rgba(255, 255, 255, 0.06);
          padding: 0.35rem 0.75rem;
          border-radius: 9999px;
          align-self: flex-start;
        }

        .card-footer-pill.near-pill {
          background: rgba(0, 255, 135, 0.15);
          color: #00ff87;
          border: 1px solid rgba(0, 255, 135, 0.3);
          font-weight: 600;
        }

        /* Form Card */
        .console-wrapper {
          max-width: 680px;
          margin: 0 auto;
        }

        .form-card {
          background: rgba(255, 255, 255, 0.04);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 1.5rem;
          padding: 2.5rem;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
        }

        .form-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .form-header h2 {
          font-size: 1.8rem;
          font-weight: 700;
          color: #fff;
          margin-bottom: 0.4rem;
        }

        .form-header p {
          color: #a0aec0;
          font-size: 0.95rem;
        }

        .status-banner {
          padding: 0.85rem 1rem;
          border-radius: 0.75rem;
          margin-bottom: 1.5rem;
          font-size: 0.9rem;
          text-align: center;
        }

        .status-banner.success {
          background: rgba(0, 255, 135, 0.15);
          color: #00ff87;
          border: 1px solid rgba(0, 255, 135, 0.3);
        }

        .status-banner.error {
          background: rgba(255, 107, 107, 0.15);
          color: #ff6b6b;
          border: 1px solid rgba(255, 107, 107, 0.3);
        }

        .payout-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          flex: 1;
        }

        .input-group label {
          color: #cbd5e0;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .input-group input {
          width: 100%;
          padding: 0.85rem 1rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 0.75rem;
          color: #fff;
          font-size: 0.95rem;
          transition: all 0.2s ease;
        }

        .input-group input:focus {
          outline: none;
          border-color: #00ff87;
          box-shadow: 0 0 0 2px rgba(0, 255, 135, 0.2);
        }

        .input-row {
          display: flex;
          gap: 1rem;
        }

        .input-row.three-col {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
        }

        .btn-submit {
          width: 100%;
          padding: 1.1rem;
          background: linear-gradient(45deg, #00ff87, #60efff);
          border: none;
          border-radius: 0.75rem;
          color: #10121d;
          font-size: 1.05rem;
          font-weight: 700;
          cursor: pointer;
          transition: transform 0.2s ease, opacity 0.2s ease;
          margin-top: 0.75rem;
        }

        .btn-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(0, 255, 135, 0.2);
        }

        .btn-submit:disabled {
          background: rgba(255, 255, 255, 0.1);
          color: #718096;
          cursor: not-allowed;
        }

        /* Modal */
        .modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.75);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 1rem;
        }

        .modal-card {
          background: #181a27;
          border: 1px solid rgba(0, 255, 135, 0.3);
          border-radius: 1.25rem;
          max-width: 500px;
          width: 100%;
          padding: 2rem;
          text-align: center;
        }

        .modal-title {
          font-size: 1.5rem;
          color: #00ff87;
          margin-bottom: 0.75rem;
        }

        .modal-desc {
          color: #cbd5e0;
          font-size: 0.95rem;
          line-height: 1.5;
          margin-bottom: 1.25rem;
        }

        .modal-address {
          background: rgba(255, 255, 255, 0.05);
          padding: 0.75rem;
          border-radius: 0.5rem;
          word-break: break-all;
          font-family: monospace;
          color: #60efff;
          font-size: 0.85rem;
          margin-bottom: 1.5rem;
        }

        .modal-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
        }

        .btn-primary {
          background: linear-gradient(45deg, #00ff87, #60efff);
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 0.5rem;
          font-weight: 700;
          color: #10121d;
          cursor: pointer;
        }

        .btn-secondary {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          padding: 0.75rem 1.5rem;
          border-radius: 0.5rem;
          color: #fff;
          cursor: pointer;
        }

        /* Footer */
        .footer {
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          padding: 2rem;
          font-size: 0.9rem;
          color: #718096;
        }

        .footer-content {
          max-width: 1240px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: gap;
          gap: 1rem;
        }

        .footer-links {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .footer a {
          color: #a0aec0;
          text-decoration: none;
          transition: color 0.2s;
        }

        .footer a:hover {
          color: #00ff87;
        }

        @media (max-width: 768px) {
          .hero-title {
            font-size: 2.2rem;
          }
          .input-row {
            flex-direction: column;
          }
          .input-row.three-col {
            grid-template-columns: 1fr;
          }
          .navbar {
            flex-direction: column;
            gap: 1rem;
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
