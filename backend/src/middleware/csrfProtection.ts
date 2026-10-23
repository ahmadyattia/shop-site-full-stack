import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./verifyToken.js";
import { verifyCsrfToken } from "../services/verifyCsrfToken.js";

export const csrfProtection = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  const method = req.method;

  const safeMethods = ["GET", "OPTIONS", "HEAD"];

  if (safeMethods.includes(method)) return next();

  const csrfToken = req.headers["x-csrf-token"];

  console.log("Token", csrfToken);

  if (!csrfToken || !verifyCsrfToken(req, csrfToken as string)) {
    return res.status(403).json({ error: "Invalid CSRF token." });
  }

  return next();
};
