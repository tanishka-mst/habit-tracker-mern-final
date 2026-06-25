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

connectDB();

const app = express();

app.use(cors({
  origin: function(origin, callback) {
    // Allow localhost
    if (!origin || origin.includes('localhost')) {
      return callback(null, true)
    }
    // Allow all vercel.app URLs
    if (origin.includes('vercel.app')) {
      return callback(null, true)
    }
    // Allow render.com
    if (origin.includes('onrender.com')) {
      return callback(null, true)
    }
    callback(new Error('Not allowed by CORS'))
  },
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
app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);