// models/Message.ts

import mongoose, { Schema, Document, ObjectId } from "mongoose";

export interface IMessage extends Document {
  conversationId: ObjectId;
  sender: ObjectId;
  receiver?: ObjectId;
  content: string;
  image?: string;
  forwardedFrom?: string; // Optional field for forwarded message
  replyTo?: string; // Optional field for reply message
  read: boolean;
  referencedUser?: string; // Optional field for referenced user ID
  referencedProduct?: string; // Optional field for referenced product ID
}

const messageSchema: Schema = new Schema<IMessage>(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "Conversaton",
      required: true,
    },
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    receiver: { type: Schema.Types.ObjectId, ref: "User" },
    content: { type: String },
    forwardedFrom: { type: String },
    image: { type: String },
    replyTo: { type: String },
    read: { type: Boolean, default: false },
    referencedUser: { type: Schema.Types.ObjectId, ref: "User" }, // Reference to User model
    referencedProduct: { type: Schema.Types.ObjectId, ref: "Product" }, // Reference to Product model
  },
  {
    timestamps: true,
  }
);

const Message = mongoose.model<IMessage>("Message", messageSchema);

export default Message;
