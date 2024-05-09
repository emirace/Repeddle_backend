import mongoose, { Document, Model } from "mongoose";

export interface IBrand extends Document {
  name: string;
  alpha: string;
  type: "SYSTEM" | "USER";
  published: boolean;
}

const brandSchema = new mongoose.Schema<IBrand>(
  {
    name: { type: String, required: true },
    alpha: { type: String, required: true },
    type: { type: String, enum: ["SYSTEM", "USER"], default: "USER" },
    published: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

const Brand: Model<IBrand> = mongoose.model<IBrand>("Brand", brandSchema);

export default Brand;
