import HabitLog from "../models/HabitLog.js";
import Habit from "../models/Habit.js";

export const markHabitComplete = async (req, res) => {
  try {
    const { habitId } = req.params;

    const habit = await Habit.findOne({
      _id: habitId,
      userId: req.user.id,
    });

    if (!habit) {
      return res.status(404).json({
        success: false,
        message: "Habit not found",
      });
    }

    const today = new Date().toISOString().split("T")[0];

    const existingLog = await HabitLog.findOne({
      habitId,
      date: today,
    });

    if (existingLog) {
      return res.status(400).json({
        success: false,
        message: "Habit already completed today",
      });
    }

    const log = await HabitLog.create({
      habitId,
      userId: req.user.id,
      date: today,
      completed: true,
    });

    res.status(201).json({
      success: true,
      message: "Habit marked complete",
      log,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getHabitLogs = async (req, res) => {
  try {
    const logs = await HabitLog.find({
      userId: req.user.id,
    }).populate("habitId", "title");

    res.status(200).json({
      success: true,
      count: logs.length,
      logs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
export const getHabitStreak = async (req, res) => {
  try {
    const { habitId } = req.params;

    const logs = await HabitLog.find({
      habitId,
      completed: true,
    }).sort({ date: -1 });

    let streak = 0;

    const today = new Date();

    for (let i = 0; i < logs.length; i++) {
      const logDate = new Date(logs[i].date);

      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - i);

      if (
        logDate.toISOString().split("T")[0] ===
        expectedDate.toISOString().split("T")[0]
      ) {
        streak++;
      } else {
        break;
      }
    }

    res.status(200).json({
      success: true,
      streak,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
export const getLongestStreak = async (req, res) => {
  try {
    const { habitId } = req.params;

    const logs = await HabitLog.find({
      habitId,
      completed: true,
    }).sort({ date: 1 });

    if (logs.length === 0) {
      return res.status(200).json({
        success: true,
        longestStreak: 0,
      });
    }

    let longestStreak = 1;
    let currentStreak = 1;

    for (let i = 1; i < logs.length; i++) {
      const prevDate = new Date(logs[i - 1].date);
      const currentDate = new Date(logs[i].date);

      const diffDays = Math.floor(
        (currentDate - prevDate) / (1000 * 60 * 60 * 24)
      );

      if (diffDays === 1) {
        currentStreak++;
      } else {
        longestStreak = Math.max(
          longestStreak,
          currentStreak
        );
        currentStreak = 1;
      }
    }

    longestStreak = Math.max(
      longestStreak,
      currentStreak
    );

    res.status(200).json({
      success: true,
      longestStreak,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};