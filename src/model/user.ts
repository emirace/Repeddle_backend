import mongoose, { Schema, Document, Types } from "mongoose";

export interface IAddress {
  apartment?: string;
  street?: string;
  state?: string;
  zipcode?: number;
}

export interface IRebundle {
  status: boolean;
  count: number;
}

export interface IUser extends Document {
  username: string;
  firstName: string;
  lastName: string;
  image?: string;
  email: string;
  role: "Admin" | "User" | "Seller";
  password: string;
  followers: string[];
  following: string[];
  likes: string[];
  wishlist: string[];
  sold: string[];
  about?: string;
  dob?: Date;
  activeLastUpdated: Date;
  usernameLastUpdated?: Date;
  buyers: string[];
  rating: number;
  accountNumber?: number;
  phone?: string;
  accountName?: string;
  allowNewsletter: boolean;
  bankName?: string;
  address?: IAddress;
  numReviews: number;
  badge: boolean;
  active: boolean;
  influencer: boolean;
  isVerifiedEmail: boolean;
  region: "NGN" | "ZAR";
  rebundle: IRebundle;
  tokenVersion: string;
  delected: boolean;
  socketId: string;
}

// Define the address schema
const AddressSchema = new Schema<IAddress>(
  {
    apartment: String,
    street: String,
    state: String,
    zipcode: Number,
  },
  { _id: false }
);

// Define the rebundle schema
const RebundleSchema = new Schema<IRebundle>(
  {
    status: { type: Boolean, required: true },
    count: { type: Number, required: true },
  },
  { _id: false }
);

// Define the user schema
const UserSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    image: String,
    password: String,
    email: { type: String, required: true, unique: true },
    followers: [{ type: Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: Schema.Types.ObjectId, ref: "User" }],
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    wishlist: [{ type: Schema.Types.ObjectId, ref: "User" }],
    sold: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    role: { type: String, enum: ["Admin", "User", "Seller"], default: "User" },
    about: String,
    dob: Date,
    activeLastUpdated: { type: Date, default: Date.now },
    usernameLastUpdated: { type: Date, default: Date.now },
    buyers: [{ type: Schema.Types.ObjectId, ref: "User" }],
    rating: { type: Number, default: 0 },
    accountNumber: Number,
    phone: String,
    accountName: String,
    allowNewsletter: { type: Boolean, default: true },
    bankName: String,
    tokenVersion: String,
    address: AddressSchema,
    numReviews: { type: Number, default: 0 },
    badge: Boolean,
    active: { type: Boolean, default: true },
    delected: { type: Boolean, default: false },
    influencer: Boolean,
    isVerifiedEmail: { type: Boolean, default: false },
    region: { type: String, enum: ["NGN", "ZAR"], default: "NGN" },
    socketId: { type: String, default: null },
    rebundle: RebundleSchema,
  },
  { timestamps: true }
);

// Create and export the user model
const User = mongoose.model<IUser & Document>("User", UserSchema);
export default User;
