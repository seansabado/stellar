import "server-only";

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { applicationDefault, cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const DEFAULT_PROJECT_ID = "seanraynon";

function buildCredential() {
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (serviceAccountJson) {
    const parsed = JSON.parse(serviceAccountJson) as {
      project_id: string;
      client_email: string;
      private_key: string;
    };
    return cert({
      projectId: parsed.project_id,
      clientEmail: parsed.client_email,
      privateKey: parsed.private_key,
    });
  }

  const explicitPath =
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH ||
    process.env.GOOGLE_APPLICATION_CREDENTIALS ||
    path.resolve(process.cwd(), "..", "LubotOS", "scripts", "serviceAccountKey.json");

  if (explicitPath && existsSync(explicitPath)) {
    const raw = readFileSync(explicitPath, "utf8");
    const parsed = JSON.parse(raw) as {
      project_id: string;
      client_email: string;
      private_key: string;
    };

    return cert({
      projectId: parsed.project_id,
      clientEmail: parsed.client_email,
      privateKey: parsed.private_key,
    });
  }

  return applicationDefault();
}

function getAdminApp() {
  if (getApps().length > 0) return getApps()[0];
  return initializeApp({
    credential: buildCredential(),
    projectId: process.env.FIREBASE_PROJECT_ID || DEFAULT_PROJECT_ID,
  });
}

export function getAdminDb() {
  return getFirestore(getAdminApp());
}