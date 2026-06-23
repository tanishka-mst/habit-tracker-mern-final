import mongoose from "mongoose";

const habitSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      default: "General",
    },

    frequency: {
      type: String,
      enum: ["Daily", "Weekly"],
      default: "Daily",
    },

    goal: {
      type: Number,
      default: 1,
    },

    // ✅ STREAK LOGIC FIELDS
    streak: {
      type: Number,
      default: 0,
    },

    lastCompletedDate: {
      type: Date,
      default: null,
    },

    archived: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Habit = mongoose.model("Habit", habitSchema);

export default Habit;