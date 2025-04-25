import { Schema, Document, model, Types } from "mongoose";

export interface INotification extends Document {
  message: string;
  read: boolean;
  link?: string;
  user: Types.ObjectId;
  image: string;
}

const notificationSchema = new Schema<INotification>(
  {
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    link: { type: String },
    image: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  {
    timestamps: true,
  }
);

const Notification = model<INotification>("Notification", notificationSchema);
export default Notification;
