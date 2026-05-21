/**
 * One-time script: fund new merchant receiving account from demo customer account.
 * Usage: $env:DEMO_SECRET="S...your secret..."; node scripts/fund-merchant.mjs
 */
import { Horizon, Keypair, TransactionBuilder, Networks, Operation, Asset, BASE_FEE } from "@stellar/stellar-sdk";

const DEMO_CUSTOMER_SECRET = process.env.DEMO_SECRET;
const NEW_MERCHANT_PUBLIC = "GBXEISJ7QAWSS6Z4MSHYGCVOLKTAV6GAHYNOYUOST2HYUDOSRDCNGDLD";
const FUND_AMOUNT = "1.5"; // 1 XLM base reserve + 0.5 buffer

if (!DEMO_CUSTOMER_SECRET) {
  console.error("ERROR: Set $env:DEMO_SECRET=S... before running this script.");
  process.exit(1);
}

const server = new Horizon.Server("https://horizon.stellar.org");
const senderKeypair = Keypair.fromSecret(DEMO_CUSTOMER_SECRET);

console.log("Sender (demo customer):", senderKeypair.publicKey());
console.log("Funding merchant account:", NEW_MERCHANT_PUBLIC);
console.log("Amount:", FUND_AMOUNT, "XLM");

try {
  const account = await server.loadAccount(senderKeypair.publicKey());
  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: Networks.PUBLIC,
  })
    .addOperation(
      Operation.createAccount({
        destination: NEW_MERCHANT_PUBLIC,
        startingBalance: FUND_AMOUNT,
      })
    )
    .setTimeout(30)
    .build();

  tx.sign(senderKeypair);
  const result = await server.submitTransaction(tx);
  console.log("\n✅ SUCCESS! Merchant account funded.");
  console.log("TX hash:", result.hash);
  console.log("View on Stellar Expert: https://stellar.expert/explorer/public/tx/" + result.hash);
} catch (err) {
  const detail = err?.response?.data?.extras?.result_codes;
  console.error("ERROR:", detail ? JSON.stringify(detail) : err.message);
  process.exit(1);
}
