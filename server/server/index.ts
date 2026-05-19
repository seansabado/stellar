import express from "express";
import cors from "cors";
import createStellarPayment from "./routes/createStellarPayment";
import checkStellarPayment from "./routes/checkStellarPayment";
import mockOrder from "./routes/mockOrder";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/create-stellar-payment", createStellarPayment);
app.get("/api/check-stellar-payment", checkStellarPayment);

// Mock order API for local dev
app.get("/api/order/:orderId", mockOrder);

// Health check
app.get("/api/health", (_, res) => res.json({ status: "ok" }));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`StellarPay backend running on port ${PORT}`);
});
