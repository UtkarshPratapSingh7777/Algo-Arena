import axios from "axios";

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8001";

export async function generateProblems({ difficulty, topics, count }) {
    const { data } = await axios.post(`${AI_SERVICE_URL}/generate/problems`, {
        difficulty,
        tags: topics,
        count,
    });
    return data.problems;
}

export async function generateTestCases(problem) {
    const { data } = await axios.post(`${AI_SERVICE_URL}/generate/testcases`, {
        title: problem.title,
        description: problem.description,
        input_format: problem.input_format || "",
        output_format: problem.output_format || "",
        constraints: problem.constraints || "",
        count: 10,
    });

    const all = data.test_cases;
    return {
        visibleTestcases: all.slice(0, 3).map(tc => ({
            input: tc.input,
            output: tc.output,
        })),
        hiddenTestcases: all.slice(3).map(tc => ({
            input: tc.input,
            output: tc.output,
        })),
    };
}