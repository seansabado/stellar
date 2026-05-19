import express from "express";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";
import createStellarPayment from "./routes/createStellarPayment.js";
import checkStellarPayment from "./routes/checkStellarPayment.js";
import mockOrder from "./routes/mockOrder.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, "../dist");

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/create-stellar-payment", createStellarPayment);
app.get("/api/check-stellar-payment", checkStellarPayment);

// Mock order API for local dev
app.get("/api/order/:orderId", mockOrder);

// Health check
app.get("/api/health", (_, res) => res.json({ status: "ok" }));

app.use(express.static(distPath));
app.get("*", (_, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`StellarPay backend running on port ${PORT}`);
});
