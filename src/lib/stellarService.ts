import axios from "axios";

export type StellarTransaction = {
  paymentId: string;
  orderId: string;
  tenantId: string;
  amount: number;
  network: "testnet" | "mainnet";
  status: "pending" | "confirmed";
  txRef?: string;
  confirmedAt?: string;
  explorerUrl?: string;
  ledger?: number;
  paidAmount?: string;
  assetCode?: string;
  assetIssuer?: string;
  sourceAccount?: string;
  destinationAccount?: string;
  checks: number;
};

type StellarHistoryResponse = {
  tenantId: string;
  page: number;
  limit: number;
  count: number;
  total: number;
  transactions: StellarTransaction[];
};

export type StellarHistoryResult = {
  tenantId: string;
  page: number;
  limit: number;
  count: number;
  total: number;
  transactions: StellarTransaction[];
};

export async function fetchStellarTransactions(input: {
  tenantId: string;
  network?: "testnet" | "mainnet";
  status?: "pending" | "confirmed";
  limit?: number;
  page?: number;
  startDate?: string;
  endDate?: string;
}): Promise<StellarHistoryResult> {
  const response = await axios.get<StellarHistoryResponse>("/api/stellar-transactions", {
    params: {
      tenantId: input.tenantId,
      network: input.network,
      status: input.status,
      limit: input.limit ?? 20,
      page: input.page ?? 1,
      startDate: input.startDate,
      endDate: input.endDate,
    },
  });

  return {
    tenantId: response.data?.tenantId || input.tenantId,
    page: response.data?.page || 1,
    limit: response.data?.limit || input.limit || 20,
    count: response.data?.count || 0,
    total: response.data?.total || 0,
    transactions: Array.isArray(response.data?.transactions) ? response.data.transactions : [],
  };
}
