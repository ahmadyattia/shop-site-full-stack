import { AuthenticatedRequest } from "../middleware/verifyToken.js";
import { User } from "../types/user.js";
import { Request, Response } from "express";
import pool from "../lib/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import {
  validatePasswordStrength,
  isValidEmail,
} from "../services/validateSignupUtils.js";

export const login = async (req: Request, res: Response) => {
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

    const csrfToken = crypto.randomBytes(32).toString("hex");

    const token = jwt.sign(
      {
        user: {
          id: userData.id,
          first_name: userData.first_name,
          last_name: userData.last_name,
          email: userData.email,
          isAdmin: userData.is_admin,
        },
        csrfToken: csrfToken,
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
      csrfToken,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error });
    console.error(error);
  } finally {
    client.release();
  }
};

export const signup = async (req: Request, res: Response) => {
  const { fName, lName, email, password, isAdmin } = req.body;

  // validate email format
  if (!isValidEmail(email)) {
    return res.status(400).json({
      success: false,
      error: "Invalid email format.",
    });
  }

  // validate password strength
  const { isValidPassword, errorsString, errors } =
    validatePasswordStrength(password);

  if (!isValidPassword) {
    return res.status(400).json({
      success: false,
      error: errorsString,
      passwordErrorsArray: errors,
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const client = await pool.connect();

  try {
    const queryText = "INSERT INTO users VALUES (DEFAULT, $1, $2, $3, $4, $5)";

    await client.query(queryText, [
      fName,
      lName,
      email,
      hashedPassword,
      isAdmin,
    ]);

    res
      .status(200)
      .json({ success: true, message: "User signed up successfully." });
  } catch (error: any) {
    // UNIQUE error
    if (error.code === "23505") {
      res
        .status(400)
        .json({ success: false, error: "Email already registered." });
    }

    // NOT NULL error
    if (error.code === "23502") {
      res.status(400).json({
        success: false,
        error: "Empty entries detected. Please fill out all the inputs.",
      });
    }

    // Exceeded characters' limit error
    if (error.code === "22001") {
      res.status(400).json({
        success: false,
        error:
          "One or more entries exceed(s) the maximum number of allowed characters (100 characters).",
      });
    }

    res.status(500).json({ success: false, error: error });
    console.error("Error signing the user up:", error);
  } finally {
    client.release();
  }
};

export const deleteAccount = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  const userId = req.user?.id;

  if (!userId) {
    return res
      .status(500)
      .json({ success: false, error: "Couldn't authenticate the user." });
  }

  const client = await pool.connect();

  try {
    await client.query(
      `
            DELETE FROM users
            WHERE id = $1
            `,
      [userId],
    );

    res.status(200).json({
      success: true,
      message: "Successfully deleted the user's account.",
    });
  } catch (error) {
    console.error("Error deleting the user's account:", error);

    res
      .status(500)
      .json({ success: false, error: "Couldn't delete the user's account." });
  } finally {
    client.release();
  }
};

export const me = (req: AuthenticatedRequest, res: Response) => {
  res.status(200).json({
    success: true,
    message: "The token is valid.",
    user: req.user,
    csrfToken: req.csrfToken,
  });
};
