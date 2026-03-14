import Contest from "../models/Contest.model.js";
import Problem from "../models/Problems.model.js";
import Submission from "../models/Submission.model.js";
import User from "../models/User.model.js";
import { generateProblems, generateTestCases } from "../utils/aiService.js";

function shuffle(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

function findSimilarTopics(topics) {
    return topics;
}

async function generateAndSaveProblems(difficulty, topics, count) {
    if (count <= 0) return [];

    const aiProblems = await generateProblems({ difficulty, topics, count });
    const saved = [];

    for (const p of aiProblems) {
        const { visibleTestcases, hiddenTestcases } = await generateTestCases(p);

        const doc = await Problem.create({
            title: p.title,
            description: p.description,
            difficulty: p.difficulty,
            topics: p.tags,
            constraints: p.constraints,
            starterCode: p.starter_code,
            visibleTestcases,
            hiddenTestcases,
        });

        saved.push(doc);
    }

    return saved;
}

export const createContest = async (req, res) => {
    try {
        const { name, participants, topics, difficulty, number_of_questions, duration } = req.body;

        if (difficulty.length !== number_of_questions) {
            return res.status(400).json({ message: "Difficulty array mismatch" });
        }

        participants.push(req.userId);

        let easy_count = 0, medium_count = 0, hard_count = 0;
        for (const d of difficulty) {
            if (d === "easy") easy_count++;
            else if (d === "medium") medium_count++;
            else hard_count++;
        }

        let problemset = await Problem.find({ topics: { $in: topics } });
        let similar_topics = topics;
        let iterations = 100;

        while (iterations--) {
            problemset = await Problem.find({ topics: { $in: similar_topics } });
            if (problemset.length >= number_of_questions) break;
            similar_topics = findSimilarTopics(similar_topics);
        }

        let easyQuestions = problemset.filter(p => p.difficulty === "easy");
        let mediumQuestions = problemset.filter(p => p.difficulty === "medium");
        let hardQuestions = problemset.filter(p => p.difficulty === "hard");

        const easyNeeded = Math.max(0, easy_count - easyQuestions.length);
        const mediumNeeded = Math.max(0, medium_count - mediumQuestions.length);
        const hardNeeded = Math.max(0, hard_count - hardQuestions.length);

        if (easyNeeded + mediumNeeded + hardNeeded > 0) {
            const [newEasy, newMedium, newHard] = await Promise.all([
                generateAndSaveProblems("easy", topics, easyNeeded),
                generateAndSaveProblems("medium", topics, mediumNeeded),
                generateAndSaveProblems("hard", topics, hardNeeded),
            ]);

            easyQuestions = [...easyQuestions, ...newEasy];
            mediumQuestions = [...mediumQuestions, ...newMedium];
            hardQuestions = [...hardQuestions, ...newHard];
        }

        const selected = [
            ...shuffle(easyQuestions).slice(0, easy_count),
            ...shuffle(mediumQuestions).slice(0, medium_count),
            ...shuffle(hardQuestions).slice(0, hard_count),
        ];

        if (selected.length < number_of_questions) {
            return res.status(500).json({
                message: "Could not gather enough problems even after AI generation",
                success: false,
            });
        }

        const contest = await Contest.create({
            name,
            participants,
            topics,
            problems: selected.map(p => p._id),
            host: req.userId,
            status: "waiting",
            leaderboard: participants.map(user => ({ user, solved: 0, score: 0, penalty: 0 })),
            endTime: new Date(Date.now() + duration * 60000),
            startTime: Date.now(),
        });

        await contest.save();

        return res.status(201).json({ message: "Contest Created", success: true, contest });

    } catch (error) {
        console.log(error.message);
        return res.status(400).json({ message: "Some Error Occurred", success: false });
    }
};
export const addFriend = async (req, res) => {
    try {
        const { contestId, userId } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User does not exist", success: false })
        }

        const contest = await Contest.findById(contestId);
        if (!contest) {
            return res.status(404).json({ message: "Contest does not exist", success: false });
        }
        if (contest.participants.some(p => p.toString() === userId.toString())) {
            return res.status(400).json({ message: "User already in contest" });
        }
        if (contest.participants.length >= 10) {
            return res.status(400).json({ message: "Contest is full" });
        }

        contest.participants.push(userId)  // ← only this, remove the second assignment
        await contest.save();

        return res.status(200).json({ message: "Friend added to the contest", success: true })
    } catch (error) {
        return res.status(400).json({ message: "Some Error Occurred", success: false })
    }
}
export const getContest = async (req, res) => {
    try {
        const { contestId } = req.params;
        const contest = await Contest.findById(contestId)
            .populate("problems")
            .populate("participants", "username rating");
        if (!contest) {
            return res.status(404).json({
                message: "Contest not found"
            })
        }
        return res.status(200).json({
            success: true,
            contest
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
}

export const startContest = async (req, res) => {
    try {
        const { contestId } = req.params;
        const contest = await Contest.findById(contestId);
        if (!contest) {
            return res.status(404).json({
                message: "Contest not found"
            })
        }
        if (contest.participants.length < 2) {
            return res.status(400).json({
                message: "Insufficient Participants to Start",
                success: false
            })
        }
        contest.status = "running";
        const leaderboard = contest.participants.map(user => ({
            user,
            solved: 0,
            score: 0,
            penalty: 0
        }))
        contest.leaderboard = leaderboard;
        contest.startTime = new Date();
        await contest.save();
        res.status(200).json({
            success: true,
            message: "Contest started",
            contest
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server error"
        })
    }
}

export const getProblems = async (req, res) => {
    try {
        const { contestId } = req.params;
        const contest = await Contest.findById(contestId);
        if (!contest) {
            return res.status(404).json({
                message: "Contest Not found",
                success: false
            })
        }
        return res.status(200).json({
            message: "Problem Fetched",
            success: true,
            problems: contest.problems
        })
    } catch (error) {
        console.log(error.message)
        return res.status(400).json({
            message: "Some Error Occurred",
            status: false
        })
    }
}

export const getLeaderboard = async (req, res) => {
    try {
        const { contestId } = req.params;
        if (!contestId) {
            return res.status(404).json({
                message: "No such contest Exists",
                success: false
            })
        }
        const contest = await Contest.findById(contestId).populate("leaderboard.user", "username");
        const leaderboard = contest.leaderboard.sort(
            (a, b) => b.score - a.score || a.penalty - b.penalty
        )
        return res.status(200).json({
            message: "Leaderboard Fetched",
            success: true,
            leaderboard
        })

    } catch (error) {
        console.log(error.message);
        return res.status(500).json({
            message: "Server Error",
            success: false
        })
    }

}


export const endContest = async (req, res) => {
    try {
        const { contestId } = req.params;
        const contest = await Contest.findById(contestId);
        if (!contest) {
            return res.status(404).json({
                message: "Contest not found",
                success: false
            })
        }
        if (contest.host.toString() !== req.userId) {
            return res.status(403).json({
                message: "Only host can end contest",
                success: false
            })
        }
        contest.status = "finished";
        contest.endTime = new Date();
        await contest.save();
        res.json({
            success: true,
            message: "Contest ended"
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: "Server error" })
    }
}

export const getMyContests = async (req, res) => {
    try {
        const contests = await Contest.find({
            $or: [
                { host: req.userId },
                { participants: req.userId }
            ]
        }).populate('host', 'username').sort({ createdAt: -1 })
        return res.status(200).json({ contests })
    } catch (error) {
        res.status(500).json({ message: "Server error" })
    }
}