import Contest from "../models/Contest.model.js";
import Problem from "../models/Problems.model.js";
import Submission from "../models/Submission.model.js";
import { submissionQueue } from "../queues/submissionQueue.js";
export const submitCode = async(req,res) => {
    try {
        const {problemId,contestId,code,language} = req.body;
        if(!problemId || !contestId || !code || !language){
            return res.status(400).json({
                message:"Missing required fields",
                success:false
            })
        }
        const lastSubmission = await Submission.findOne({
            user:req.userId,
            contest:contestId
        }).sort({submittedAt:-1});
        if(lastSubmission && (Date.now() - lastSubmission.submittedAt < 2000)){
            return res.status(429).json({
                message:"Submitting too fast",
                status : false
            })
        }
        const problem = await Problem.findById(problemId);
        const contest = await Contest.findById(contestId);
        if(Date.now() >= contest.endTime){
            return res.status(400).json({
                message : "Contest has Ended",
                success : false
            })
        }
        if(!problem){
            return res.status(404).json({
                message : "Problem Not Found",
                success : false
            })
        }
        if(!contest){
            return res.status(404).json({
                message : "Contest Does Not Exists",
                success : false
            })
        }
        if(!contest.problems.includes(problemId)){
            return res.status(400).json({
                message:"Problem not part of this contest",
                success:false
            })
        }
        if(contest.status === "finished"){
            return res.status(400).json({
                message : "Contest Has Ended",
                success : false
            })
        }
        if(contest.status === "waiting"){
            return res.status(400).json({
                message : "Contest Yet Not Started",
                success : false
            })
        }
        const now = new Date();
        const submission = await Submission.create({
            user : req.userId,
            contest : contestId,
            problem : problemId,
            code : code,
            language : language,
            verdict : "queued",
            submittedAt : now
        })
        await submissionQueue.add("judge",{
            submissionId : submission._id
        })
        return res.status(201).json({
            message : "Submission Created",
            success : true,
            submissionId : submission._id
        })
    } catch (error) {
        console.error(error);
        return res.status(400).json({
            message : "Some Error Occurred",
            status : false
        })
    }
}

export const getVerdict = async (req,res) => {
 try {
    const {submissionId} = req.params;
    const submission = await Submission.findById(submissionId);
    if(!submission){
        return res.status(404).json({
            message : "Submission does not exist",
            success : false
        })
    }
    if(submission.user.toString() !== req.userId){
        return res.status(403).json({
            message : "This is not your submission",
            success : false
        })
    }
    return res.status(200).json({
        success : true,
        verdict : submission.verdict
    })
 } catch (error) {
    console.error(error);
    return res.status(500).json({
        message : "Server Error",
        success : false
    })
 }
}

export const mySubmissions = async(req,res) => {
    try {
        const userId = req.userId;
        const submissions = await Submission.find({ user : userId });
        return res.status(200).josn({
            message : "Submissions Fetched",
            success : true,
            submissions
        })
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({
            message: "Server Error",
            success : false
      })
    }
}