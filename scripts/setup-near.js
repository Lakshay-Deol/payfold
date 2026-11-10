const fs = require('fs');
const path = require('path');
const { generateSeedPhrase } = require('near-seed-phrase');

async function createAccount() {
  const accountId = 'lakshay-payfold.testnet';
  const { seedPhrase, publicKey, secretKey } = generateSeedPhrase();

  console.log('Registering on NEAR testnet:', accountId);
  console.log('Public Key:', publicKey);

  const res = await fetch('https://helper.testnet.near.org/account', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ newAccountId: accountId, newAccountPublicKey: publicKey })
  });

  const body = await res.text();
  console.log('Faucet Response Status:', res.status);

  if (res.status === 200) {
    console.log('SUCCESS! Account created and funded on NEAR Testnet.');

    // Update .env.development.local
    const envPath = path.join(__dirname, '..', '.env.development.local');
    let envContent = fs.readFileSync(envPath, 'utf8');

    envContent = envContent.replace(/NEAR_ACCOUNT_ID=.*/g, `NEAR_ACCOUNT_ID=${accountId}`);
    envContent = envContent.replace(/NEAR_SEED_PHRASE=.*/g, `NEAR_SEED_PHRASE="${seedPhrase}"`);
    envContent = envContent.replace(/NEXT_PUBLIC_contractId=.*/g, `NEXT_PUBLIC_contractId=ac-proxy.${accountId}`);

    fs.writeFileSync(envPath, envContent, 'utf8');
    console.log('.env.development.local updated successfully.');

    console.log('\n========================================');
    console.log('ACCOUNT ID: ' + accountId);
    console.log('SEED PHRASE: ' + seedPhrase);
    console.log('PUBLIC KEY: ' + publicKey);
    console.log('========================================');
  } else {
    console.error('Failed to create account:', body);
  }
}

createAccount().catch(console.error);

