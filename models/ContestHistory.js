import mongoose from "mongoose";
const contestHistorySchema = new mongoose.Schema({
    contestId : {
        type:mongoose.Schema.Types.ObjectId,
        ref:'Contest',
        required:true
    },
    contestName : {
        type:String,
        required:true
    },
    rank:{
        type:Number,
        default:null
    },
    score : {
        type:Number,
        default:0
    },
    participatedAt:{
        type:Date,
        default:Date.now
    }
})
export default contestHistorySchema