import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../utils/api";
import { useAuth } from "../context/AuthContext";

const LectureView = () => {
  const [lecture, setLecture] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchLecture();
  }, [id]);

  const fetchLecture = async () => {
    try {
      const { data } = await API.get(`/lectures/${id}`);
      setLecture(data);
    } catch (error) {
      console.error("Error fetching lecture:", error);
    }
  };

  const handleComplete = async () => {
    try {
      await API.post("/progress/complete", {
        lectureId: id,
        courseId: lecture.course,
      });
      navigate(`/course/${lecture.course}`);
    } catch (error) {
      console.error("Error marking complete:", error);
    }
  };

  const handleQuizSubmit = async () => {
    try {
      const answerArray = lecture.questions.map(
        (_, index) => answers[index] || 0
      );
      const { data } = await API.post(`/lectures/${id}/submit`, {
        answers: answerArray,
      });
      setResult(data);
    } catch (error) {
      console.error("Error submitting quiz:", error);
    }
  };

  if (!lecture)
    return <div className="flex justify-center p-8">Loading...</div>;

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-3xl font-bold mb-4">{lecture.title}</h1>

        {lecture.type === "reading" ? (
          <>
            <div className="prose max-w-none mb-6">
              <p className="whitespace-pre-wrap">{lecture.content}</p>
            </div>
            {user?.role === "student" && !result && (
              <button
                onClick={handleComplete}
                className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
              >
                Mark as Complete
              </button>
            )}
          </>
        ) : (
          <>
            {!result ? (
              <div className="space-y-6">
                {lecture.questions.map((question, qIndex) => (
                  <div key={qIndex} className="border-b pb-4">
                    <p className="font-semibold mb-3">
                      {qIndex + 1}. {question.questionText}
                    </p>
                    <div className="space-y-2">
                      {question.options.map((option, oIndex) => (
                        <label
                          key={oIndex}
                          className="flex items-center space-x-2 cursor-pointer"
                        >
                          <input
                            type="radio"
                            name={`question-${qIndex}`}
                            value={oIndex}
                            onChange={() =>
                              setAnswers({ ...answers, [qIndex]: oIndex })
                            }
                            className="w-4 h-4"
                          />
                          <span>{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
                <button
                  onClick={handleQuizSubmit}
                  className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                >
                  Submit Quiz
                </button>
              </div>
            ) : (
              <div className="text-center">
                <div
                  className={`text-6xl mb-4 ${
                    result.passed ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {result.passed ? "✓" : "✗"}
                </div>
                <h2 className="text-2xl font-bold mb-2">
                  {result.passed ? "Passed!" : "Failed"}
                </h2>
                <p className="text-xl mb-4">
                  Score: {result.score.toFixed(0)}% ({result.correct}/
                  {result.total})
                </p>
                {result.passed ? (
                  <p className="text-gray-600 mb-6">
                    Great job! You can now move to the next lecture.
                  </p>
                ) : (
                  <p className="text-gray-600 mb-6">
                    You need at least 70% to pass. Try again!
                  </p>
                )}
                <button
                  onClick={() => navigate(`/course/${lecture.course}`)}
                  className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                >
                  Back to Course
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default LectureView;
