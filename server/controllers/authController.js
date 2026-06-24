import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// ── Register User ──
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, securityQuestion, securityAnswer } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    if (!securityQuestion || !securityAnswer) {
      return res.status(400).json({
        success: false,
        message: "Security question and answer are required",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      securityQuestion,
      securityAnswer: securityAnswer.toLowerCase().trim(),
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id:    user._id,
        name:  user.name,
        email: user.email,
        level: user.level,
        xp:    user.xp,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Login User ──
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id:    user._id,
        name:  user.name,
        email: user.email,
        level: user.level,
        xp:    user.xp,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Get Profile ──
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password -securityAnswer");
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Get Security Question by Email ──
// POST /api/auth/get-security-question
export const getSecurityQuestion = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email",
      });
    }

    if (!user.securityQuestion) {
      return res.status(400).json({
        success: false,
        message: "This account has no security question set",
      });
    }

    res.status(200).json({
      success: true,
      securityQuestion: user.securityQuestion,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Verify Answer + Reset Password ──
// POST /api/auth/reset-with-answer
export const resetWithAnswer = async (req, res) => {
  try {
    const { email, securityAnswer, newPassword } = req.body;

    if (!email || !securityAnswer || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email, security answer and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email",
      });
    }

    // Compare answer (case-insensitive)
    const answerMatch =
      user.securityAnswer === securityAnswer.toLowerCase().trim();

    if (!answerMatch) {
      return res.status(400).json({
        success: false,
        message: "Incorrect security answer. Please try again.",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successful! You can now login.",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
