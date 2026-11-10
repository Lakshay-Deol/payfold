import { useState } from "react";
import { ethers } from "ethers";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { createWalletClient, custom } from "viem";
import { sepolia } from "wagmi/chains";
import { parseEther } from "ethers";

const CONTRACT_ADDRESS = "0xFcAaf9F83875C2c4fEF050af893e90061254c660";
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
      const walletClient = createWalletClient({
        chain: sepolia,
        transport: custom(window.ethereum),
      });

      // Convert ETH to Wei
      const amountInWei = parseEther(formData.amount);

      // Get the hackathon ID from data.json
      const response = await fetch("/api/getHackathonId", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ hackathonName: formData.hackathonName }),
      });
      const { hackathonId } = await response.json();
      console.log("Using hackathon ID:", hackathonId);

      await walletClient.writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: "announceWinner",
        args: [hackathonId, formData.email, amountInWei],
        value: amountInWei,
        account: address,
      });

      try {
        const response = await fetch("/api/sendWinners", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
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

        if (!response.ok) {
          throw new Error("Failed to send winner data to API");
        }

        const data = await response.json();
        setHackathonAddress(data.hackathonAddress);
        setShowModal(true);
        setError("Transaction and data submission successful!");
      } catch (apiError) {
        console.error("API Error:", apiError);
        setError("Transaction successful but failed to send data to API");
      }

      // Clear form
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
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
        padding: "2rem",
        color: "#fff",
      }}
    >
      {/* Modal */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "rgba(255, 255, 255, 0.1)",
              backdropFilter: "blur(10px)",
              padding: "2rem",
              borderRadius: "1rem",
              maxWidth: "500px",
              width: "90%",
              border: "1px solid rgba(255, 255, 255, 0.2)",
            }}
          >
            <h3 style={{ marginBottom: "1rem", color: "#00ff87" }}>
              Hackathon Address
            </h3>
            <p style={{ marginBottom: "1rem", wordBreak: "break-all" }}>
              {hackathonAddress}
            </p>
            <div style={{ display: "flex", gap: "1rem" }}>
              <button
                onClick={() => copyToClipboard(hackathonAddress)}
                style={{
                  padding: "0.5rem 1rem",
                  background: "linear-gradient(45deg, #00ff87, #60efff)",
                  border: "none",
                  borderRadius: "0.5rem",
                  color: "#1a1a2e",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >
                Copy Address
              </button>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  padding: "0.5rem 1rem",
                  background: "rgba(255, 255, 255, 0.1)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  borderRadius: "0.5rem",
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "3rem",
          alignItems: "center",
          padding: "2rem",
        }}
      >
        {/* Left Section */}
        <div
          style={{
            padding: "2rem",
            animation: "fadeIn 1s ease-in",
          }}
        >
          <h1
            style={{
              fontSize: "3.5rem",
              fontWeight: "800",
              marginBottom: "1.5rem",
              background: "linear-gradient(45deg, #00ff87, #60efff)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Welcome to PayFold 💳
          </h1>
          <p
            style={{
              fontSize: "1.25rem",
              color: "#a0aec0",
              marginBottom: "2rem",
              lineHeight: "1.6",
            }}
          >
            Automate your hackathon prize payouts via email. Secure. Fast.
            On-chain.
          </p>
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
            }}
          >
            {[
              "Eliminate manual prize handling",
              "Collect wallet addresses via Gmail",
              "Send Aurora prizes in one click",
            ].map((item, index) => (
              <li
                key={index}
                style={{
                  marginBottom: "1rem",
                  display: "flex",
                  alignItems: "center",
                  color: "#e2e8f0",
                  fontSize: "1.1rem",
                }}
              >
                <span
                  style={{
                    color: "#00ff87",
                    marginRight: "0.75rem",
                    fontSize: "1.5rem",
                  }}
                >
                  •
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Right Section (Form) */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(10px)",
            borderRadius: "1.5rem",
            padding: "2.5rem",
            boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
            border: "1px solid rgba(255, 255, 255, 0.18)",
            animation: "slideIn 1s ease-out",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1.5rem",
              marginBottom: "2rem",
            }}
          >
            <div style={{ display: "flex", justifyContent: "center" }}>
              <ConnectButton />
            </div>
            {error && (
              <div
                style={{
                  color: error.includes("successful") ? "#00ff87" : "#ff6b6b",
                  fontSize: "0.9rem",
                  textAlign: "center",
                }}
              >
                {error}
              </div>
            )}
          </div>

          <h2
            style={{
              fontSize: "2rem",
              fontWeight: "600",
              marginBottom: "2rem",
              color: "#fff",
              textAlign: "center",
            }}
          >
            Winner Details
          </h2>
          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  color: "#a0aec0",
                  marginBottom: "0.5rem",
                  fontSize: "0.95rem",
                }}
              >
                Hackathon Name
              </label>
              <input
                type="text"
                name="hackathonName"
                value={formData.hackathonName}
                onChange={handleInputChange}
                placeholder="ETH Global"
                style={{
                  width: "100%",
                  padding: "0.75rem 1rem",
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "0.75rem",
                  color: "#fff",
                  fontSize: "1rem",
                  transition: "all 0.3s ease",
                }}
              />
            </div>
            <div>
              <label
                style={{
                  display: "block",
                  color: "#a0aec0",
                  marginBottom: "0.5rem",
                  fontSize: "0.95rem",
                }}
              >
                Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="John Doe"
                style={{
                  width: "100%",
                  padding: "0.75rem 1rem",
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "0.75rem",
                  color: "#fff",
                  fontSize: "1rem",
                  transition: "all 0.3s ease",
                }}
              />
            </div>
            <div>
              <label
                style={{
                  display: "block",
                  color: "#a0aec0",
                  marginBottom: "0.5rem",
                  fontSize: "0.95rem",
                }}
              >
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="john@example.com"
                style={{
                  width: "100%",
                  padding: "0.75rem 1rem",
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "0.75rem",
                  color: "#fff",
                  fontSize: "1rem",
                  transition: "all 0.3s ease",
                }}
              />
            </div>
            <div>
              <label
                style={{
                  display: "block",
                  color: "#a0aec0",
                  marginBottom: "0.5rem",
                  fontSize: "0.95rem",
                }}
              >
                Amount (ETH)
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                placeholder="0.5"
                step="0.00000001"
                min="0"
                style={{
                  width: "100%",
                  padding: "0.75rem 1rem",
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "0.75rem",
                  color: "#fff",
                  fontSize: "1rem",
                  transition: "all 0.3s ease",
                }}
              />
            </div>
            <div>
              <label
                style={{
                  display: "block",
                  color: "#a0aec0",
                  marginBottom: "0.5rem",
                  fontSize: "0.95rem",
                }}
              >
                Place
              </label>
              <input
                type="text"
                name="place"
                value={formData.place}
                onChange={handleInputChange}
                placeholder="1st Place"
                style={{
                  width: "100%",
                  padding: "0.75rem 1rem",
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "0.75rem",
                  color: "#fff",
                  fontSize: "1rem",
                  transition: "all 0.3s ease",
                }}
              />
            </div>
            <div>
              <label
                style={{
                  display: "block",
                  color: "#a0aec0",
                  marginBottom: "0.5rem",
                  fontSize: "0.95rem",
                }}
              >
                Track
              </label>
              <input
                type="text"
                name="track"
                value={formData.track}
                onChange={handleInputChange}
                placeholder="DeFi"
                style={{
                  width: "100%",
                  padding: "0.75rem 1rem",
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "0.75rem",
                  color: "#fff",
                  fontSize: "1rem",
                  transition: "all 0.3s ease",
                }}
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting || !isConnected}
              style={{
                width: "100%",
                padding: "1rem",
                background:
                  isSubmitting || !isConnected
                    ? "rgba(255, 255, 255, 0.1)"
                    : "linear-gradient(45deg, #00ff87, #60efff)",
                border: "none",
                borderRadius: "0.75rem",
                color: isSubmitting || !isConnected ? "#a0aec0" : "#1a1a2e",
                fontSize: "1.1rem",
                fontWeight: "600",
                cursor:
                  isSubmitting || !isConnected ? "not-allowed" : "pointer",
                transition: "all 0.3s ease",
                marginTop: "1rem",
              }}
              onMouseOver={(e) =>
                !isSubmitting &&
                isConnected &&
                (e.target.style.transform = "scale(1.02)")
              }
              onMouseOut={(e) =>
                !isSubmitting &&
                isConnected &&
                (e.target.style.transform = "scale(1)")
              }
            >
              {isSubmitting ? "Processing..." : "Send Prize"}
            </button>
          </form>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        input:focus {
          outline: none;
          border-color: #00ff87 !important;
          box-shadow: 0 0 0 2px rgba(0, 255, 135, 0.2);
        }

        input::placeholder {
          color: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </div>
  );
}
