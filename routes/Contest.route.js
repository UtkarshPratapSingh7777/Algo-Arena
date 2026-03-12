import express from "express"
import { authenticate } from "../middleware/auth.js";
import { addFriend,startContest, createContest, endContest, getContest , getLeaderboard, getMyContests} from "../controllers/Contest.controller.js";
const router = express.Router()
router.route("/my").get(authenticate, getMyContests)
router.route("/create").post(authenticate,createContest);
router.route("/addFriend").put(authenticate,addFriend);
router.route("/start/:contestId").post(authenticate,startContest);
router.route("/:contestId").get(authenticate,getContest);
router.route("/:contestId/leaderboard").get(authenticate,getLeaderboard);
router.route("/end/:contestId").post(authenticate,endContest);

export default router;