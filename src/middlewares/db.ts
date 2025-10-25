import mongoose, { Connection } from 'mongoose';

const MONGODB_URI = process.env.DATABASE_URL;
if (!MONGODB_URI) {
  throw new Error('DATABASE_URL environment variable is not set.');
}

type MongooseGlobal = {
  _mongoose?: { conn: Connection | null; promise: Promise<Connection> | null; shutdownHookSet?: boolean };
};

const globalForMongoose = globalThis as typeof globalThis & MongooseGlobal;

if (!globalForMongoose._mongoose) {
  globalForMongoose._mongoose = { conn: null, promise: null, shutdownHookSet: false };
}

const cached = globalForMongoose._mongoose;

export async function db(): Promise<Connection> {
  // If we already have a live connection, use it
  if (cached.conn && cached.conn.readyState === 1) {
    return cached.conn;
  }

  // If a connection attempt is in-flight, await it
  if (cached.promise) {
    return cached.promise;
  }

  // Create a new connection attempt and cache the promise
  cached.promise = mongoose
    .connect(MONGODB_URI!, {
      // Add options if you need them
      // serverSelectionTimeoutMS: 5000,
      // dbName: "yourDbName",
    })
    .then((m) => {
      cached.conn = m.connection;

      if (!cached.shutdownHookSet) {
        cached.shutdownHookSet = true;

        const cleanup = async (signal: string) => {
          try {
            if (cached.conn && cached.conn.readyState === 1) {
              await cached.conn.close();

              console.log(`[${signal}] Closed MongoDB connection.`);
            }
          } finally {
            process.exit(0);
          }
        };

        // Close cleanly on exit in dev/production
        process.once('SIGINT', () => cleanup('SIGINT'));
        process.once('SIGTERM', () => cleanup('SIGTERM'));
      }

      console.log('Connected to MongoDB');
      return m.connection;
    });

  return cached.promise;
}
