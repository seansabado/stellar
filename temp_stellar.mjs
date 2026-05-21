import { Server, Keypair, Asset, Operation, TransactionBuilder, Networks } from '@stellar/stellar-sdk';
import fetch from 'node-fetch';

const secret = process.env.STELLAR_SECRET_TESTNET;
const horizonUrl = process.env.HORIZON_URL_TESTNET || 'https://horizon-testnet.stellar.org';

if (!secret) {
  console.error('Missing STELLAR_SECRET_TESTNET');
  process.exit(1);
}

const sourceKeypair = Keypair.fromSecret(secret.trim());
const server = new Server(horizonUrl);

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
    
    const destKeypair = Keypair.random();
    console.log('Destination Public Key: ' + destKeypair.publicKey());
    
    console.log('Funding destination via friendbot...');
    const resultFb = await fetch('https://friendbot.stellar.org?addr=' + destKeypair.publicKey());
    if (!resultFb.ok) {
       console.error('Friendbot failed: ' + (await resultFb.text()));
    }
    
    const sourceAccount = await server.loadAccount(sourceKeypair.publicKey());
    
    const transaction = new TransactionBuilder(sourceAccount, {
      fee: '1000',
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        Operation.payment({
          destination: destKeypair.publicKey(),
          asset: Asset.native(),
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
