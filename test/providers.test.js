import test from 'ava';
import fs from 'fs';
import path from 'path';
import { getAiClient, extractWalletAddressFromText } from '../utils/ai-provider.js';
import { sendEmail } from '../utils/email-provider.js';

test('branding › logo asset exists in public directory', (t) => {
  const logoPath = path.resolve('public', 'logo.png');
  t.true(fs.existsSync(logoPath), 'public/logo.png should exist');
});

test('getAiClient returns client configuration or safe fallback', (t) => {
  const config = getAiClient();
  t.truthy(config, 'getAiClient should return an object');
  t.true(['gemini', 'openai', 'none'].includes(config.provider));
});

test('extractWalletAddressFromText extracts valid EVM address via regex fallback', async (t) => {
  const sampleText = "Hey team, my payout address is 0x71C8452f483FEfA834165dC65f57B8b71569B148 thanks!";
  const address = await extractWalletAddressFromText(sampleText);
  t.is(address, "0x71C8452f483FEfA834165dC65f57B8b71569B148");
});

test('sendEmail gracefully simulates email when credentials absent', async (t) => {
  const result = await sendEmail({
    to: "winner@example.com",
    subject: "Test Prize",
    content: "You won 1 ETH",
  });
  t.true(result.success);
});

