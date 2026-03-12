import mongoose from "mongoose";

const contestSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true
    },
    host : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required : true
    },
    participants : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : "User"
    }],
    topics : [String],
    problems : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : "Problem"
    }],
    leaderboard : [{
        user : {
            type : mongoose.Schema.Types.ObjectId,
            ref : "User"
        },
        score : {
            type : Number,
            default : 0
        },
        solved : {
            type : Number,
            default : 0
        },
        penalty : {
            type : Number,
            default : 0
        },
        solvedProblems : [{
            type : mongoose.Schema.Types.ObjectId,
            ref : "Problem"
        }]
    }],
    status : {
        type : String,
        enum : ["waiting","running","finished"],
        default : "waiting"
    },
    startTime : {
        type : Date
    },
    endTime : {
        type : Date
    }
},{timestamps : true})
const Contest = mongoose.model("Contest",contestSchema);
export default Contest;