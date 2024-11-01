import mongoose, { Document, Schema, Model } from "mongoose";

interface IPayment extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  amount: number;
  status: string;
  reason: string;
  to: "Wallet" | "Account";
  orderId: mongoose.Schema.Types.ObjectId;
}

const paymentSchema: Schema<IPayment> = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: { type: Number, required: true },
    status: { type: String, default: "Pending" },
    reason: { type: String, required: true },
    to: { type: String, enum: ["Wallet", "Account"], required: true },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
  },
  {
    timestamps: true,
  }
);

const Payment: Model<IPayment> = mongoose.model<IPayment>(
  "Payment",
  paymentSchema
);
export default Payment;
