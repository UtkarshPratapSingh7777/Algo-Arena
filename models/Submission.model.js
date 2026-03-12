// import { Subscript } from "lucide-react";
import mongoose from "mongoose";
const submissionSchema = new mongoose.Schema({
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required : true
    },
    contest : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Contest",
        required : true
    },
    problem : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Problem",
        required : true
    },
    code : {
        type : String,
        required : true
    },
    language : {
        type : String,
        req : true
    },
    verdict : {
        type : String,
        enum : ["accepted","wrong-answer","time-limit-exceeded","runtime-error","queued","running"]
    },
    submittedAt : {
        type : Date,
        default : Date.now
    }
})
const Submission = mongoose.model("Submission",submissionSchema)
export default Submission