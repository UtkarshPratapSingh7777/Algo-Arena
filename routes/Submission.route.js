import express from "express";
import { authenticate } from "../middleware/auth.js";
import { getVerdict, submitCode, mySubmissions } from "../controllers/Submission.controller.js";
const router = express.Router();


router.route("/").post(authenticate,submitCode);
router.route("/:submissionId").post(authenticate,getVerdict)
router.route("/user").get(mySubmissions);



export default router;