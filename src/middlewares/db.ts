import mongoose, { Connection } from 'mongoose';
import { DB_CONNECTION_URL, ENV } from '../config/env';

// Validate required environment variables for Atlas connection
if (!ENV.DB_URL_PREFIX || !ENV.DB_URL_BASE || !ENV.DB_USER || !ENV.DB_USER_PASS) {
  throw new Error('Required MongoDB Atlas environment variables are not set. Please check DB_URL_PREFIX, DB_URL_BASE, DB_USER, and DB_USER_PASS.');
}

const MONGODB_URI = DB_CONNECTION_URL;

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
      // Atlas-specific connection options
      serverSelectionTimeoutMS: 10000, // Keep trying to send operations for 10 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      bufferCommands: false, // Disable mongoose buffering
      maxPoolSize: 10, // Maintain up to 10 socket connections
      minPoolSize: 5, // Maintain a minimum of 5 socket connections
      maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
      retryWrites: true, // Retry failed writes
      w: 'majority', // Write concern
      ...(ENV.DB_NAME && { dbName: ENV.DB_NAME }), // Use specific database name if provided
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

      console.log('Connected to MongoDB Atlas');
      return m.connection;
    });

  return cached.promise;
}
