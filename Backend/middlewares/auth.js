// middlewares/auth.js
const jwt = require('jsonwebtoken');

const ACCESS_COOKIE = 'abyd_at';
const REFRESH_COOKIE = 'abyd_rt';

const ACCESS_TTL  = process.env.JWT_ACCESS_TTL  || '15m';
const REFRESH_TTL = process.env.JWT_REFRESH_TTL || '7d';
const URL_TTL     = process.env.JWT_URL_TTL     || '60s';

// Prefer split secrets; fall back to JWT_SECRET for compatibility
const ACCESS_SECRET  = process.env.JWT_ACCESS_SECRET  || process.env.JWT_SECRET || 'dev_access_secret_change_me';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'dev_refresh_secret_change_me';
const URL_SECRET     = process.env.JWT_URL_SECRET     || process.env.JWT_SECRET || 'dev_url_secret_change_me';

const COOKIE_SECURE = String(process.env.COOKIE_SECURE || '0') === '1';

function signAccess(payload) {
  // Do NOT put "sub" inside payload; we set it via options.subject
  const clean = { userid: payload.userid, username: payload.username };
  return jwt.sign(clean, ACCESS_SECRET, {
    expiresIn: ACCESS_TTL,
    issuer: 'abyd',
    audience: 'web',
    subject: payload.userid,
  });
}

function signRefresh(payload) {
  const clean = { userid: payload.userid, username: payload.username };
  return jwt.sign(clean, REFRESH_SECRET, {
    expiresIn: REFRESH_TTL,
    issuer: 'abyd',
    audience: 'web',
    subject: payload.userid,
  });
}

function signUrlToken(payload) {
  const clean = { userid: payload.userid, username: payload.username };
  return jwt.sign(clean, URL_SECRET, {
    expiresIn: URL_TTL,
    issuer: 'abyd',
    audience: 'url',
    subject: payload.userid,
  });
}

function verifyAccess(token)   { return jwt.verify(token, ACCESS_SECRET); }
function verifyRefresh(token)  { return jwt.verify(token, REFRESH_SECRET); }
function verifyUrlToken(token) { return jwt.verify(token, URL_SECRET); }

function setAuthCookies(res, access, refresh) {
  const common = {
    httpOnly: true,
    sameSite: 'lax',     // SPA-friendly + safe for top-level navigations
    secure: COOKIE_SECURE,
    path: '/',
  };
  // Access (~15m)
  res.cookie(ACCESS_COOKIE, access,  { ...common, maxAge: 1000 * 60 * 15 });
  // Refresh (~7d)
  res.cookie(REFRESH_COOKIE, refresh, { ...common, maxAge: 1000 * 60 * 60 * 24 * 7 });
}

function clearAuthCookies(res) {
  const opts = { httpOnly: true, sameSite: 'lax', secure: COOKIE_SECURE, path: '/' };
  res.clearCookie(ACCESS_COOKIE, opts);
  res.clearCookie(REFRESH_COOKIE, opts);
}

function requireAuth(req, res, next) {
  const bearer = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  const cookieToken = req.cookies?.[ACCESS_COOKIE];
  const token = bearer || cookieToken;
  if (!token) return res.status(401).json({ success: false, message: 'Not authenticated' });
  try {
    const decoded = verifyAccess(token);
    req.user = { userid: decoded.userid, username: decoded.username };
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid/expired token' });
  }
}

module.exports = {
  signAccess,
  signRefresh,
  signUrlToken,
  verifyAccess,
  verifyRefresh,
  verifyUrlToken,
  setAuthCookies,
  clearAuthCookies,
  requireAuth,
  ACCESS_COOKIE,
  REFRESH_COOKIE,
};
