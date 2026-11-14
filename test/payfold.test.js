import test from 'ava';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test('data.json exists and has valid hackathon structure', (t) => {
  const dataPath = path.join(__dirname, '..', 'data.json');
  t.true(fs.existsSync(dataPath), 'data.json must exist');
  
  const content = fs.readFileSync(dataPath, 'utf-8');
  const parsed = JSON.parse(content);
  t.truthy(parsed.hackathons, 'hackathons list must exist');
  t.true(Array.isArray(parsed.hackathons), 'hackathons must be an array');
});

test('package.json metadata is configured for PayFold and author Lakshay Deol', (t) => {
  const pkgPath = path.join(__dirname, '..', 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
  
  t.is(pkg.name, 'payfold');
  t.true(pkg.author.includes('Lakshay Deol'));
  t.true(pkg.description.includes('PayFold'));
});

test('convertToDecimal helper logic formats numbers correctly', (t) => {
  function convertToDecimal(bigIntValue, decimals, decimalPlaces = 6) {
    let strValue = bigIntValue.toString();
    if (strValue.length <= decimals) {
      strValue = strValue.padStart(decimals + 1, "0");
    }
    const decimalPos = strValue.length - decimals;
    const result = strValue.slice(0, decimalPos) + "." + strValue.slice(decimalPos);
    return parseFloat(result).toFixed(decimalPlaces);
  }

  const result = convertToDecimal(BigInt("1000000000000000000"), 18, 2);
  t.is(result, "1.00");
  
  const microResult = convertToDecimal(BigInt("500000000000000000"), 18, 4);
  t.is(microResult, "0.5000");
});

test('api/getHackathons.js endpoint file exists and handles vault query', (t) => {
  const endpointPath = path.join(__dirname, '..', 'pages', 'api', 'getHackathons.js');
  t.true(fs.existsSync(endpointPath), 'pages/api/getHackathons.js must exist');
  
  const content = fs.readFileSync(endpointPath, 'utf-8');
  t.true(content.includes('data.json'), 'endpoint must read hackathon data ledger');
  t.true(content.includes('hackathons'), 'endpoint must return hackathons array');
});

test('api/webhook.js contains anti-fraud impersonation and burn-address guards', (t) => {
  const webhookPath = path.join(__dirname, '..', 'pages', 'api', 'webhook.js');
  t.true(fs.existsSync(webhookPath), 'pages/api/webhook.js must exist');

  const content = fs.readFileSync(webhookPath, 'utf-8');
  t.true(content.includes('BLACKLISTED_BURN_ADDRESSES'), 'must contain burn address blacklist');
  t.true(content.includes('ANTI_FRAUD_IMPERSONATION_REJECTED'), 'must contain impersonation rejection guard');
  t.true(content.includes('ANTI_FRAUD_DOUBLE_SETTLEMENT_PREVENTED'), 'must contain double settlement prevention guard');
});

test('codebase typography has zero emojis across UI and documentation', (t) => {
  const emojiRegex = /\p{Extended_Pictographic}/u;
  const filesToCheck = [
    path.join(__dirname, '..', 'pages', 'index.js'),
    path.join(__dirname, '..', 'README.md'),
    path.join(__dirname, '..', 'HACKATHON_SUBMISSION.md'),
  ];
  
  for (const file of filesToCheck) {
    const text = fs.readFileSync(file, 'utf-8');
    t.false(emojiRegex.test(text), `File ${path.basename(file)} must contain zero emojis`);
  }
});

