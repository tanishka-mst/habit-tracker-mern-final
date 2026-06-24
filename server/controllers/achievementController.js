import Achievement from "../models/Achievement.js";

export const getAchievements = async (req, res) => {
  try {
    const achievements = await Achievement.find({
      userId: req.user.id,
    });

    res.status(200).json({
      success: true,
      count: achievements.length,
      achievements,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};