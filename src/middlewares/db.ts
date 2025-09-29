import mongoose, { Connection } from 'mongoose';

const db = async (): Promise<Connection> => {
  mongoose.set('strictQuery', true);

  const uri = process.env.DATABASE_URL;
  if (!uri) {
    throw new Error('DATABASE environment variable is not set.');
  }
  await mongoose.connect(uri);
  //if connection is successful

  console.log('Connected to MongoDB');

  return mongoose.connection;
};

export { db };
