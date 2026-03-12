import mongoose from "mongoose";

const problemSchema = new mongoose.Schema(
  {
    title: String,
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
    },
    topics: [String],
    description: String,
    constraints: String,
    starterCode: String,
    visibleTestcases: [
      {
        input: String,
        output: String,
      },
    ],
    hiddenTestcases: [
      {
        input: String,
        output: String,
      },
    ],
  },
  { timestamps: true },
);
const Problem = mongoose.model("Problem",problemSchema);
export default Problem;
