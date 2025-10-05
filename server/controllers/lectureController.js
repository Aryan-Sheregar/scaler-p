import Lecture from "../models/Lecture.js";
import Course from "../models/Course.js";
import Progress from "../models/Progress.js";
import { verifyToken, checkRole } from "../utils/authHelpers.js";

export const createLecture = async (req, res) => {
  try {
    const authResult = await verifyToken(req, res);
    if (authResult.error) {
      return res.status(authResult.status).json({ message: authResult.error });
    }

    const roleCheck = checkRole(authResult.user, ["instructor"]);
    if (roleCheck) {
      return res.status(roleCheck.status).json({ message: roleCheck.error });
    }

    const { courseId, title, type, content, questions, order } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    if (course.instructor.toString() !== authResult.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const lecture = await Lecture.create({
      course: courseId,
      title,
      type,
      content,
      questions,
      order,
    });

    res.status(201).json(lecture);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getLecture = async (req, res) => {
  try {
    const authResult = await verifyToken(req, res);
    if (authResult.error) {
      return res.status(authResult.status).json({ message: authResult.error });
    }

    const lecture = await Lecture.findById(req.params.id);

    if (!lecture) {
      return res.status(404).json({ message: "Lecture not found" });
    }

    // Remove correct answers from quiz questions for students
    if (lecture.type === "quiz" && authResult.user.role === "student") {
      const sanitizedLecture = lecture.toObject();
      sanitizedLecture.questions = sanitizedLecture.questions.map((q) => ({
        questionText: q.questionText,
        options: q.options,
        _id: q._id,
      }));
      return res.json(sanitizedLecture);
    }

    res.json(lecture);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteLecture = async (req, res) => {
  try {
    const authResult = await verifyToken(req, res);
    if (authResult.error)
      return res.status(authResult.status).json({ message: authResult.error });
    const roleCheck = checkRole(authResult.user, ["instructor"]);
    if (roleCheck)
      return res.status(roleCheck.status).json({ message: roleCheck.error });

    const lecture = await Lecture.findById(req.params.id);
    if (!lecture) return res.status(404).json({ message: "Lecture not found" });

    const course = await Course.findById(lecture.course);
    if (
      !course ||
      course.instructor.toString() !== authResult.user._id.toString()
    )
      return res.status(403).json({ message: "Not authorized" });

    await lecture.deleteOne();
    res.json({ message: "Lecture deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const submitQuiz = async (req, res) => {
  try {
    const authResult = await verifyToken(req, res);
    if (authResult.error) {
      return res.status(authResult.status).json({ message: authResult.error });
    }

    const roleCheck = checkRole(authResult.user, ["student"]);
    if (roleCheck) {
      return res.status(roleCheck.status).json({ message: roleCheck.error });
    }

    const { answers } = req.body;
    const lecture = await Lecture.findById(req.params.id);

    if (!lecture || lecture.type !== "quiz") {
      return res.status(404).json({ message: "Quiz not found" });
    }

    let correct = 0;
    lecture.questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        correct++;
      }
    });

    const score = (correct / lecture.questions.length) * 100;
    const passed = score >= 70;

    // Update progress
    if (passed) {
      let progress = await Progress.findOne({
        student: authResult.user._id,
        course: lecture.course,
      });

      if (!progress) {
        progress = await Progress.create({
          student: authResult.user._id,
          course: lecture.course,
          completedLectures: [],
        });
      }

      const alreadyCompleted = progress.completedLectures.some(
        (cl) => cl.lecture.toString() === lecture._id.toString()
      );

      if (!alreadyCompleted) {
        progress.completedLectures.push({
          lecture: lecture._id,
          score,
        });
        await progress.save();
      }
    }

    res.json({ score, passed, correct, total: lecture.questions.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
