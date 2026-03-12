import dotenv from "dotenv";
dotenv.config();

import Problem from "../models/Problems.model.js";
import connectdb from "../utils/db.js";

await connectdb();

const problems = await Problem.find();

for (let problem of problems) {

    if(problem.related_topics){
        const topics = problem.related_topics
            .split(",")
            .map(t => t.trim().toLowerCase());

        problem.topics = topics;
    } else {
        problem.topics = [];
    }

    if(problem.difficulty){
        problem.difficulty = problem.difficulty.toLowerCase();
    }

    await problem.save();
}

console.log("Dataset cleaned successfully");
process.exit();