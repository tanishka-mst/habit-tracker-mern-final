import mongoose from "mongoose";

const achievementSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    badgeName: {
      type: String,
      required: true,
    },

    earnedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Achievement = mongoose.model(
  "Achievement",
  achievementSchema
);

export default Achievement;