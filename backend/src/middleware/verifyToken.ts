import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../types/user.js";

export interface AuthenticatedRequest extends Request {
  user?: User;
  csrfToken?: string;
}

const verifyToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  const token = req.cookies.token;

  if (!token) {
    return res
      .status(401)
      .json({ error: "Access denied. No token provided.", user: null });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
    const { iat, exp, ...payload } = decoded;

    req.user = payload.user;
    req.csrfToken = payload.csrfToken;

    next();
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ error: "Session expired. Please log in again.", user: null });
    }

    return res
      .status(403)
      .json({ error: "Invalid token. Authentication failed.", user: null });
  }
};

export default verifyToken;
