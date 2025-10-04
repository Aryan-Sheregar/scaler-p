import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import lectureRoutes from "./routes/lectureRoutes.js";
import progressRoutes from "./routes/progressRoutes.js";


dotenv.config();
const app = express();
const PORT = process.env.PORT;

app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);
app.use(express.json());

connectDB();

app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/lectures", lectureRoutes);
app.use("/api/progress", progressRoutes);


app.use((req, res, next) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Route error" });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
