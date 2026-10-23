import express from "express";
import { Response } from "express";
import verifyToken, {
  AuthenticatedRequest,
} from "../../middleware/verifyToken.js";

const router = express.Router();

router.get("/", verifyToken, (req: AuthenticatedRequest, res: Response) => {
  res.status(200).json({
    success: true,
    message: "The token is valid.",
    user: req.user,
    csrfToken: req.csrfToken,
  });
});

export default router;
