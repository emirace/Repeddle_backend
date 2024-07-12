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

export interface Review {
  user: string;
  comment: string;
  rating: number;
  like?: string;
}

export interface IUser extends Document {
  username: string;
  firstName: string;
  lastName: string;
  image?: string;
  email: string;
  role: "Admin" | "User" | "Guest";
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
  isSeller?: boolean;
  address?: IAddress;
  reviews: Review[];
  numReviews: number;
  badge: boolean;
  active: boolean;
  influencer: boolean;
  isVerifiedEmail: boolean;
  region: "NGN" | "ZAR";
  rebundle: IRebundle;
  tokenVersion: number;
  deleted: boolean;
  socketId?: string;
}

const reviewSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    comment: { type: String, required: true },
    rating: { type: Number, required: true },
    like: { type: Boolean },
  },
  {
    timestamps: true,
  }
);

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
    username: { type: String, required: true, unique: true, index: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    image: { type: String, default: "/api/images/image1716190469271.jpg" },
    password: String,
    email: { type: String, required: true, unique: true },
    followers: [{ type: Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: Schema.Types.ObjectId, ref: "User" }],
    likes: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    wishlist: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    sold: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    role: {
      type: String,
      enum: ["Admin", "User", "Guest"],
      default: "User",
    },
    isSeller: { type: Boolean, default: false },
    about: { type: String },
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
    tokenVersion: { type: Number, default: 0 },
    reviews: [reviewSchema],
    address: AddressSchema,
    numReviews: { type: Number, default: 0 },
    badge: Boolean,
    active: { type: Boolean, default: true },
    deleted: { type: Boolean, default: false },
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
