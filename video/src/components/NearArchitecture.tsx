import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { VIDEO_CONFIG } from "../config/videoConfig";

export const NearArchitecture: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame,
    fps,
    config: { damping: 18, stiffness: 90 },
  });

  const nodeScale = interpolate(entrance, [0, 1], [0.85, 1]);
  const nodeOpacity = interpolate(entrance, [0, 1], [0, 1]);

  // Animated packet progress along paths (0 to 1)
  const packetPos1 = (frame * 0.02) % 1;
  const packetPos2 = ((frame + 20) * 0.02) % 1;
  const packetPos3 = ((frame + 40) * 0.02) % 1;

  // Validator node pulse
  const vPulse = (idx: number) =>
    interpolate(Math.sin((frame + idx * 15) * 0.1), [-1, 1], [0.5, 1]);

  return (
    <div
      style={{
        position: "relative",
        width: "1480px",
        height: "760px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transform: `scale(${nodeScale})`,
        opacity: nodeOpacity,
      }}
    >
      {/* SVG Connecting Beam Lines */}
      <svg
        width="1480"
        height="760"
        style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      >
        <defs>
          <linearGradient id="beamGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#E51E2B" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#37D99B" stopOpacity="0.8" />
          </linearGradient>

          <filter id="glowFilt" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Center to Node 1 (Top Left: NEAR MPC) */}
        <line
          x1="740"
          y1="380"
          x2="280"
          y2="200"
          stroke="rgba(139, 92, 246, 0.3)"
          strokeWidth="3"
          strokeDasharray="6 6"
        />
        <line
          x1="740"
          y1="380"
          x2="280"
          y2="200"
          stroke="#8B5CF6"
          strokeWidth="2"
          filter="url(#glowFilt)"
          strokeDashoffset={-frame * 3}
          strokeDasharray="30 150"
        />

        {/* Center to Node 2 (Top Right: Shade / Phala TEE) */}
        <line
          x1="740"
          y1="380"
          x2="1200"
          y2="200"
          stroke="rgba(229, 30, 43, 0.3)"
          strokeWidth="3"
          strokeDasharray="6 6"
        />
        <line
          x1="740"
          y1="380"
          x2="1200"
          y2="200"
          stroke="#E51E2B"
          strokeWidth="2"
          filter="url(#glowFilt)"
          strokeDashoffset={-frame * 3}
          strokeDasharray="30 150"
        />

        {/* Center to Node 3 (Bottom Center: Aurora EVM) */}
        <line
          x1="740"
          y1="380"
          x2="740"
          y2="620"
          stroke="rgba(55, 217, 155, 0.3)"
          strokeWidth="3"
          strokeDasharray="6 6"
        />
        <line
          x1="740"
          y1="380"
          x2="740"
          y2="620"
          stroke="#37D99B"
          strokeWidth="2"
          filter="url(#glowFilt)"
          strokeDashoffset={-frame * 3}
          strokeDasharray="30 150"
        />
      </svg>

      {/* CENTER NODE: PAYFOLD AUTONOMOUS AGENT */}
      <div
        style={{
          position: "absolute",
          left: "740px",
          top: "380px",
          transform: "translate(-50%, -50%)",
          width: "320px",
          padding: "26px 20px",
          borderRadius: "24px",
          background: "linear-gradient(135deg, rgba(229, 30, 43, 0.18) 0%, rgba(139, 92, 246, 0.22) 100%)",
          border: "2px solid rgba(229, 30, 43, 0.6)",
          boxShadow: "0 0 50px rgba(229, 30, 43, 0.35), inset 0 0 30px rgba(139, 92, 246, 0.2)",
          backdropFilter: "blur(20px)",
          textAlign: "center",
          zIndex: 5,
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: "14px",
            background: "#E51E2B",
            margin: "0 auto 12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 900,
            color: "#fff",
            fontSize: "22px",
            boxShadow: "0 0 20px rgba(229, 30, 43, 0.6)",
          }}
        >
          P
        </div>
        <h3 style={{ margin: 0, color: "#fff", fontSize: "18px", fontWeight: 800, letterSpacing: "-0.01em" }}>
          PAYFOLD AUTONOMOUS AGENT
        </h3>
        <span style={{ fontSize: "12px", color: "#A78BFA", marginTop: "4px", display: "block" }}>
          Decentralized Orchestrator
        </span>
      </div>

      {/* NODE 1: NEAR CHAIN SIGNATURES (MPC Threshold Network) */}
      <div
        style={{
          position: "absolute",
          left: "280px",
          top: "200px",
          transform: "translate(-50%, -50%)",
          width: "380px",
          borderRadius: "20px",
          background: "rgba(16, 18, 27, 0.95)",
          border: "1px solid rgba(139, 92, 246, 0.5)",
          boxShadow: "0 15px 40px rgba(139, 92, 246, 0.2)",
          padding: "24px",
          zIndex: 4,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#8B5CF6" }} />
            <h4 style={{ margin: 0, color: "#fff", fontSize: "16px", fontWeight: 700 }}>
              NEAR CHAIN SIGNATURES
            </h4>
          </div>
          <span style={{ fontSize: "11px", color: "#A78BFA", background: "rgba(139, 92, 246, 0.15)", padding: "2px 8px", borderRadius: "8px" }}>
            MPC Network
          </span>
        </div>

        <p style={{ margin: "0 0 14px", fontSize: "13px", color: "#9295A5", lineHeight: 1.4 }}>
          Decentralized threshold MPC co-signing via <strong>v1.signer-prod.testnet</strong>. Derives secp256k1 keys without storing private keys.
        </p>

        {/* Animated Validator Nodes Mesh */}
        <div style={{ display: "flex", justifyContent: "space-around", padding: "12px", background: "rgba(0, 0, 0, 0.3)", borderRadius: "10px" }}>
          {[1, 2, 3, 4, 5].map((val) => (
            <div key={val} style={{ textAlign: "center" }}>
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  background: "#8B5CF6",
                  margin: "0 auto 4px",
                  opacity: vPulse(val),
                  boxShadow: `0 0 12px #8B5CF6`,
                }}
              />
              <span style={{ fontSize: "10px", color: "#9295A5" }}>Val #{val}</span>
            </div>
          ))}
        </div>
      </div>

      {/* NODE 2: SHADE AGENT + PHALA TEE (Confidential Enclave) */}
      <div
        style={{
          position: "absolute",
          left: "1200px",
          top: "200px",
          transform: "translate(-50%, -50%)",
          width: "380px",
          borderRadius: "20px",
          background: "rgba(16, 18, 27, 0.95)",
          border: "1px solid rgba(229, 30, 43, 0.5)",
          boxShadow: "0 15px 40px rgba(229, 30, 43, 0.2)",
          padding: "24px",
          zIndex: 4,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#E51E2B" }} />
            <h4 style={{ margin: 0, color: "#fff", fontSize: "16px", fontWeight: 700 }}>
              SHADE AGENT &bull; PHALA TEE
            </h4>
          </div>
          <span style={{ fontSize: "11px", color: "#E51E2B", background: "rgba(229, 30, 43, 0.15)", padding: "2px 8px", borderRadius: "8px" }}>
            Intel TDX
          </span>
        </div>

        <p style={{ margin: "0 0 14px", fontSize: "13px", color: "#9295A5", lineHeight: 1.4 }}>
          Confidential virtual machine execution. Validates inbound email replies and constructs raw unsigned EVM transaction payloads inside hardware enclaves.
        </p>

        <div style={{ padding: "10px 14px", background: "rgba(229, 30, 43, 0.08)", borderRadius: "10px", border: "1px dashed rgba(229, 30, 43, 0.3)", fontSize: "11px", color: "#E51E2B" }}>
          Secure Enclave Boundary &bull; Tamper-Proof Execution
        </div>
      </div>

      {/* NODE 3: AURORA EVM (Settlement Layer) */}
      <div
        style={{
          position: "absolute",
          left: "740px",
          top: "620px",
          transform: "translate(-50%, -50%)",
          width: "440px",
          borderRadius: "20px",
          background: "rgba(16, 18, 27, 0.95)",
          border: "1px solid rgba(55, 217, 155, 0.5)",
          boxShadow: "0 15px 40px rgba(55, 217, 155, 0.2)",
          padding: "24px",
          zIndex: 4,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#37D99B" }} />
            <h4 style={{ margin: 0, color: "#fff", fontSize: "16px", fontWeight: 700 }}>
              AURORA EVM SETTLEMENT
            </h4>
          </div>
          <span style={{ fontSize: "11px", color: "#37D99B", background: "rgba(55, 217, 155, 0.15)", padding: "2px 8px", borderRadius: "8px" }}>
            EVM on NEAR
          </span>
        </div>

        <p style={{ margin: "0 0 10px", fontSize: "13px", color: "#9295A5", lineHeight: 1.4 }}>
          Broadcasts finalized RSV transactions into <strong>PayFoldEscrow.sol</strong> with instant 1-second finality and sub-cent fees.
        </p>

        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#fff", background: "rgba(0, 0, 0, 0.3)", padding: "8px 14px", borderRadius: "8px" }}>
          <span>Contract: 0xFcAa...c660</span>
          <span style={{ color: "#37D99B", fontWeight: 600 }}>Zero Slippage</span>
        </div>
      </div>

      {/* PROMINENT BOTTOM BANNER */}
      <div
        style={{
          position: "absolute",
          bottom: "10px",
          padding: "10px 28px",
          borderRadius: "20px",
          background: "rgba(8, 9, 13, 0.8)",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          fontSize: "14px",
          fontWeight: 700,
          color: "#E8B45A",
          letterSpacing: "0.02em",
          boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
          zIndex: 6,
        }}
      >
        NO EVM PRIVATE KEY STORED ON THE APPLICATION SERVER
      </div>
    </div>
  );
};
