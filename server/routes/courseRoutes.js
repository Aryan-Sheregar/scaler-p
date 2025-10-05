import express from "express";
import {
  createCourse,
  getAllCourses,
  getCourse,
} from "../controllers/courseController.js";
import { deleteCourse } from "../controllers/courseController.js";

const router = express.Router();

router.post("/", createCourse);
router.get("/", getAllCourses);
router.get("/:id", getCourse);
router.delete("/:id", deleteCourse);

export default router;
