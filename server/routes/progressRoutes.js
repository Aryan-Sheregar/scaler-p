import express from "express";
import {
  markLectureComplete,
  getCourseProgress,
} from "../controllers/progressController.js";

const router = express.Router();

router.post("/complete", markLectureComplete);
router.get("/course/:courseId", getCourseProgress);

export default router;
