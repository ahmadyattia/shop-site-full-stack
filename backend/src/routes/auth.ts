import express from "express";
import {
  login,
  signup,
  deleteAccount,
  logout,
  me,
} from "../controllers/authController.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

router.post("/login", login);
router.post("/signup", signup);
router.delete("/delete-account", verifyToken, deleteAccount);
router.post("/logout", logout);
router.get("/me", verifyToken, me);
export default router;
