import mongoose from "mongoose";

const workerSchema = new mongoose.Schema(
  {
    phone: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    skill: { type: String, enum: ["painter", "carpenter", "mason", "electrician", "plumber"], lowercase: true },
    location: { type: String },
    callCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

workerSchema.index({ phone: 1 });

export const Worker = mongoose.model("Worker", workerSchema);
