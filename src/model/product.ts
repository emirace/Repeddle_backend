import mongoose, { Schema, Document, ObjectId } from "mongoose";

export interface Review {
  user: string;
  comment: string;
  rating: number;
  like?: string;
}

export interface Share {
  user: string | null;
  hashed: string;
  time: Date | null;
}

export interface PriceHistory {
  value: number;
  updatedAt: Date;
}

export interface ViewCount {
  hashed: string;
  time: Date;
}

export interface ISize {
  size: string;
  quantity: number;
}

export interface IProduct extends Document {
  name: string;
  seller: ObjectId;
  slug: string;
  images: string[];
  tags: string[];
  video?: string;
  brand?: string;
  color?: string;
  mainCategory: string;
  category?: string;
  subCategory?: string;
  material?: string;
  description: string;
  sizes: ISize[];
  buyers: ObjectId[];
  deliveryOption?: any[];
  condition: string;
  keyFeatures?: string;
  specification?: string;
  overview?: string;
  sellingPrice: number;
  costPrice: number;
  rating: number;
  likes: string[];
  shares: Share[];
  viewcount: ViewCount[];
  reviews: Review[];
  badge?: boolean;
  meta: object;
  active?: boolean;
  vintage?: boolean;
  luxury?: boolean;
  luxuryImage?: string;
  region: "NGN" | "ZAR";
  countInStock: number;
  isAvailable: boolean;
  sellingPriceHistory?: PriceHistory[];
  costPriceHistory?: PriceHistory[];
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    seller: { type: Schema.Types.ObjectId, ref: "User", required: true },
    slug: { type: String, required: true, unique: true },
    images: { type: [String], required: true },
    tags: { type: [String], required: true },
    video: String,
    brand: String,
    color: String,
    mainCategory: { type: String, required: true },
    category: String,
    subCategory: String,
    material: String,
    description: { type: String, required: true },
    sizes: [{ size: String, quantity: Number }],
    buyers: [{ type: Schema.Types.ObjectId, ref: "User" }],
    deliveryOption: [Schema.Types.Mixed],
    condition: { type: String, required: true },
    keyFeatures: String,
    specification: String,
    overview: String,
    sellingPrice: { type: Number, required: true },
    costPrice: { type: Number, required: true },
    rating: { type: Number, default: 0 },
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    shares: [
      {
        user: { type: Schema.Types.ObjectId, ref: "User" },
        hashed: String,
        time: Date,
      },
    ],
    viewcount: [{ hashed: String, time: Date }],
    reviews: [
      {
        user: { type: Schema.Types.ObjectId, ref: "User" },
        comment: String,
        rating: Number,
        like: String,
      },
    ],
    meta: Schema.Types.Mixed,
    active: { type: Boolean, default: true },
    badge: { type: Boolean, default: false },
    vintage: Boolean,
    luxury: Boolean,
    luxuryImage: String,
    region: { type: String, enum: ["NGN", "ZAR"], required: true },
    isAvailable: { type: Boolean, default: true },
    sellingPriceHistory: [{ value: Number, updatedAt: Date }],
    countInStock: { type: Number, default: 0 },
    costPriceHistory: [{ value: Number, updatedAt: Date }],
  },
  { timestamps: true }
);

const Product = mongoose.model<IProduct>("Product", ProductSchema);

export default Product;
