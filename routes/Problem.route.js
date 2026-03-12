import express from "express";
import { getProblem } from "../controllers/Problem.controller.js";
const router = express.Router();

router.route("/:problemId").get(getProblem);

export default router;