// middlewares/apiKeyMiddleware.js
module.exports = function apiKeyMiddleware(req, res, next) {
  // open paths (no API key)
  const openPrefixes = [
    '/health',
    '/api-docs',
    '/api/user/profile-sync',
    '/api/userstart', // all subpaths GET/POST/PATCH for userstart
  ];

  const url = req.originalUrl || req.url || '';
  if (openPrefixes.some(p => url.startsWith(p))) {
    return next();
  }

  const key = req.headers['x-api-key'];
  const expected = process.env.API_KEY || process.env.VITE_API_KEY || '1234567890abcdef';
  if (!key || key !== expected) {
    return res.status(401).json({ success: false, message: 'Invalid or missing API key' });
  }
  next();
};
