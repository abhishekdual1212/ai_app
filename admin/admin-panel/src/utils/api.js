const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:3000';
const API_KEY  = import.meta.env.VITE_API_KEY  ?? '1234567890abcdef';

/** Fetch all users (uid, email, displayName, photoURL, createdAt, lastLoginAt). */
export async function fetchUsers() {
  const res = await fetch(`${API_BASE}/api/admin/users`, {
    headers: { 'x-api-key': API_KEY },
  });
  if (!res.ok) throw new Error('Failed to load users');
  const data = await res.json();
  return Array.isArray(data?.data) ? data.data : [];
}

/** For a given Firebase uid, fetch all chats and return a Date of the newest. */
export async function fetchLastOrderAt(uid) {
  try {
    const res = await fetch(`${API_BASE}/api/dashboard/${uid}/all-chats`, {
      headers: { 'x-api-key': API_KEY },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data?.success) return null;

    const rows = Array.isArray(data.data) ? data.data.flat() : [];
    let maxTs = null;

    for (const row of rows) {
      const raw = row?.createdAt || row?.updatedAt || row?.timestamp;
      const ts = raw ? new Date(raw) : null;
      if (ts && !isNaN(ts)) {
        if (!maxTs || ts > maxTs) maxTs = ts;
      }
    }
    return maxTs;
  } catch {
    return null;
  }
}
