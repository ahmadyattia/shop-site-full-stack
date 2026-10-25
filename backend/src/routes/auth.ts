import express from "express";
import {
  login,
  signup,
  deleteAccount,
  logout,
  me,
  signupAdmin,
} from "../controllers/authController.js";
import verifyToken from "../middleware/verifyToken.js";
import { isAdmin } from "../middleware/isAdmin.js";

const router = express.Router();

router.post("/login", login);
router.post("/signup", signup);
// sign up an admin. Requires an admin authorization
router.post("/admin/signup", verifyToken, isAdmin, signupAdmin); // admin
router.delete("/delete-account", verifyToken, deleteAccount);
router.post("/logout", logout);
router.get("/me", verifyToken, me);
export default router;
