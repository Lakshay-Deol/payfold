import { contracts, chainAdapters } from "chainsig.js";
import { createPublicClient, http } from "viem";

export const ethRpcUrl = process.env.AURORA_RPC_URL || "https://1rpc.io/aurora";

const MPC_CONTRACT = new contracts.ChainSignatureContract({
  networkId: "testnet",
  contractId: "v1.signer-prod.testnet",
});

const publicClient = createPublicClient({
  transport: http(ethRpcUrl),
});

export const Evm = new chainAdapters.evm.EVM({
  publicClient,
  contract: MPC_CONTRACT,
});

export function convertToDecimal(bigIntValue, decimals, decimalPlaces = 6) {
  let strValue = bigIntValue.toString();

  if (strValue.length <= decimals) {
    strValue = strValue.padStart(decimals + 1, "0");
  }

  const decimalPos = strValue.length - decimals;

  const result =
    strValue.slice(0, decimalPos) + "." + strValue.slice(decimalPos);

  return parseFloat(result).toFixed(decimalPlaces);
}
