import mongoose from "mongoose";

const habitLogSchema = new mongoose.Schema(
  {
    habitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Habit",
      required: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    date: {
      type: String,
      required: true,
    },

    completed: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const HabitLog = mongoose.model("HabitLog", habitLogSchema);

export default HabitLog;