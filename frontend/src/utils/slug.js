// src/utils/slug.js

// Kebab-case a display name
function kebab(s) {
  return String(s || 'user')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Small numeric-ish fingerprint from a string (3 chars)
function short3(s) {
  if (!s) return '000';
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return String(h % 1000).padStart(3, '0');
}

/**
 * Build a stable, human-friendly slug.
 * Example: `${short3(sessionId)}-${(userid||'').slice(-3)}-${kebab(username)}`
 * If sessionId isn’t available, we fallback to `xxx-${kebab(username)}` shape.
 */
export function userToSlug({ userid, username }, sessionId) {
  const name = kebab(username);
  const tail = String(userid || '').slice(-3) || 'usr';
  const s3 = short3(sessionId || '');
  // Have both (session + uid)? Use 3-part; else fall back to 2-part
  return sessionId ? `${s3}-${tail}-${name}` : `${tail}-${name}`;
}
