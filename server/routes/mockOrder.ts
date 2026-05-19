import { Request, Response } from "express";

export default function mockOrder(req: Request, res: Response) {
  const { orderId } = req.params;
  // Mock order data for local dev
  res.json({
    id: orderId,
    amount: 12.34,
    tenantId: "demo-tenant-ph",
    status: "unpaid",
  });
}
