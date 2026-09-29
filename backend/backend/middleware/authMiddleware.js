import { verifyJwtToken } from "../services/dbService.js";
function requireAdminAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ success: false, message: "Authorization required. Please log in as admin." });
    return;
  }
  const token = authHeader.split(" ")[1];
  const decoded = verifyJwtToken(token);
  if (!decoded) {
    res.status(403).json({ success: false, message: "Invalid or expired session. Please log in again." });
    return;
  }
  req.user = decoded;
  next();
}
export {
  requireAdminAuth
};
