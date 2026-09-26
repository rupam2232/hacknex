import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Job",
    required: true,
  },
  workerPhone: { type: String, required: true },
  workerName: { type: String, required: true },
  workerLocation: { type: String },
  wageExpectation: { type: Number },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending",
  },
  createdAt: { type: Date, default: Date.now },
});

applicationSchema.index({ jobId: 1, workerPhone: 1 }, { unique: true });
applicationSchema.index({ jobId: 1, createdAt: -1 });

export const Application = mongoose.model("Application", applicationSchema);
