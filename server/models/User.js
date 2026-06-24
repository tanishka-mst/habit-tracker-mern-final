import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    // ── Security Question for Forgot Password ──
    securityQuestion: {
      type: String,
      default: "",
    },

    securityAnswer: {
      type: String,  // stored as lowercased + trimmed
      default: "",
    },

    level: {
      type: Number,
      default: 1,
    },

    xp: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;
