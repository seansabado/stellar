const StellarSdk = require("@stellar/stellar-sdk");
const fetch = require("node-fetch");

const secret = "SDOUQ7UF4MVRZLFSZ33FI3D4MTIV4D2A7JSFBNHO2QV63BYTDYX4QMEP";
const horizonUrl = "https://horizon-testnet.stellar.org";
const pass = StellarSdk.Networks.TESTNET;

const sourceKeypair = StellarSdk.Keypair.fromSecret(secret);
const destKeypair = StellarSdk.Keypair.random();

let server;
if (StellarSdk.Horizon && StellarSdk.Horizon.Server) {
    server = new StellarSdk.Horizon.Server(horizonUrl);
} else if (StellarSdk.Server) {
    server = new StellarSdk.Server(horizonUrl);
} else {
    console.error("No Server constructor found");
    process.exit(1);
}

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function ensureFunded(publicKey) {
    try {
        await server.loadAccount(publicKey);
        console.log(`Account ${publicKey} is funded.`);
    } catch (e) {
        console.log(`Funding ${publicKey} via friendbot...`);
        const res = await fetch(`https://friendbot.stellar.org?addr=${publicKey}`);
        if (!res.ok) throw new Error("Friendbot failed: " + (await res.text()));
        await server.loadAccount(publicKey);
    }
}

async function runSimulation() {
    try {
        console.log("Source: " + sourceKeypair.publicKey());
        console.log("Destination: " + destKeypair.publicKey());
        
        await ensureFunded(sourceKeypair.publicKey());
        await ensureFunded(destKeypair.publicKey());

        let results = [];
        const count = 25;
        const timestamp = Date.now();

        for (let i = 0; i < count; i++) {
            const amount = (0.11 + (Math.random() * 0.24)).toFixed(7);
            const memoStr = `SIM-${timestamp}-${i}`;
            
            try {
                const sourceAccount = await server.loadAccount(sourceKeypair.publicKey());
                const tx = new StellarSdk.TransactionBuilder(sourceAccount, {
                    fee: '1000',
                    networkPassphrase: pass
                })
                .addOperation(StellarSdk.Operation.payment({
                    destination: destKeypair.publicKey(),
                    asset: StellarSdk.Asset.native(),
                    amount: amount
                }))
                .addMemo(StellarSdk.Memo.text(memoStr))
                .setTimeout(30)
                .build();

                tx.sign(sourceKeypair);
                const result = await server.submitTransaction(tx);
                results.push({ i, success: true, hash: result.hash, amount, memo: memoStr });
                console.log(`[${i+1}/${count}] Success: ${result.hash}`);
            } catch (err) {
                const errMsg = err.response && err.response.data ? JSON.stringify(err.response.data.extras.result_codes) : err.message;
                console.error(`[${i+1}/${count}] Failed: ${errMsg}`);
                results.push({ i, success: false, error: errMsg, amount, memo: memoStr });
            }
            await sleep(250);
        }

        const succeeded = results.filter(r => r.success);
        const failed = results.filter(r => !r.success);

        console.log("\n--- SIMULATION SUMMARY ---");
        console.log(`Attempted: ${count}`);
        console.log(`Succeeded: ${succeeded.length}`);
        console.log(`Failed:    ${failed.length}`);
        console.log(`Destination: ${destKeypair.publicKey()}`);
        console.log(`Explorer (Account): https://stellar.expert/explorer/testnet/account/${destKeypair.publicKey()}`);
        
        if (succeeded.length > 0) {
            console.log("\nSuccessful TX Hashes (First 10):");
            succeeded.slice(0, 10).forEach(r => console.log(`- ${r.hash} (${r.amount} XLM, ${r.memo})`));
            if (succeeded.length > 10) {
                console.log("...");
                console.log("Last 3:");
                succeeded.slice(-3).forEach(r => console.log(`- ${r.hash} (${r.amount} XLM, ${r.memo})`));
            }
            console.log(`\nSample TX Explorer: https://stellar.expert/explorer/testnet/tx/${succeeded[0].hash}`);
        }
    } catch (e) {
        console.error("FATAL:", e);
    }
}

runSimulation();
