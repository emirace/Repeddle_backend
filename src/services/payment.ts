// @ts-ignore
import Flutterwave from "flutterwave-node-v3";
import { flutterwaveKey, flutterwaveSecret } from "../config/env";

export const verifyPayment = async (
  provider: string,
  transactionId: string
): Promise<{ status: boolean; amount?: number; currency?: string }> => {
  console.log("flutterKey", flutterwaveKey);
  switch (provider) {
    case "Flutterwave":
      const flutterwave = new (Flutterwave as any)(
        flutterwaveKey,
        flutterwaveSecret
      );
      const response = await flutterwave.Transaction.verify({
        id: transactionId,
      });
      console.log("flu response", response);
      if (response.data.status === "successful") {
        const amount = response.data.amount;
        const currency = response.data.currency;
        return { status: true, amount, currency };
      } else {
        return { status: false };
      }
    case "paypal":
      // return await PayPalService.verifyPayment(transactionId);
      return { status: false };
    case "scribe":
      // return await ScribeService.verifyPayment(transactionId);
      return { status: false };
    case "Paystack":

    default:
      return { status: false };
  }
};
