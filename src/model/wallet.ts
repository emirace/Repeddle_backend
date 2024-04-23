import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IWallet extends Document {
  userId: Types.ObjectId;
  balance: number;
  currency: 'NGN' | 'ZAR';
}

const WalletSchema = new Schema<IWallet>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    balance: { type: Number, default: 0 },
    currency: { type: String, enum: ['NGN', 'ZAR'], required: true },
  },
  { timestamps: true }
);

const Wallet = mongoose.model<IWallet>('Wallet', WalletSchema);

export default Wallet;
