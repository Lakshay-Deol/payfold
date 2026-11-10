import { OpenAI } from "openai";
import { OpenAIToolSet } from "composio-core";
import fs from "fs";
import path from "path";
import { JsonRpcProvider, Contract } from "ethers";
import { Evm } from "../../utils/ethereum";
import { signWithAgent } from "@neardefi/shade-agent-js";
import { utils } from "chainsig.js";
const { toRSV } = utils.cryptography;
import { parseEther } from "ethers";

const ethContractAbi = [
  {
    name: "distributeFund",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "hackathonId", type: "uint256" },
      { name: "winnerId", type: "uint256" },
      { name: "recipient", type: "address" },
    ],
    outputs: [],
  },
];

export default async function handler(req, res) {
  console.log("=== Webhook Handler Started ===");

  const openai_client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const composio_toolset = new OpenAIToolSet({
    apiKey: process.env.COMPOSIO_API_KEY,
  });

  if (req.method !== "POST") {
    console.log("Method not allowed:", req.method);
    return res
      .status(405)
      .json({ status: "error", message: "Method not allowed" });
  }

  try {
    const payload = req.body;
    console.log(payload.data.thread_id);
    console.log("=== Processing Webhook Payload ===");

    // Check if this is an email message
    if (!payload.data.thread_id) {
      console.log("No thread_id found in payload");
      return res.status(200).json({
        status: "success",
        message: "Webhook received but no thread_id",
      });
    }

    const threadId = payload.data.thread_id;
    const messageText = payload.data.message_text;
    const subject = payload.data.subject;
    const sender = payload.data.sender;

    console.log("=== Checking Thread in Database ===");
    console.log("Thread ID:", threadId);

    // Read data.json to find matching thread
    const dataPath = path.join(process.cwd(), "data.json");
    let existingData = {
      emailResponses: [],
      threadInteractions: [],
      hackathons: {},
    };

    try {
      if (fs.existsSync(dataPath)) {
        const fileContent = fs.readFileSync(dataPath, "utf8");
        existingData = JSON.parse(fileContent);

        // First check emailResponses for the thread
        const emailResponse = existingData.emailResponses.find(
          (response) => response.data?.response_data?.threadId === threadId
        );

        if (emailResponse) {
          console.log("=== Found Thread in Email Responses ===");
          console.log("Thread ID:", threadId);

          // Now check if this is a winner's thread
          let winnerInfo = null;
          for (const hackathon of Object.values(existingData.hackathons)) {
            const winner = hackathon.winners.find(
              (w) => w.emailResponse?.data?.response_data?.threadId === threadId
            );
            if (winner) {
              winnerInfo = {
                winnerId: winner.id,
                name: winner.Name,
                email: winner.email,
                prize: winner.prize,
                place: winner.place,
                track: winner.track,
                hackathonAddress: hackathon.hackathonAddress,
                hackathon: hackathon.name,
                hackathonId: hackathon.id,
              };
              break;
            }
          }

          if (winnerInfo) {
            console.log("=== Found Winner Information ===");
            console.log("Winner:", winnerInfo.name);
            console.log("Prize:", winnerInfo.prize);
            console.log("Track:", winnerInfo.track);
            console.log("Hackathon Address:", winnerInfo.hackathonAddress);
            console.log("Hackathon:", winnerInfo.hackathon);
            console.log("Hackathon ID:", winnerInfo.hackathonId);
            console.log("Winner ID:", winnerInfo.winnerId);

            // Extract wallet address using GPT
            const gptResponse = await openai_client.chat.completions.create({
              model: "gpt-3.5-turbo",
              messages: [
                {
                  role: "system",
                  content:
                    "You are a helpful assistant that extracts wallet addresses from text. Only return the wallet address in JSON format with a 'walletAddress' key. If no wallet address is found, return an empty string.",
                },
                {
                  role: "user",
                  content: messageText,
                },
              ],
              response_format: { type: "json_object" },
            });

            const walletAddress = JSON.parse(
              gptResponse.choices[0].message.content
            ).walletAddress;
            console.log("Extracted wallet address:", walletAddress);

            // const { transaction, hashesToSign } = await getWinnerPayload(
            //   winnerInfo.hackathonAddress,
            //   walletAddress,
            //   winnerInfo.prize
            // );

            const { transaction, hashesToSign } = await releasePrize(
              winnerInfo.hackathonId,
              winnerInfo.winnerId,
              walletAddress,
              winnerInfo.hackathonAddress
            );

            ////
            let signRes;
            let verified = false;
            // Call the agent contract to get a signature for the payload
            try {
              const path = winnerInfo.hackathon;
              const payload = hashesToSign[0];
              signRes = await signWithAgent(path, payload);
              console.log("signRes", signRes);
              verified = true;
            } catch (e) {
              console.log("Contract call error:", e);
            }

            if (!verified) {
              res
                .status(400)
                .json({ verified, error: "Failed to send  prize" });
              return;
            }

            // Reconstruct the signed transaction
            const signedTransaction = Evm.finalizeTransactionSigning({
              transaction,
              rsvSignatures: [toRSV(signRes)],
            });

            // Broadcast the signed transaction
            const txHash = await Evm.broadcastTx(signedTransaction);

            console.log("txHash", txHash);

            const explorerHash = `https://explorer.mainnet.aurora.dev/tx/${txHash.hash}`;

            // Update winner's payment status in data.json
            for (const hackathon of Object.values(existingData.hackathons)) {
              const winner = hackathon.winners.find(
                (w) =>
                  w.emailResponse?.data?.response_data?.threadId === threadId
              );
              if (winner) {
                winner.paymentStatus = "success";
                winner.transactionHash = explorerHash;
                winner.paymentDate = new Date().toISOString();
                break;
              }
            }

            // Save updated data
            fs.writeFileSync(dataPath, JSON.stringify(existingData, null, 2));

            const emailContent = ` Congrats , Once Again ${winnerInfo.name} , You have won ${winnerInfo.prize} in the ${winnerInfo.track} track.
            We have sent the prize to your wallet: ${walletAddress}
            You can check the transaction on the following link: ${explorerHash}
            `;

            const composio_toolset = new OpenAIToolSet({
              apiKey: process.env.COMPOSIO_API_KEY,
            });

            const tools = await composio_toolset.getTools({
              actions: ["GMAIL_SEND_EMAIL"],
            });

            const emailInstruction = `Send an email to ${winnerInfo.email} with the following content: ${emailContent}`;

            const response = await openai_client.chat.completions.create({
              model: "gpt-3.5-turbo",
              messages: [{ role: "user", content: emailInstruction }],
              tools: tools,
              tool_choice: "auto",
            });

            const tool_response = await composio_toolset.handleToolCall(
              response
            );

            console.log("tool_response", tool_response);

            return res.status(200).json({
              status: "success",
              message: "Email processed and response generated",
              threadId,
              winnerInfo,
              walletAddress,
            });
          } else {
            console.log("Thread not found in email responses");
          }
        }
      }
    } catch (error) {
      console.error("Error processing data:", error);
    }

    return res.status(200).json({
      status: "success",
      message: "Webhook received but thread not found in database",
    });
  } catch (error) {
    console.error("=== Error in Webhook Handler ===");
    console.error("Error details:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
}

async function getWinnerPayload(hackathonWalletAddress, walletAddress, amount) {
  try {
    const provider = new JsonRpcProvider(
      process.env.ETHEREUM_RPC_URL || "https://1rpc.io/aurora"
    );

    const { transaction, hashesToSign } =
      await Evm.prepareTransactionForSigning({
        from: hackathonWalletAddress,
        to: walletAddress,
        value: parseEther(amount), // Amount in wei
        data: "0x", // Empty data for native transfer
      });

    return { transaction, hashesToSign };
  } catch (error) {
    console.error("Error preparing winner payload:", error);
    throw new Error("Failed to prepare transaction payload");
  }
}

async function releasePrize(hackathonId, winnerId, winnerAddress, botAddress) {
  const provider = new JsonRpcProvider("https://1rpc.io/aurora");
  const contract = new Contract(
    "0xFcAaf9F83875C2c4fEF050af893e90061254c660",
    ethContractAbi,
    provider
  );

  const data = contract.interface.encodeFunctionData("distributeFund", [
    hackathonId,
    winnerId,
    winnerAddress,
  ]);

  const { transaction, hashesToSign } = await Evm.prepareTransactionForSigning({
    from: botAddress,
    to: "0xFcAaf9F83875C2c4fEF050af893e90061254c660",
    data,
  });

  return { transaction, hashesToSign };
}
