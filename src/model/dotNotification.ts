import { Schema, Document, model, Types } from "mongoose";

export interface IDotNotification extends Document {
  type: string;
  user: Types.ObjectId;
}

const dotNotificationSchema = new Schema<IDotNotification>(
  {
    type: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  {
    timestamps: true,
  }
);

const DotNotification = model<IDotNotification>(
  "DotNotification",
  dotNotificationSchema
);
export default DotNotification;
