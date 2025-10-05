import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../utils/api";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const [courses, setCourses] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const { data } = await API.get("/courses");
        setCourses(data);
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };
    fetchCourses();
  }, []);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">
        {user?.role === "instructor" ? "My Courses" : "Available Courses"}
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <Link
            key={course._id}
            to={`/course/${course._id}`}
            className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition"
          >
            <h3 className="text-xl font-semibold mb-2">{course.title}</h3>
            <p className="text-gray-600 mb-3">{course.description}</p>
            <p className="text-sm text-gray-500">
              Instructor: {course.instructor?.name}
            </p>
          </Link>
        ))}
      </div>
      {courses.length === 0 && (
        <p className="text-center text-gray-500 mt-8">No courses available</p>
      )}
    </div>
  );
};

export default Dashboard;
