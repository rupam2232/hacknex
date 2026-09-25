import mongoose from "mongoose";

async function connectDB(): Promise<void> {
  const uri: string | undefined = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not defined in environment variables");
  }

  await mongoose.connect(uri);
  console.log(`✅ MongoDB connected: ${mongoose.connection.host}`);

  mongoose.connection.on("error", (err: Error) => {
    console.error("❌ MongoDB connection error:", err);
  });

  mongoose.connection.on("disconnected", () => {
    console.log("⚠️  MongoDB disconnected");
  });
}

export { connectDB };
