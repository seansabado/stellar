import { Request, Response } from "express";
import { checkStellarPaymentStatus } from "../utils/stellar.js";

export default async function checkStellarPayment(req: Request, res: Response) {
  const { paymentId } = req.query;
  if (!paymentId) return res.status(400).json({ error: "Missing paymentId" });
  try {
    const status = await checkStellarPaymentStatus(paymentId as string);
    res.json({ status });
  } catch (e) {
    res.status(500).json({ error: "Failed to check payment" });
  }
}
