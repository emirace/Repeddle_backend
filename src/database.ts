// src/database.ts

import mongoose from 'mongoose';
import dotenv from 'dotenv'; // Load environment variables

dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/your-database-name';

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('MongoDB connection error:', error));

export default mongoose.connection;
