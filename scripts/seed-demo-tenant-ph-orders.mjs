import { applicationDefault, cert, getApps, initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";

const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || "seanraynon";
const TENANT_ID = "demo-tenant-ph";

const BRANCHES = [
  { id: "branch-hq", name: "Makati Central (HQ)" },
  { id: "branch-east", name: "Demo East Branch" },
];

const SERVICES = [
  "Wash + Fold",
  "Dry Clean",
  "Express Wash",
  "Wash + Press",
  "Comforter Clean",
  "Quick Dry",
];

const SEED_ORDERS = Array.from({ length: 60 }, (_, index) => {
  const orderNumber = index + 1;
  const paid = orderNumber > 50;
  const branch = BRANCHES[index % BRANCHES.length];
  const service = SERVICES[index % SERVICES.length];
  const opsStatus = paid ? "delivered" : "ready";
  const pickupEta = paid
    ? "Delivered"
    : index % 2 === 0
      ? `Today, ${["6:30 PM", "8:00 PM", "7:45 PM"][index % 3]}`
      : `Tomorrow, ${["10:00 AM", "4:00 PM", "9:00 AM"][index % 3]}`;

  return {
    id: `LPX${String(orderNumber).padStart(4, "0")}`,
    amount: 10.5,
    tenantId: TENANT_ID,
    branchId: branch.id,
    branch: branch.name,
    service,
    status: paid ? "paid" : "unpaid",
    opsStatus,
    pickupEta,
    currency: "PHP",
    sortIndex: orderNumber,
  };
});

function getCredential() {
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (serviceAccountJson) {
    const parsed = JSON.parse(serviceAccountJson);
    return cert({
      projectId: parsed.project_id,
      clientEmail: parsed.client_email,
      privateKey: parsed.private_key,
    });
  }
  return applicationDefault();
}

function getAdminDb() {
  if (getApps().length === 0) {
    initializeApp({
      credential: getCredential(),
      projectId: PROJECT_ID,
    });
  }
  return getFirestore();
}

async function run() {
  const db = getAdminDb();
  const mirrorRef = db.collection(`tenants/${TENANT_ID}/stellar_demo_orders`);
  const branchesRef = db.collection(`tenants/${TENANT_ID}/branches`);

  async function clearCollection(collectionRef) {
    const existing = await collectionRef.get();
    if (existing.empty) return;

    let deleteBatch = db.batch();
    let pendingDeletes = 0;
    for (const doc of existing.docs) {
      deleteBatch.delete(doc.ref);
      pendingDeletes += 1;
      if (pendingDeletes === 400) {
        await deleteBatch.commit();
        deleteBatch = db.batch();
        pendingDeletes = 0;
      }
    }

    if (pendingDeletes > 0) {
      await deleteBatch.commit();
    }
  }

  await clearCollection(mirrorRef);

  const existingBranches = await branchesRef.get();
  for (const branchDoc of existingBranches.docs) {
    await clearCollection(db.collection(`tenants/${TENANT_ID}/branches/${branchDoc.id}/orders`));
  }
  await clearCollection(branchesRef);

  const seedBatch = db.batch();
  for (const [index, order] of SEED_ORDERS.entries()) {
    const payment = order.status === "paid"
      ? {
          isVerified: true,
          paymentId: `seed-${order.id}`,
          txRef: `STLR-${order.id.replace(/[^a-zA-Z0-9]/g, "").toUpperCase()}`,
          network: "testnet",
          verifiedAt: new Date().toISOString(),
        }
      : {
          isVerified: false,
          paymentId: null,
          txRef: null,
          network: "testnet",
        };

    seedBatch.set(mirrorRef.doc(order.id), {
      ...order,
      payment,
      sourceStatus: order.opsStatus,
      sortIndex: index + 1,
      seededAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    seedBatch.set(branchesRef.doc(order.branchId), {
      name: order.branch,
      branchName: order.branch,
      active: true,
      tenantId: TENANT_ID,
      sortIndex: order.branchId === "branch-hq" ? 1 : 2,
      seededAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });

    seedBatch.set(db.doc(`tenants/${TENANT_ID}/branches/${order.branchId}/orders/${order.id}`), {
      id: order.id,
      displayOrderId: order.id,
      amount: order.amount,
      tenantId: TENANT_ID,
      branchId: order.branchId,
      branchName: order.branch,
      service: order.service,
      status: order.opsStatus,
      opsStatus: order.opsStatus,
      pickupEta: order.pickupEta,
      payment,
      sortIndex: index + 1,
      seededAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
  }
  await seedBatch.commit();

  console.log(`Seeded ${SEED_ORDERS.length} orders for ${TENANT_ID}`);
}

run().catch((error) => {
  console.error("Seeding failed:", error);
  process.exit(1);
});
