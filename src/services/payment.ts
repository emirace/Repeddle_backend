// @ts-ignore
import Flutterwave from "flutterwave-node-v3";
import {
  flutterwaveKey,
  flutterwaveSecret,
  paystackSecret,
} from "../config/env";
import { Paystack } from "paystack-sdk";

const flutterwave = new Flutterwave(flutterwaveKey, flutterwaveSecret);
const paystack = new Paystack(paystackSecret || "");

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

    case "Paystack":
      try {
        const response = await paystack.transaction.verify(transactionId);
        console.log(response);
        if (response.data && response.data.status === "success") {
          return {
            status: true,
            amount: response.data.amount / 100,
            currency: response.data.currency,
          };
        } else {
          return { status: false };
        }
      } catch (err) {
        console.error("Error verifying Paystack payment:", err);
        return { status: false };
      }
    default:
      console.warn(`Payment provider '${provider}' is not implemented.`);
      return { status: false };
  }
};

export const initializePaystack = async (email: string, amount: string) => {
  const response = await paystack.transaction.initialize({
    email,
    amount,
  });
  return response;
};
