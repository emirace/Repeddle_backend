import mongoose, { Document, Schema } from 'mongoose';

interface ISubCategoryItem {
  name: string;
  isCategory?: boolean;
  path?: string | null;
}

interface ISubCategory extends Document {
  name?: string;
  items: ISubCategoryItem[];
  isCategory?: boolean;
  path?: string | null;
}

export interface ICategory extends Document {
  name: string;
  image?: string;
  isCategory?: boolean;
  path?: string | null;
  subCategories: ISubCategory[];
}

const subCategoryItemSchema = new Schema<ISubCategoryItem>({
  name: { type: String, required: true },
  isCategory: { type: Boolean, default: true },
  path: { type: String, default: null },
});

const subCategorySchema = new Schema<ISubCategory>({
  name: { type: String, required: true },
  items: [subCategoryItemSchema],
  isCategory: { type: Boolean, default: true },
  path: { type: String, default: null },
});

const categorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true },
    image: { type: String },
    isCategory: { type: Boolean, default: true },
    path: { type: String, default: null },
    subCategories: [subCategorySchema],
  },
  {
    timestamps: true,
  }
);

const Category = mongoose.model<ICategory>('Category', categorySchema);

export default Category;
