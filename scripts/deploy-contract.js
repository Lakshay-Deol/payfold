const fs = require('fs');
const path = require('path');
const { ethers } = require('ethers');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.development.local') });

async function deploy() {
  const artifactPath = path.join(__dirname, '..', 'contracts', 'PayFoldEscrow.json');
  if (!fs.existsSync(artifactPath)) {
    console.error('Artifact not found! Run "node scripts/compile-contract.js" first.');
    process.exit(1);
  }

  const { abi, bytecode } = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));

  // Default RPCs: Sepolia or Aurora Testnet
  const rpcUrl =
    process.env.ETHEREUM_RPC_URL ||
    'https://ethereum-sepolia-rpc.publicnode.com';

  console.log('Connecting to RPC:', rpcUrl);
  const provider = new ethers.JsonRpcProvider(rpcUrl);

  const privateKey = process.env.DEPLOYER_PRIVATE_KEY;
  if (!privateKey) {
    console.log('\n============================================================');
    console.log('NOTICE: DEPLOYER_PRIVATE_KEY is not set in .env.development.local');
    console.log('Generating a fresh deployer wallet keypair for you...');
    const wallet = ethers.Wallet.createRandom(provider);
    console.log('DEPLOYER ADDRESS:', wallet.address);
    console.log('DEPLOYER PRIVATE KEY:', wallet.privateKey);
    console.log('\nTo deploy to a live network (Sepolia or Aurora Testnet):');
    console.log('1. Add DEPLOYER_PRIVATE_KEY=' + wallet.privateKey + ' to .env.development.local');
    console.log('2. Fund ' + wallet.address + ' with free testnet gas (Sepolia or Aurora faucet)');
    console.log('3. Run "node scripts/deploy-contract.js"');
    console.log('============================================================\n');
    return;
  }

  const wallet = new ethers.Wallet(privateKey, provider);
  console.log('Deployer address:', wallet.address);

  const balance = await provider.getBalance(wallet.address);
  console.log('Deployer balance:', ethers.formatEther(balance), 'ETH');

  if (balance === 0n) {
    console.error('Deployer balance is 0. Please fund the address with testnet gas before deploying.');
    process.exit(1);
  }

  // Authorize the NEAR MPC Agent Signer
  const agentSigner = process.env.AGENT_SIGNER_ADDRESS || '0x0330262f7a6882639F3649369731D274cc53e647';
  console.log('Deploying PayFoldEscrow with agentSigner:', agentSigner);

  const factory = new ethers.ContractFactory(abi, bytecode, wallet);
  const contract = await factory.deploy(agentSigner);
  await contract.waitForDeployment();

  const deployedAddress = await contract.getAddress();
  console.log('\n============================================================');
  console.log('SUCCESS! PayFoldEscrow deployed at:', deployedAddress);
  console.log('Transaction hash:', contract.deploymentTransaction()?.hash);
  console.log('============================================================\n');

  // Update .env.development.local
  const envPath = path.join(__dirname, '..', '.env.development.local');
  let env = fs.readFileSync(envPath, 'utf8');
  if (env.includes('NEXT_PUBLIC_ESCROW_CONTRACT=')) {
    env = env.replace(/NEXT_PUBLIC_ESCROW_CONTRACT=.*/g, `NEXT_PUBLIC_ESCROW_CONTRACT=${deployedAddress}`);
  } else {
    env += `\nNEXT_PUBLIC_ESCROW_CONTRACT=${deployedAddress}\n`;
  }
  fs.writeFileSync(envPath, env, 'utf8');
  console.log('Updated NEXT_PUBLIC_ESCROW_CONTRACT in .env.development.local');
}

deploy().catch(console.error);
