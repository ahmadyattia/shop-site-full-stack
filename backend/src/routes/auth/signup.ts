import express from "express";
import { Request, Response } from "express";
import pool from "../../lib/db.js";
import {
  isValidEmail,
  validatePasswordStrength,
} from "../../services/validateSignupUtils.js";
import bcrypt from "bcrypt";

const router = express.Router();

router.post("/", async (req: Request, res: Response) => {
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
});

export default router;
