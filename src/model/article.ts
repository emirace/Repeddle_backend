import mongoose, { Document, Model } from 'mongoose';

export interface IArticle extends Document {
  topic: string;
  category: string;
  content: string;
}

const articleSchema = new mongoose.Schema<IArticle>(
  {
    topic: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Article: Model<IArticle> = mongoose.model<IArticle>(
  'Article',
  articleSchema
);

export default Article;
