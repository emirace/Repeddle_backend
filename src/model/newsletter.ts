import mongoose, { Document, Model } from "mongoose";

interface ISent extends Document {
  emailName?: string;
}

export interface INewsletter extends Document {
  email: string;
  isDeleted?: boolean;
  url: "com" | "co.za";
  sent?: ISent[];
}

const sentSchema = new mongoose.Schema<ISent>(
  {
    emailName: { type: String },
  },
  {
    timestamps: true,
  }
);

const newsletterSchema = new mongoose.Schema<INewsletter>(
  {
    email: { type: String, required: true },
    isDeleted: { type: Boolean, default: false },
    url: { type: String, enum: ["com", "co.za"], required: true },
    sent: [sentSchema],
  },
  {
    timestamps: true,
  }
);

const Newsletter: Model<INewsletter> = mongoose.model<INewsletter>(
  "Newsletter",
  newsletterSchema
);

export default Newsletter;
