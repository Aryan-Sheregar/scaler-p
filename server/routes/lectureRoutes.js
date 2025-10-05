import express from "express";
import {
  createLecture,
  getLecture,
  submitQuiz,
} from "../controllers/lectureController.js";
import { deleteLecture } from "../controllers/lectureController.js";

const router = express.Router();

router.post("/", createLecture);
router.get("/:id", getLecture);
router.post("/:id/submit", submitQuiz);
router.delete("/:id", deleteLecture);

export default router;
