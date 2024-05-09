import mongoose, { Document, Model, Schema } from "mongoose";

// Define the interface for the ContactUs document
export interface IContactUs extends Document {
  name: string;
  email: string;
  category: string;
  subject: string;
  message: string;
  file?: string[];
  assignTo?: string | null;
}

// Define the ContactUs schema
const contactUsSchema = new mongoose.Schema<IContactUs>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    file: [{ type: String }],
    assignTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Create the ContactUs model
const ContactUs: Model<IContactUs> = mongoose.model<IContactUs>(
  "ContactUs",
  contactUsSchema
);

export default ContactUs;
