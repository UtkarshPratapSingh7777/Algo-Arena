import express from "express"
import { findUserByUsername, getUser, login, logout, register, updateProfile } from "../controllers/User.controller.js";
import { authenticate } from "../middleware/auth.js";
const router = express.Router()

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/logout").post(logout);
router.route("/find").get(authenticate, findUserByUsername)
router.route("/profile/update").put(authenticate , updateProfile);
router.route("/me").get(authenticate,getUser);

export default router;