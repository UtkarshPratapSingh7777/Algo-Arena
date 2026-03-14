import mongoose from "mongoose";
import Problem from "../models/Problems.model.js";
import { generateTestCases } from "../utils/aiService.js";
import dotenv from "dotenv";
dotenv.config();

await mongoose.connect(process.env.MONGODB_URL);
console.log("Connected to DB");

const problems = await Problem.find({
    $or: [
        { visibleTestcases: { $exists: false } },
        { visibleTestcases: { $size: 0 } },
        { hiddenTestcases: { $exists: false } },
        { hiddenTestcases: { $size: 0 } },
    ]
});

console.log(`Found ${problems.length} problems without test cases`);

for (const p of problems) {
    console.log(`Generating for: ${p.title}`);
    try {
        const { visibleTestcases, hiddenTestcases } = await generateTestCases({
            title: p.title,
            description: p.description,
            input_format: "",
            output_format: "",
            constraints: p.constraints || "",
        });
        await sleep(14000);
        await Problem.findByIdAndUpdate(p._id, { visibleTestcases, hiddenTestcases });
        console.log(`Done: ${p.title}`);
    } catch (err) {
        console.error(`Failed for ${p.title}:`, err.message);
    }
}

console.log("All done");
await mongoose.disconnect();