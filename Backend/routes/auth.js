// routes/auth.js
const express = require('express');
const router = express.Router();
const {
  signAccess,
  signRefresh,
  signUrlToken,
  verifyAccess,
  verifyRefresh,
  verifyUrlToken,
  setAuthCookies,
  clearAuthCookies,
} = require('../middlewares/auth');

/**
 * POST /api/auth/url-login
 * Body: { userid, username }
 * Returns a short-lived "sid" for client route /:sid/(explore|dashboard)
 */
router.post('/url-login', async (req, res) => {
  try {
    const { userid, username } = req.body || {};
    if (!userid || !username) {
      return res.status(400).json({ success: false, message: 'userid and username are required' });
    }
    const sid = signUrlToken({ userid, username });
    return res.json({
      success: true,
      sid,
      redirectExplore: `/${encodeURIComponent(sid)}/explore`,
      redirectDashboard: `/${encodeURIComponent(sid)}/dashboard`,
    });
  } catch (e) {
    console.error('[auth/url-login] error:', e);
    return res.status(500).json({ success: false, message: 'failed to issue url token' });
  }
});

/**
 * GET /api/auth/consume/:sid?dest=explore|dashboard
 * Verifies "sid", sets httpOnly cookies, responds with { next }
 */
router.get('/consume/:sid', async (req, res) => {
  try {
    const { sid } = req.params;
    const dest = (req.query.dest || 'explore').toString();

    const decoded = verifyUrlToken(sid);
    const payload = {
      userid: decoded.userid || decoded.sub,
      username: decoded.username || 'user',
    };

    const access = signAccess(payload);
    const refresh = signRefresh(payload);
    setAuthCookies(res, access, refresh);

    const next = dest === 'dashboard' ? '/dashboard/order' : '/dashboard';
    return res.json({ success: true, next, user: payload });
  } catch (e) {
    console.error('[auth/consume] error:', e && (e.message || e));
    return res.status(400).json({ success: false, message: 'invalid or expired link' });
  }
});

/**
 * GET /api/auth/me
 * Returns { authenticated: boolean, userid?, username? }
 */
router.get('/me', (req, res) => {
  try {
    const at = req.cookies?.abyd_at;
    if (!at) return res.json({ authenticated: false });
    const decoded = verifyAccess(at);
    return res.json({
      authenticated: true,
      userid: decoded.userid,
      username: decoded.username,
    });
  } catch {
    return res.json({ authenticated: false });
  }
});

/**
 * POST /api/auth/refresh
 * If refresh cookie valid, issues a fresh access cookie.
 */
router.post('/refresh', (req, res) => {
  try {
    const rt = req.cookies?.abyd_rt;
    if (!rt) return res.status(401).json({ success: false, message: 'missing refresh' });
    const decoded = verifyRefresh(rt);
    const payload = { userid: decoded.userid || decoded.sub, username: decoded.username || 'user' };
    const access = signAccess(payload);
    setAuthCookies(res, access, rt); // rotate only access
    return res.json({ success: true });
  } catch (e) {
    return res.status(401).json({ success: false, message: 'invalid refresh' });
  }
});

/**
 * POST /api/auth/logout
 * Clears both cookies
 */
router.post('/logout', (req, res) => {
  clearAuthCookies(res);
  res.json({ success: true });
});

module.exports = router;
