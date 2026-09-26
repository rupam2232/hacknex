import mongoose from "mongoose";

let cached = (globalThis as any).mongoose;

if (!cached) {
  cached = (globalThis as any).mongoose = { conn: null, promise: null };
}

async function connectDB(): Promise<mongoose.Connection> {
  if (cached.conn) {
    return cached.conn;
  }

  const mongodbUrl = process.env.MONGODB_URL;
  if (!mongodbUrl) {
    throw new Error("MONGODB_URL is not defined in environment variables");
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(mongodbUrl).then((mongooseInstance) => {
      console.log("✅ MongoDB connected");
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (err) {
    cached.promise = null;
    throw err;
  }
}

export default connectDB;
export { connectDB };

