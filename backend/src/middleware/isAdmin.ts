import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./verifyToken.js";

export const isAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user) {
    return res.status(401).json({ error: "User isn't logged in." });
  }

  if (!req.user.is_admin) {
    return res.status(403).json({ error: "User isn't an admin." });
  }
  return next();
};
