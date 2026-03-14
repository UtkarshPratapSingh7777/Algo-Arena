import mongoose from "mongoose";
import Problem from "../models/Problems.model.js";
import { generateTestCases } from "../utils/aiService.js";
import dotenv from "dotenv";
dotenv.config();

await mongoose.connect(process.env.MONGO_URI);

const changeStream = Problem.watch([
    { $match: { operationType: "insert" } },
]);

changeStream.on("change", async (change) => {
    const p = change.fullDocument;

    if (p.visibleTestcases?.length > 0 || p.hiddenTestcases?.length > 0) return;

    try {
        const { visibleTestcases, hiddenTestcases } = await generateTestCases({
            title: p.title,
            description: p.description,
            input_format: "",
            output_format: "",
            constraints: p.constraints || "",
        });

        await Problem.findByIdAndUpdate(p._id, { visibleTestcases, hiddenTestcases });
    } catch (err) {
        console.error(err.message);
    }
});
```

---

### 🔟 Add to your existing `.env` (Node)
```
AI_SERVICE_URL="http://localhost:8000"