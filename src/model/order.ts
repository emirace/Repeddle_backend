import mongoose, { Schema, Document, ObjectId } from "mongoose";

// Define interfaces for delivery options
export interface IDeliveryOption {
  method: string;
  fee: number;
}

// Define interfaces for order items
export interface IOrderItem {
  product: ObjectId;
  seller: ObjectId;
  selectedSize?: string;
  selectedColor?: string;
  price: number;
  quantity: number;
  deliveryOption: IDeliveryOption;
  deliveryTracking: {
    currentStatus: IDeliveryTrackingHistory;
    history: IDeliveryTrackingHistory[];
  };
  trackingNumber: string;
  isHold: boolean;
}

// Define interfaces for order delivery tracking
export interface IDeliveryTrackingHistory {
  status: string;
  timestamp: Date;
}

// Define the order schema
export interface IOrder extends Document {
  buyer: ObjectId;
  items: IOrderItem[];
  totalAmount: number;
  paymentMethod: string;
  transactionId: string;
}

const DeliveryOptionSchema = new Schema<IDeliveryOption>({
  fee: { type: Number, required: true },
  method: { type: String, required: true },
});

const DeliveryTrackingHistorySchema = new Schema<IDeliveryTrackingHistory>({
  status: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const OrderItemSchema = new Schema<IOrderItem>({
  product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  seller: { type: Schema.Types.ObjectId, ref: "User", required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  selectedSize: { type: String },
  selectedColor: { type: String },
  deliveryOption: { type: DeliveryOptionSchema, required: true },
  deliveryTracking: {
    currentStatus: { type: DeliveryTrackingHistorySchema, required: true },
    history: { type: [DeliveryTrackingHistorySchema], default: [] },
  },
  trackingNumber: { type: String },
  isHold: { type: Boolean, default: false },
});

const OrderSchema = new Schema<IOrder>(
  {
    buyer: { type: Schema.Types.ObjectId, ref: "User", required: true },
    items: { type: [OrderItemSchema], required: true },
    totalAmount: { type: Number, required: true },
    paymentMethod: { type: String, required: true },
    transactionId: { type: String },
  },
  { timestamps: true }
);

const Order = mongoose.model<IOrder>("Order", OrderSchema);

export default Order;
