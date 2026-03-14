import Submission from "../models/Submission.model.js";
import Problem from "../models/Problems.model.js";
import connectdb from "../utils/db.js";
import dotenv from "dotenv";
dotenv.config({});
await connectdb();
import { runCode } from "../utils/runCode.js";
import Contest from "../models/Contest.model.js";
import { Worker } from "bullmq";
import IORedis from "ioredis";

const connection = new IORedis({
    maxRetriesPerRequest: null
});

async function runCodeandUpdate(submissionId) {
    try {
        const submission = await Submission.findById(submissionId);
        if (!submission) return;
        submission.verdict = "running";
        await submission.save();
        const problem = await Problem.findById(submission.problem);
        let verdict = "accepted";
        for (const tc of problem.hiddenTestcases) {
            console.log("Running testcase:", tc.input);
            const output = await runCode(submission.code, tc.input);
            console.log("Program output:", output);
            if (output.trim() !== tc.output.trim()) {
                verdict = "wrong-answer";
                break;
            }
        }
        if (verdict === "accepted") {
            const contest = await Contest.findById(submission.contest);
            const entry = contest.leaderboard.find(
                e => e.user.toString() === submission.user.toString()
            );
            if (!entry || !entry.solvedProblems.some(id => id.toString() === submission.problem.toString())) {
                entry.solved += 1;
                entry.score += 100;
                const penaltyTime = Math.floor(
                    (Date.now() - contest.startTime) / 1000
                );
                entry.penalty += penaltyTime;
                entry.solvedProblems.push(submission.problem);
            }
            await contest.save();
        }
        submission.verdict = verdict;
        await submission.save();
    } catch (error) {
        console.log(error);
    }
}

const worker = new Worker(
  "submissionQueue",
  async job => {
    const { submissionId } = job.data;
    await runCodeandUpdate(submissionId);
  },
  {
    connection,
    concurrency: 3,
    lockDuration: 120000,
    stalledInterval: 30000
  }
);
worker.on("failed", (job, err) => {
    console.log("Job failed:", job.id, err);
});