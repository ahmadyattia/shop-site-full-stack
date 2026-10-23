import express from "express";
import { getUsers, getUsersCount } from "../controllers/usersController.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

// users count for statistical purposes
router.get("/count", verifyToken, getUsersCount); // admin

// get users with limit and offset
router.get("/all", verifyToken, getUsers); // admin

export default router;
