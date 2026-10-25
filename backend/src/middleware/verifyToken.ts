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
  const adminToken = req.cookies.adminToken;
  const customerToken = req.cookies.customerToken;

  const origin = req.headers.origin || req.headers.referer;

  const adminOrigin = process.env.DASHBOARD_URL;
  const customerOrigin = process.env.FRONTEND_URL;

  if (customerToken && origin && origin.startsWith(adminOrigin as string)) {
    return res.status(401).json({ error: "Must provide an admin token." });
  }

  if (adminToken && origin && origin.startsWith(customerOrigin as string)) {
    return res.status(401).json({ error: "Must provide a customer token." });
  }

  const token = adminToken || customerToken;

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

// customer and admin token to separate logging in on customer and admin websites.
