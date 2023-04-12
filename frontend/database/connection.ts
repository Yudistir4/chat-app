import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error('MongoDB URI not defined');
}

let cachedClient: mongoose.Connection | null = null;

export async function connectToDatabase() {
  if (cachedClient) {
    return cachedClient;
  }

  const client = await mongoose.connect(MONGODB_URI);

  cachedClient = client.connection;

  return cachedClient;
}

export default mongoose;
