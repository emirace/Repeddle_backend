import mongoose, { Schema, Document, Model } from "mongoose";

interface IDeliveryOption {
  fee: number;
  method: string;
}

interface IDeliveryTrackingHistory {
  status: string;
  timestamp: Date;
}

export interface IReturn extends Document {
  orderId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  reason?: string;
  refund: string;
  image?: string;
  others?: string;
  region: "NGN" | "ZAR";
  adminReason?: string;
  trackingNumber?: string;
  status: "Approved" | "Declined" | "Pending";
  deliveryOption: IDeliveryOption;
  deliverySelected: IDeliveryOption;
  deliveryTracking: {
    currentStatus: IDeliveryTrackingHistory;
    history: IDeliveryTrackingHistory[];
  };
  createdAt?: Date;
  updatedAt?: Date;
}

const DeliveryOptionSchema = new Schema({
  fee: { type: Number, required: true },
  method: { type: String, required: true },
});

const DeliveryTrackingHistorySchema = new Schema({
  status: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const returnSchema: Schema = new Schema(
  {
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    reason: { type: String },
    refund: { type: String, required: true },
    image: { type: String },
    others: { type: String },
    region: { type: String, enum: ["NGN", "ZAR"], default: "NGN" },
    adminReason: { type: String },
    trackingNumber: { type: String },
    status: {
      type: String,
      enum: ["Approved", "Decline", "Pending"],
      default: "Pending",
    },
    deliveryOption: { type: DeliveryOptionSchema, required: true },
    deliverySelected: { type: DeliveryOptionSchema },
    deliveryTracking: {
      currentStatus: { type: DeliveryTrackingHistorySchema, required: true },
      history: { type: [DeliveryTrackingHistorySchema], default: [] },
    },
  },
  {
    timestamps: true,
  }
);

const Return: Model<IReturn> = mongoose.model<IReturn>("Return", returnSchema);
export default Return;
