import { Schema, model, Document } from "mongoose";

export interface IConversation extends Document {
  participants: string[];
  type: "Chat" | "Support" | "Report";
}

const conversationSchema = new Schema<IConversation>(
  {
    participants: [{ type: String, required: true }],
    type: { type: String, enum: ["Chat", "Support", "Report"], required: true },
  },
  { timestamps: true }
);

const Conversation = model<IConversation>("Conversation", conversationSchema);

export default Conversation;
