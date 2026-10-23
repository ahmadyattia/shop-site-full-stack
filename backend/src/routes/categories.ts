import express from "express";
import {
  getCategories,
  postCategory,
} from "../controllers/categoriesController.js";

const router = express.Router();

router.get("/", getCategories);
router.post("/", postCategory);

export default router;
