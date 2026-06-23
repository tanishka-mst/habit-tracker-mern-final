import Habit from "../models/Habit.js";
import HabitLog from "../models/HabitLog.js";
import mongoose from "mongoose";

export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const totalHabits = await Habit.countDocuments({
      userId,
      archived: false,
    });

    const today = new Date().toISOString().split("T")[0];

    const completedToday = await HabitLog.countDocuments({
      userId,
      date: today,
      completed: true,
    });

    const totalLogs = await HabitLog.countDocuments({
      userId,
      completed: true,
    });

    const pendingToday = totalHabits - completedToday;

    const completionRate =
      totalHabits > 0
        ? Math.round((completedToday / totalHabits) * 100)
        : 0;

    res.status(200).json({
      success: true,
      analytics: {
        totalHabits,
        completedToday,
        pendingToday,
        totalLogs,
        completionRate,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
export const getWeeklyAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;

    const weeklyData = await HabitLog.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          completed: true,
        },
      },
      {
        $group: {
          _id: "$date",
          completed: {
            $sum: 1,
          },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      weeklyData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};