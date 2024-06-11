import mongoose, { Schema, Document } from "mongoose";

export interface IToken extends Document {
  type: "email" | "password";
  token: string;
  used: boolean;
}

const TokenSchema = new Schema<IToken>(
  {
    type: { type: String, enum: ["email", "password"], required: true },
    token: { type: String, required: true },
    used: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Token = mongoose.model<IToken>("Token", TokenSchema);

export default Token;
