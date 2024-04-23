import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ITransaction extends Document {
  walletId: Types.ObjectId;
  amount: number;
  type: 'credit' | 'debit';
  description?: string;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    walletId: { type: Schema.Types.ObjectId, ref: 'Wallet', required: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: ['credit', 'debit'], required: true },
    description: { type: String },
  },
  { timestamps: true }
);

const Transaction = mongoose.model<ITransaction>(
  'Transaction',
  TransactionSchema
);

export default Transaction;
