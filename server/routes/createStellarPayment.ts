import { Request, Response } from "express";
import { createStellarPaymentRequest } from "../utils/stellar.js";

export default async function createStellarPayment(
  req: Request,
  res: Response,
) {
  const { orderId, amount, tenantId } = req.body;
  if (!orderId || !amount || !tenantId)
    return res.status(400).json({ error: "Missing params" });
  try {
    const { qrData, paymentId, network } = await createStellarPaymentRequest(
      orderId,
      amount,
      tenantId,
    );
    res.json({ qrData, paymentId, network });
  } catch (e) {
    res.status(500).json({ error: "Failed to create payment" });
  }
}
