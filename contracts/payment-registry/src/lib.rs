#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short, Env, String,
};

// ── Storage types ──────────────────────────────────────────────────────────────

#[contracttype]
#[derive(Clone)]
pub struct PaymentRecord {
    /// Laundry order ID (e.g. "ORD-20260521-001")
    pub order_id: String,
    /// Amount in stroops (1 XLM = 10_000_000 stroops)
    pub amount_stroops: i128,
    /// Stellar address of the payer (as string for simplicity)
    pub payer: String,
    /// Horizon transaction hash that confirmed the payment
    pub tx_hash: String,
    /// Stellar ledger timestamp when recorded
    pub recorded_at: u64,
    /// Network label: "testnet" or "mainnet"
    pub network: String,
}

#[contracttype]
pub enum DataKey {
    /// Individual payment record keyed by order ID
    Payment(String),
    /// Total payment count
    Count,
}

// ── Contract ───────────────────────────────────────────────────────────────────

#[contract]
pub struct StellarPayRegistry;

#[contractimpl]
impl StellarPayRegistry {
    /// Record a confirmed payment on-chain.
    /// Called by the LaundromatAI backend after Horizon confirms the XLM transfer.
    /// Returns false if the order was already recorded (idempotent).
    pub fn record(
        env: Env,
        order_id: String,
        amount_stroops: i128,
        payer: String,
        tx_hash: String,
        network: String,
    ) -> bool {
        let key = DataKey::Payment(order_id.clone());

        // Idempotency: do not overwrite an existing confirmed payment
        if env.storage().persistent().has(&key) {
            return false;
        }

        let record = PaymentRecord {
            order_id,
            amount_stroops,
            payer,
            tx_hash,
            recorded_at: env.ledger().timestamp(),
            network,
        };

        env.storage().persistent().set(&key, &record);

        // Extend TTL so the record survives long-term
        env.storage().persistent().extend_ttl(&key, 500_000, 500_000);

        // Bump total count
        let count: u32 = env
            .storage()
            .instance()
            .get(&DataKey::Count)
            .unwrap_or(0);
        env.storage()
            .instance()
            .set(&DataKey::Count, &(count + 1));
        env.storage().instance().extend_ttl(1_000_000, 1_000_000);

        env.events().publish(
            (symbol_short!("PAY"),),
            count + 1,
        );

        true
    }

    /// Retrieve a payment record by order ID.
    pub fn get(env: Env, order_id: String) -> Option<PaymentRecord> {
        env.storage()
            .persistent()
            .get(&DataKey::Payment(order_id))
    }

    /// Total number of payments recorded on this contract.
    pub fn count(env: Env) -> u32 {
        env.storage()
            .instance()
            .get(&DataKey::Count)
            .unwrap_or(0)
    }
}
