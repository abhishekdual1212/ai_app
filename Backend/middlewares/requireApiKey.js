// backend/middleware/requireApiKey.js
module.exports = function requireApiKey(req, res, next) {
  const hdr = req.header("x-api-key");
  const cfg = process.env.API_KEY || "1234567890abcdef"; // default for local
  if (!hdr || hdr !== cfg) {
    return res.status(401).json({ success: false, error: "Unauthorized" });
  }
  next();
};
