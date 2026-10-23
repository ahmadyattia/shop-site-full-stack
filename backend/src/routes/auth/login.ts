import express from "express";
import { Request, Response } from "express";
import pool from "../../lib/db.js";
import bcrypt from "bcrypt";
import { User } from "../../types/user.js";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post("/", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const client = await pool.connect();

  try {
    const queryText = `SELECT * FROM users WHERE "email" = $1`;

    const queryResult = await client.query(queryText, [email]);
    const userData: User = queryResult.rows[0];

    if (queryResult.rowCount === 0) {
      return res
        .status(401)
        .json({ success: false, error: "User doesn't exist." });
    }

    const isCorrectPassword = await bcrypt.compare(password, userData.password);

    if (!isCorrectPassword) {
      return res
        .status(401)
        .json({ success: false, error: "Wrong password entered." });
    }

    const token = jwt.sign(
      {
        id: userData.id,
        first_name: userData.first_name,
        last_name: userData.last_name,
        email: userData.email,
        isAdmin: userData.is_admin,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: "20m" },
    );

    res.cookie("token", token, {
      httpOnly: true, // Prevents client-side JS from reading the cookie (blocks XSS)
      secure: process.env.NODE_ENV === "production", // Use true in production (requires HTTPS)
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // Protects against Cross-Site Request Forgery (CSRF)
      path: "/",
      maxAge: 20 * 60 * 1000, // 7 minutes
    });

    res.status(200).json({
      success: true,
      message: "User logged in successfully.",
      user: {
        id: userData.id,
        first_name: userData.first_name,
        last_name: userData.last_name,
        email: userData.email,
        isAdmin: userData.is_admin,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error });
    console.error(error);
  } finally {
    client.release();
  }
});

export default router;
