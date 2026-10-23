import { AuthenticatedRequest } from "../middleware/verifyToken.js";

export const verifyCsrfToken = (
  req: AuthenticatedRequest,
  csrfToken: string,
) => {
  const sessionCsrfToken = req.csrfToken;
  if (!sessionCsrfToken || !csrfToken) return false;
  return sessionCsrfToken === csrfToken;
};
