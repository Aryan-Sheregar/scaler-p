import express from "express";
import {
  createCourse,
  getAllCourses,
  getCourse,
} from "../controllers/courseController.js";

const router = express.Router();

router.post("/", createCourse);
router.get("/", getAllCourses);
router.get("/:id", getCourse);

export default router;
