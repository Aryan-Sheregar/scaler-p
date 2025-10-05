import Course from "../models/Course.js";
import Lecture from "../models/Lecture.js";
import { verifyToken, checkRole } from "../utils/authHelpers.js";

export const createCourse = async (req, res) => {
  try {
    const authResult = await verifyToken(req, res);
    if (authResult.error) {
      return res.status(authResult.status).json({ message: authResult.error });
    }

    const roleCheck = checkRole(authResult.user, ["instructor"]);
    if (roleCheck) {
      return res.status(roleCheck.status).json({ message: roleCheck.error });
    }

    const { title, description } = req.body;
    const course = await Course.create({
      title,
      description,
      instructor: authResult.user._id,
    });

    res.status(201).json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllCourses = async (req, res) => {
  try {
    const authResult = await verifyToken(req, res);
    if (authResult.error) {
      return res.status(authResult.status).json({ message: authResult.error });
    }

    const courses = await Course.find().populate("instructor", "name email");
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCourse = async (req, res) => {
  try {
    const authResult = await verifyToken(req, res);
    if (authResult.error) {
      return res.status(authResult.status).json({ message: authResult.error });
    }

    const course = await Course.findById(req.params.id).populate(
      "instructor",
      "name email"
    );

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const lectures = await Lecture.find({ course: course._id }).sort("order");
    res.json({ ...course.toObject(), lectures });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteCourse = async (req, res) => {
  try {

    const authResult = await verifyToken(req, res);
    if (authResult.error) {
      return res.status(authResult.status).json({ message: authResult.error });
    }
    const roleCheck = checkRole(authResult.user, ["instructor"]);
    if (roleCheck) {
      return res.status(roleCheck.status).json({ message: roleCheck.error });
    }
 //If the instructor owns that course then only delete karo
    const course = await Course.findOne({
      _id: req.params.id,
      instructor: authResult.user._id,
    });
    if (!course) {
      return res
        .status(404)
        .json({ message: "Course not found or not authorized" });
    }

    await Lecture.deleteMany({ course: course._id });

    await course.deleteOne();

    res.json({ message: "Course deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
