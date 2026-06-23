import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes        from "./routes/authRoutes.js";
import habitRoutes       from "./routes/habitRoutes.js";
import habitLogRoutes    from "./routes/habitLogRoutes.js";
import dashboardRoutes   from "./routes/dashboardRoutes.js";
import achievementRoutes from "./routes/achievementRoutes.js";

console.log("MONGO_URI =", process.env.MONGO_URI);

connectDB();

const app = express();

// ✅ Allow React frontend
app.use(cors({
  origin: "*",
  credentials: true,
}));

app.use(express.json());

app.use("/api/auth",         authRoutes);
app.use("/api/habits",       habitRoutes);
app.use("/api/logs",         habitLogRoutes);
app.use("/api/dashboard",    dashboardRoutes);
app.use("/api/achievements", achievementRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Habit Tracker API Running ✅" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
