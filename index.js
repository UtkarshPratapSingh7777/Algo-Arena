import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"
import dotenv from "dotenv"
import userRoute from "./routes/User.route.js"
import contestRoute from "./routes/Contest.route.js"
import submissionRoute from "./routes/Submission.route.js"
import connectdb from "./utils/db.js";
import problemRoute from "./routes/Problem.route.js";
dotenv.config({});
const app = express();
// middleware
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());
const corsOptions = {
    origin : 'http://localhost:5173',
    credentials : true
};
app.use(cors(corsOptions));

const PORT = process.env.PORT || 3000;


// api's 

app.use("/api/v1/user", userRoute);
app.use("/api/v1/contest",contestRoute);
app.use("/api/v1/submission",submissionRoute);
app.use("/api/v1/problem",problemRoute);


connectdb().then(()=>{
    app.listen(PORT,()=>{
        console.log(`Server running at port ${PORT}`);
    })
})