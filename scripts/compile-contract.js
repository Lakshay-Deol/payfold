const fs = require('fs');
const path = require('path');
const solc = require('solc');

const contractPath = path.join(__dirname, '..', 'contracts', 'PayFoldEscrow.sol');
const source = fs.readFileSync(contractPath, 'utf8');

const input = {
  language: 'Solidity',
  sources: {
    'PayFoldEscrow.sol': {
      content: source,
    },
  },
  settings: {
    optimizer: {
      enabled: true,
      runs: 200,
    },
    outputSelection: {
      '*': {
        '*': ['abi', 'evm.bytecode.object'],
      },
    },
  },
};

console.log('Compiling PayFoldEscrow.sol...');
const output = JSON.parse(solc.compile(JSON.stringify(input)));

if (output.errors) {
  let hasErrors = false;
  output.errors.forEach((err) => {
    console.log(err.formattedMessage);
    if (err.severity === 'error') hasErrors = true;
  });
  if (hasErrors) {
    process.exit(1);
  }
}

const contract = output.contracts['PayFoldEscrow.sol']['PayFoldEscrow'];
const artifact = {
  contractName: 'PayFoldEscrow',
  abi: contract.abi,
  bytecode: contract.evm.bytecode.object,
};

const artifactPath = path.join(__dirname, '..', 'contracts', 'PayFoldEscrow.json');
fs.writeFileSync(artifactPath, JSON.stringify(artifact, null, 2), 'utf8');
console.log('Compilation successful! Artifact saved to:', artifactPath);
console.log('ABI methods:', artifact.abi.filter(item => item.type === 'function').map(f => f.name));
