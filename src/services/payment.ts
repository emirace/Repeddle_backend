// @ts-ignore
import Flutterwave from "flutterwave-node-v3";
import { flutterwaveKey, flutterwaveSecret } from "../config/env";

const flutterwave = new Flutterwave(flutterwaveKey, flutterwaveSecret);

export const verifyPayment = async (
  provider: string,
  transactionId: string
): Promise<{ status: boolean; amount?: number; currency?: string }> => {
  console.log("flutterKey", flutterwaveKey);

  switch (provider) {
    case "Flutterwave":
      try {
        const payload = { id: transactionId };
        const response = await flutterwave.Transaction.verify(payload);

        console.log("Flutterwave response", response);

        if (response.data.status === "successful") {
          return {
            status: true,
            amount: response.data.amount,
            currency: response.data.currency,
          };
        } else {
          return { status: false };
        }
      } catch (err) {
        console.error("Error verifying Flutterwave payment:", err);
        return { status: false };
      }

    case "paypal":
    case "scribe":
    case "Paystack":
    default:
      console.warn(`Payment provider '${provider}' is not implemented.`);
      return { status: false };
  }
};
