import dotenv from 'dotenv';

dotenv.config();

export const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/your-database-name';

export const secretKey = process.env.JWT_SECRET || '';
