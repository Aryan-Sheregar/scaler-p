import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../utils/api";
import { useAuth } from "../context/AuthContext";

const CourseDetail = () => {
  const [course, setCourse] = useState(null);
  const [lectures, setLectures] = useState([]);
  const [progress, setProgress] = useState(null);
  const [showAddLecture, setShowAddLecture] = useState(false);
  const [lectureForm, setLectureForm] = useState({
    title: "",
    type: "reading",
    content: "",
    questions: [],
  });
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourseData();
    if (user?.role === "student") {
      fetchProgress();
    }
  }, [id]);

  const fetchCourseData = async () => {
    try {
      const { data } = await API.get(`/courses/${id}`);
      setCourse(data);
      setLectures(data.lectures || []);
    } catch (error) {
      console.error("Error fetching course:", error);
    }
  };

  const handleDeleteCourse = async () => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;
    try {
      await API.delete(`/courses/${id}`);
      navigate("/dashboard");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete course");
    }
  };

  const handleDeleteLecture = async (lectureId) => {
    if (!window.confirm("Are you sure you want to delete this lecture?"))
      return;
    try {
      await API.delete(`/lectures/${lectureId}`);
      fetchCourseData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete lecture");
    }
  };

  const fetchProgress = async () => {
    try {
      const { data } = await API.get(`/progress/course/${id}`);
      setProgress(data);
    } catch (error) {
      console.error("Error fetching progress:", error);
    }
  };

  const handleAddLecture = async (e) => {
    e.preventDefault();
    try {
      await API.post("/lectures", {
        courseId: id,
        ...lectureForm,
        order: lectures.length + 1,
      });
      setShowAddLecture(false);
      setLectureForm({
        title: "",
        type: "reading",
        content: "",
        questions: [],
      });
      fetchCourseData();
    } catch (error) {
      console.error("Error creating lecture:", error);
    }
  };

  const addQuestion = () => {
    setLectureForm({
      ...lectureForm,
      questions: [
        ...lectureForm.questions,
        { questionText: "", options: ["", "", "", ""], correctAnswer: 0 },
      ],
    });
  };

  const updateQuestion = (index, field, value) => {
    const newQuestions = [...lectureForm.questions];
    newQuestions[index][field] = value;
    setLectureForm({ ...lectureForm, questions: newQuestions });
  };

  const updateOption = (qIndex, oIndex, value) => {
    const newQuestions = [...lectureForm.questions];
    newQuestions[qIndex].options[oIndex] = value;
    setLectureForm({ ...lectureForm, questions: newQuestions });
  };

  if (!course) return <div className="flex justify-center p-8">Loading...</div>;

  return (
    <div className="container mx-auto p-6">
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
        <p className="text-gray-600 mb-4">{course.description}</p>
        <p className="text-sm text-gray-500">
          Instructor: {course.instructor?.name}
        </p>
        {progress && (
          <div className="mt-4 p-4 bg-blue-50 rounded">
            <p className="font-semibold">
              Progress: {progress.completed}/{progress.total} lectures completed
            </p>
          </div>
        )}
      </div>

      {user?.role === "instructor" && (
        <button
          onClick={() => setShowAddLecture(!showAddLecture)}
          className="mb-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          {showAddLecture ? "Cancel" : "Add Lecture"}
        </button>
      )}

      {user?.role === "instructor" && course?.instructor?._id === user.id && (
        <button
          onClick={handleDeleteCourse}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 ml-4"
        >
          Delete Course
        </button>
      )}

      {showAddLecture && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Add New Lecture</h2>
          <form onSubmit={handleAddLecture}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Title</label>
              <input
                type="text"
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={lectureForm.title}
                onChange={(e) =>
                  setLectureForm({ ...lectureForm, title: e.target.value })
                }
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Type</label>
              <select
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={lectureForm.type}
                onChange={(e) =>
                  setLectureForm({ ...lectureForm, type: e.target.value })
                }
              >
                <option value="reading">Reading</option>
                <option value="quiz">Quiz</option>
              </select>
            </div>

            {lectureForm.type === "reading" ? (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Content
                </label>
                <textarea
                  className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="6"
                  value={lectureForm.content}
                  onChange={(e) =>
                    setLectureForm({ ...lectureForm, content: e.target.value })
                  }
                  required
                />
              </div>
            ) : (
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium">Questions</label>
                  <button
                    type="button"
                    onClick={addQuestion}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                  >
                    Add Question
                  </button>
                </div>
                {lectureForm.questions.map((q, qIndex) => (
                  <div key={qIndex} className="border p-4 rounded mb-4">
                    <input
                      type="text"
                      placeholder="Question text"
                      className="w-full px-4 py-2 border rounded mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={q.questionText}
                      onChange={(e) =>
                        updateQuestion(qIndex, "questionText", e.target.value)
                      }
                      required
                    />
                    {q.options.map((opt, oIndex) => (
                      <input
                        key={oIndex}
                        type="text"
                        placeholder={`Option ${oIndex + 1}`}
                        className="w-full px-4 py-2 border rounded mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={opt}
                        onChange={(e) =>
                          updateOption(qIndex, oIndex, e.target.value)
                        }
                        required
                      />
                    ))}

                    <select
                      className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={q.correctAnswer}
                      onChange={(e) =>
                        updateQuestion(
                          qIndex,
                          "correctAnswer",
                          parseInt(e.target.value)
                        )
                      }
                    >
                      <option value={0}>Option 1 is correct</option>
                      <option value={1}>Option 2 is correct</option>
                      <option value={2}>Option 3 is correct</option>
                      <option value={3}>Option 4 is correct</option>
                    </select>
                  </div>
                ))}
              </div>
            )}

            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              Create Lecture
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Lectures</h2>
        {lectures.length === 0 ? (
          <p className="text-gray-500">No lectures yet</p>
        ) : (
          <div className="space-y-3">
            {lectures.map((lecture, index) => {
              const isCompleted = progress?.completedLectures.some(
                (cl) => cl.lecture._id === lecture._id
              );
              const canAccess =
                user?.role === "instructor" ||
                index === 0 ||
                progress?.completedLectures.some(
                  (cl) =>
                    lectures[index - 1] &&
                    cl.lecture._id === lectures[index - 1]._id
                );

              return (
                <div
                  key={lecture._id}
                  className={`p-4 border rounded ${
                    !canAccess ? "opacity-50" : "hover:bg-gray-50"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <h3 className="font-semibold">{lecture.title}</h3>
                      <span className="text-sm text-gray-500">
                        {lecture.type === "quiz" ? "📝 Quiz" : "📖 Reading"}
                      </span>
                      {isCompleted && (
                        <span className="ml-2 text-sm text-green-600">
                          ✓ Completed
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {canAccess && (
                        <button
                          onClick={() => navigate(`/lecture/${lecture._id}`)}
                          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        >
                          {user?.role === "instructor" ? "View" : "Start"}
                        </button>
                      )}
                      {user?.role === "instructor" &&
                        course?.instructor?._id === user.id && (
                          <button
                            onClick={() => handleDeleteLecture(lecture._id)}
                            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 ml-2"
                          >
                            Delete
                          </button>
                        )}
                      {!canAccess && (
                        <span className="text-sm text-gray-400">Locked</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

};

export default CourseDetail;
