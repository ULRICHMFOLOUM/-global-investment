import axios from "axios";

const FAPSHI_BASE_URL = "https://live.fapshi.com";

interface FapshiPaymentInit {
  amount: number;
  email: string;
  userId?: string;
  externalId?: string;
  redirectUrl?: string;
  message?: string;
}

export interface FapshiPaymentResult {
  status: "created" | "error";
  message: string;
  link?: string;
  transId?: string;
}

/**
 * Initialise un paiement Fapshi (Mobile Money Cameroun)
 */
export async function initializeFapshiPayment(
  data: FapshiPaymentInit
): Promise<FapshiPaymentResult> {
  const response = await axios.post(
    `${FAPSHI_BASE_URL}/initiate-pay`,
    {
      amount: data.amount,
      email: data.email,
      userId: data.userId || undefined,
      externalId: data.externalId || undefined,
      redirectUrl:
        data.redirectUrl ||
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/banque?success=true`,
      message: data.message || "Dépôt GlobalInvest Africa",
    },
    {
      headers: {
        apiuser: process.env.FAPSHI_API_USER!,
        apikey: process.env.FAPSHI_API_KEY!,
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
}

/**
 * Vérifie le statut d'un paiement Fapshi
 */
export async function getFapshiTransactionStatus(transId: string) {
  const response = await axios.get(
    `${FAPSHI_BASE_URL}/payment-status/${transId}`,
    {
      headers: {
        apiuser: process.env.FAPSHI_API_USER!,
        apikey: process.env.FAPSHI_API_KEY!,
      },
    }
  );
  return response.data;
}

/**
 * Initie un paiement direct (push) vers un numéro Mobile Money
 */
export async function fapshiDirectPayment(params: {
  amount: number;
  phone: string;
  email: string;
  externalId?: string;
}) {
  const response = await axios.post(
    `${FAPSHI_BASE_URL}/direct-pay`,
    {
      amount: params.amount,
      phone: params.phone,
      email: params.email,
      externalId: params.externalId,
      message: "Retrait GlobalInvest Africa",
    },
    {
      headers: {
        apiuser: process.env.FAPSHI_API_USER!,
        apikey: process.env.FAPSHI_API_KEY!,
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
}

// ---- Anciens helpers CinetPay (conservés pour compatibilité) ----
export async function initializeCinetPayPayment(data: any) {
  // Redirige vers Fapshi maintenant
  return initializeFapshiPayment({
    amount: data.amount,
    email: data.customerEmail,
    externalId: data.transactionId,
    message: data.description,
  });
}
