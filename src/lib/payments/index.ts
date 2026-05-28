export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: "pending" | "succeeded" | "failed" | "cancelled";
  metadata?: Record<string, string>;
}

export async function createPaymentIntent(_params: {
  amount: number;
  currency: string;
  metadata?: Record<string, string>;
}): Promise<PaymentIntent> {
  // TODO: Implement Stripe payment intent creation
  // For now, media payments use direct bank invoicing (no Stripe)
  throw new Error("Stripe not configured. Media payments use direct bank invoicing.");
}

export async function createSubscription(_params: {
  customerId: string;
  priceId: string;
}): Promise<PaymentIntent> {
  // TODO: Implement local KSA gateway for subscriptions (Mada, STC Pay)
  throw new Error("KSA payment gateway not configured for subscriptions.");
}
