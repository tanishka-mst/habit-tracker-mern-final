import Habit from "../models/Habit.js";

export const createHabit = async (req, res) => {
  try {
    const { title, category, frequency, goal } = req.body;

    const habit = await Habit.create({
      userId: req.user.id,
      title,
      category,
      frequency,
      goal,
    });

    res.status(201).json({
      success: true,
      message: "Habit created successfully",
      habit,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
export const getHabits = async (req, res) => {
  try {
    const habits = await Habit.find({
      userId: req.user.id,
    });

    res.status(200).json({
      success: true,
      count: habits.length,
      habits,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateHabit = async (req, res) => {
  try {
    const habit = await Habit.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user.id,
      },
      req.body,
      {
        new: true,
      }
    );

    if (!habit) {
      return res.status(404).json({
        success: false,
        message: "Habit not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Habit updated successfully",
      habit,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
export const deleteHabit = async (req, res) => {
  try {
    const habit = await Habit.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!habit) {
      return res.status(404).json({
        success: false,
        message: "Habit not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Habit deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
export const archiveHabit = async (req, res) => {
  try {
    const habit = await Habit.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user.id,
      },
      {
        archived: true,
      },
      {
        new: true,
      }
    );

    if (!habit) {
      return res.status(404).json({
        success: false,
        message: "Habit not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Habit archived successfully",
      habit,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }

};
export const completeHabit = async (req, res) => {
  try {
    const habit = await Habit.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!habit) {
      return res.status(404).json({
        success: false,
        message: "Habit not found",
      });
    }

    // 🕛 Normalize dates (midnight)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let lastDate = habit.lastCompletedDate
      ? new Date(habit.lastCompletedDate)
      : null;

    if (lastDate) lastDate.setHours(0, 0, 0, 0);

    // 🟡 Same day completion
    if (lastDate && today.getTime() === lastDate.getTime()) {
      return res.status(200).json({
        success: true,
        message: "Habit already completed today",
        habit,
      });
    }

    // 🟢 Yesterday check
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (lastDate && lastDate.getTime() === yesterday.getTime()) {
      habit.streak += 1;
    } else {
      habit.streak = 1; // reset
    }

    habit.lastCompletedDate = today;
    await habit.save();

    res.status(200).json({
      success: true,
      message: "Habit marked as complete",
      habit,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};