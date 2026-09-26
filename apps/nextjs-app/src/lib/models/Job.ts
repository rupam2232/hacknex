import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
  employerPhone: { type: String, required: true },
  title: { type: String, required: true },
  workersCount: { type: Number, required: true },
  date: { type: String, required: true },
  startTime: { type: String, required: true },
  duration: { type: String, required: true },
  wage: { type: Number, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  coordinates: {
    type: { type: String, enum: ["Point"] },
    coordinates: { type: [Number] },
  },
  status: {
    type: String,
    enum: ["Open", "In Progress", "Done", "Cancelled"],
    default: "Open",
  },
  createdAt: { type: Date, default: Date.now },
});

jobSchema.index({ coordinates: "2dsphere" });
jobSchema.index({ employerPhone: 1, createdAt: -1 });

export const Job = mongoose.model("Job", jobSchema);
