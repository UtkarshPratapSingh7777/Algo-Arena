import mongoose from "mongoose";
import contestHistorySchema from "./contestHistory.js";
const userschema = new mongoose.Schema({
    username : {
        type:String,
        required:[true,"Username is required"],
        minlength: [3, 'Username must be at least 3 characters'],
        maxlength: [30, 'Username cannot exceed 30 characters'],
        unique:true
    },
    name : {
        type:String,
        required:true,
    },
    email : {
        type:String,
        required:[true,"Email is required"],
        unique:true
    },
    password : {
        type:String,
        required:[true,"Password is required"],
    },
    rating : {
        type:Number,
        default:1200,
        min:[0,"Rating cannot be negative"]
    },
    contestHistory : [contestHistorySchema],
    friends : [{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
    }],
    stats : {
        contestsPlayed:{type:Number,default:0},
        problemsSolved:{type:Number,default:0},
        wins:{type:Number,default:0}
    },
},{timestamps:true});
const User=mongoose.model("User",userschema);
export default User;
