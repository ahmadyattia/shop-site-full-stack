import { Request, Response } from "express";
import pool from "../lib/db.js";

export const getUsersCount = async (req: Request, res: Response) => {
  const client = await pool.connect();

  try {
    // users count
    const queryResult = await client.query(
      `SELECT COUNT(id) AS count FROM users`,
    );

    const count: number = queryResult.rows[0].count;

    res.status(200).json({
      success: true,
      message: "Users count returned successfully.",
      count,
    });
  } catch (error) {
    console.error("Error returning users count:", error);
    res.status(500).json({
      success: false,
      error: "Unable to fetch users count from the database.",
    });
  } finally {
    client.release();
  }
};

export const getUsers = async (req: Request, res: Response) => {
  if (!req.query.page || !req.query.size)
    return res
      .status(400)
      .json({ success: false, error: "Missing query params." });

  const pageNumber = parseInt(req.query.page as string);
  const pageSize = parseInt(req.query.size as string);
  const offset = (pageNumber - 1) * pageSize;

  const client = await pool.connect();

  try {
    const queryResult = await client.query(
      "SELECT * FROM users LIMIT $1 OFFSET $2",
      [pageSize, offset],
    );

    const users = queryResult.rows;

    res.status(200).json({
      success: true,
      message: "Users fetched successfully.",
      users: users,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      error: "Unable to fetch users from the database.",
    });
  } finally {
    client.release();
  }
};
