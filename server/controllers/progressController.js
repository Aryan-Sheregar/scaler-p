import Progress from "../models/Progress.js";
import Lecture from "../models/Lecture.js";
import { verifyToken, checkRole } from "../utils/authHelpers.js";

export const markLectureComplete = async (req, res) => {
  try {
    const authResult = await verifyToken(req, res);
    if (authResult.error) {
      return res.status(authResult.status).json({ message: authResult.error });
    }

    const roleCheck = checkRole(authResult.user, ["student"]);
    if (roleCheck) {
      return res.status(roleCheck.status).json({ message: roleCheck.error });
    }

    const { lectureId, courseId } = req.body;

    const lecture = await Lecture.findById(lectureId);
    if (!lecture || lecture.type !== "reading") {
      return res.status(400).json({ message: "Invalid lecture" });
    }

    let progress = await Progress.findOne({
      student: authResult.user._id,
      course: courseId,
    });

    if (!progress) {
      progress = await Progress.create({
        student: authResult.user._id,
        course: courseId,
        completedLectures: [],
      });
    }

    const alreadyCompleted = progress.completedLectures.some(
      (cl) => cl.lecture.toString() === lectureId
    );

    if (!alreadyCompleted) {
      progress.completedLectures.push({ lecture: lectureId });
      await progress.save();
    }

    res.json({ message: "Lecture marked as complete" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCourseProgress = async (req, res) => {
  try {
    const authResult = await verifyToken(req, res);
    if (authResult.error) {
      return res.status(authResult.status).json({ message: authResult.error });
    }

    const roleCheck = checkRole(authResult.user, ["student"]);
    if (roleCheck) {
      return res.status(roleCheck.status).json({ message: roleCheck.error });
    }

    const progress = await Progress.findOne({
      student: authResult.user._id,
      course: req.params.courseId,
    }).populate("completedLectures.lecture");

    const totalLectures = await Lecture.countDocuments({
      course: req.params.courseId,
    });

    res.json({
      completed: progress?.completedLectures.length || 0,
      total: totalLectures,
      completedLectures: progress?.completedLectures || [],
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
