import { Schema, model, Document } from "mongoose";

export interface IConversation extends Document {
  participants: string[];
  type: "Chat" | "Support" | "Report";
  closed?: boolean;
  isGuest?: boolean;
}

const conversationSchema = new Schema<IConversation>(
  {
    participants: [{ type: String, required: true }],
    type: { type: String, enum: ["Chat", "Support", "Report"], required: true },
    closed: { type: Boolean, default: false },
    isGuest: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Conversation = model<IConversation>("Conversation", conversationSchema);

export default Conversation;
