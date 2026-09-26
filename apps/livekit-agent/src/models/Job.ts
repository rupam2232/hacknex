import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    skill: { type: String, enum: ["painter", "carpenter", "mason", "electrician", "plumber"], lowercase: true, required: true },
    region: { type: String, required: true },
    area: { type: String, required: true },
    aliases: [String],
    dailyWage: { type: Number, required: true },
    contractorName: { type: String, required: true },
    contractorPhone: { type: String, required: true },
    status: { type: String, default: "active" },
    locationCoordinates: {
      type: { type: String, default: "Point" },
      coordinates: { type: [Number], required: true }
    }
  },
  { timestamps: true }
);

jobSchema.index({ skill: 1, status: 1 });
jobSchema.index({ locationCoordinates: "2dsphere" });

export const Job = mongoose.model("Job", jobSchema);
