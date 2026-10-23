import { Request, Response } from "express";
import { Category } from "../types/category.js";
import insertCategory from "../services/insertCategory.js";
import pool from "../lib/db.js";

export const getCategories = async (req: Request, res: Response) => {
  const client = await pool.connect();

  try {
    const queryResult = await client.query("SELECT * FROM categories");
    const categories = queryResult.rows;

    res.status(200).json({ success: true, categories: categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ success: false, error: error });
  } finally {
    client.release();
  }
};

export const postCategory = async (req: Request, res: Response) => {
  const category: Category = req.body;

  try {
    const categoryId = await insertCategory(category);

    res
      .status(200)
      .json({ success: true, category: category, categoryId: categoryId });
  } catch (error) {
    res.status(500).json({ success: false, error: error });
  }
};
