import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    phone: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, enum: ["worker", "employer"], required: true },
    location: {
      lat: String,
      lon: String,
      addressObj: mongoose.Schema.Types.Mixed,
    },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

userSchema.index({ phone: 1 });

const UserModel = mongoose.models.User || mongoose.model("User", userSchema);

export { UserModel as Worker, UserModel as User };
export default UserModel;
