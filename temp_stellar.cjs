const StellarSdk = require("@stellar/stellar-sdk");
const fetch = require("node-fetch");

console.log('StellarSdk keys:', Object.keys(StellarSdk).filter(k => k === 'Horizon' || k === 'rpc' || k === 'Server'));

const secret = process.env.STELLAR_SECRET_TESTNET;
const horizonUrl = process.env.HORIZON_URL_TESTNET || 'https://horizon-testnet.stellar.org';

if (!secret) {
  console.error('Missing STELLAR_SECRET_TESTNET');
  process.exit(1);
}

const sourceKeypair = StellarSdk.Keypair.fromSecret(secret.trim());
console.log('Class status:', {
  Server: typeof StellarSdk.Server,
  Horizon: typeof StellarSdk.Horizon
});

let server;
if (StellarSdk.Horizon && StellarSdk.Horizon.Server) {
    server = new StellarSdk.Horizon.Server(horizonUrl);
} else if (StellarSdk.Server) {
    server = new StellarSdk.Server(horizonUrl);
} else {
    console.error('No Server constructor found');
    process.exit(1);
}

async function ensureFunded(publicKey) {
  try {
    await server.loadAccount(publicKey);
    console.log('Account ' + publicKey + ' is already funded.');
  } catch (e) {
    if (e.response && e.response.status === 404) {
      console.log('Funding ' + publicKey + ' via friendbot...');
      await fetch('https://friendbot.stellar.org?addr=' + publicKey);
      await server.loadAccount(publicKey);
    } else {
      throw e;
    }
  }
}

async function run() {
  try {
    await ensureFunded(sourceKeypair.publicKey());
    
    const destKeypair = StellarSdk.Keypair.random();
    console.log('Destination Public Key: ' + destKeypair.publicKey());
    
    console.log('Funding destination via friendbot...');
    const resultFb = await fetch('https://friendbot.stellar.org?addr=' + destKeypair.publicKey());
    if (!resultFb.ok) {
       console.error('Friendbot failed: ' + (await resultFb.text()));
    }
    
    const sourceAccount = await server.loadAccount(sourceKeypair.publicKey());
    
    const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
      fee: '1000',
      networkPassphrase: StellarSdk.Networks.TESTNET,
    })
      .addOperation(
        StellarSdk.Operation.payment({
          destination: destKeypair.publicKey(),
          asset: StellarSdk.Asset.native(),
          amount: '1',
        })
      )
      .setTimeout(30)
      .build();

    transaction.sign(sourceKeypair);
    const result = await server.submitTransaction(transaction);
    
    console.log('PASS');
    console.log('Tx Hash: ' + result.hash);
    console.log('Source: ' + sourceKeypair.publicKey());
    console.log('Destination: ' + destKeypair.publicKey());
    console.log('Amount: 1 XLM');
    console.log('Explorer: https://stellar.expert/explorer/testnet/tx/' + result.hash);
  } catch (error) {
    console.error('FAIL');
    if (error.response && error.response.data) {
       console.error(JSON.stringify(error.response.data, null, 2));
    } else {
       console.error(error);
    }
    process.exit(1);
  }
}

run();
