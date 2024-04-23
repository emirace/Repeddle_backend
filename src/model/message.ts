// models/Message.ts

import mongoose, { Schema, Document, ObjectId } from 'mongoose';

export interface IMessage extends Document {
  sender: ObjectId;
  receiver: ObjectId;
  content: string;
  forwardedFrom?: string; // Optional field for forwarded message
  replyTo?: string; // Optional field for reply message
  referencedUser?: string; // Optional field for referenced user ID
  referencedProduct?: string; // Optional field for referenced product ID
  read: boolean;
}

const messageSchema: Schema = new Schema<IMessage>(
  {
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    receiver: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    forwardedFrom: { type: String },
    replyTo: { type: String },
    referencedUser: { type: Schema.Types.ObjectId, ref: 'User' }, // Reference to User model
    referencedProduct: { type: Schema.Types.ObjectId, ref: 'Product' }, // Reference to Product model
    read: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

const Message = mongoose.model<IMessage>('Message', messageSchema);

export default Message;
