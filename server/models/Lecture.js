import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: true,
  },
  options: [
    {
      type: String,
      required: true,
    },
  ],
  correctAnswer: {
    type: Number,
    required: true,
  },
});

const lectureSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["reading", "quiz"],
      required: true,
    },
    content: {
      type: String,
      required: function () {
        return this.type === "reading";
      },
    },
    questions: {
      type: [questionSchema],
      required: function () {
        return this.type === "quiz";
      },
    },
    order: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Lecture", lectureSchema);
