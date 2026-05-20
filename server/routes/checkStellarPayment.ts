import { Request, Response } from "express";
import { getOrUpdatePaymentStatus } from "../utils/paymentState.js";

export default async function checkStellarPayment(req: Request, res: Response) {
  const { paymentId } = req.query;
  if (!paymentId) return res.status(400).json({ error: "Missing paymentId" });
  try {
    const snapshot = getOrUpdatePaymentStatus(paymentId as string);
    res.json(snapshot);
  } catch (e) {
    res.status(500).json({ error: "Failed to check payment" });
  }
}
