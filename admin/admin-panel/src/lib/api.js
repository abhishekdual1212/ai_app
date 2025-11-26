// admin-panel/src/lib/api.js
import axios from "axios";

export const API_BASE =
  import.meta.env.VITE_API_BASE || "http://localhost:3000";
export const API_KEY =
  import.meta.env.VITE_API_KEY || "1234567890abcdef";

// Build Authorization header from a stored base64 token
function authHeaderFromStorage() {
  const b64 = sessionStorage.getItem("admin_auth");
  return b64 ? `Basic ${b64}` : undefined;
}

/* ---------------------------------- AUTH ---------------------------------- */

export async function verifyAdminCredentials(username, password) {
  const auth = "Basic " + btoa(`${username}:${password}`);
  // Ping a protected route to validate Basic credentials.
  await axios.get(`${API_BASE}/api/admin/users?limit=1`, {
    headers: {
      "x-api-key": API_KEY,
      Authorization: auth,
    },
    withCredentials: false,
  });
  // If the request didn't throw, creds are valid.
  return { success: true, token: auth.replace("Basic ", "") };
}

export function signOutAdmin() {
  sessionStorage.removeItem("admin_auth");
  sessionStorage.removeItem("admin_user");
}

/* --------------------------------- USERS ---------------------------------- */

export async function getAdminUsers(params = {}) {
  const headers = { "x-api-key": API_KEY };
  const auth = authHeaderFromStorage();
  if (auth) headers.Authorization = auth;

  const res = await axios.get(`${API_BASE}/api/admin/users`, {
    headers,
    params, // { q, sort, limit, offset }
    withCredentials: false,
  });
  // { success, data: [...], total?, note? }
  return res.data;
}

/* ------------ userstart profile (NEW helpers, safe, non-breaking) ---------- */

/** Get the userstart profile stored in abyd.userstart by userid (Firebase UID). */
export async function getUserStartById(userid) {
  const headers = { "x-api-key": API_KEY };
  const auth = authHeaderFromStorage();
  if (auth) headers.Authorization = auth;

  const res = await axios.get(`${API_BASE}/api/userstart/${encodeURIComponent(userid)}`, {
    headers,
    withCredentials: false,
  });
  console.log('Data fetched from /api/userstart/:userid:', res.data);
  return res.data; // { success, data }
}

/** Patch brandname/phone for a userid. */
export async function patchUserStart(userid, payload = {}) {
  const headers = { "x-api-key": API_KEY, "Content-Type": "application/json" };
  const auth = authHeaderFromStorage();
  if (auth) headers.Authorization = auth;

  const res = await axios.patch(
    `${API_BASE}/api/userstart/${encodeURIComponent(userid)}`,
    payload,
    { headers, withCredentials: false }
  );
  return res.data; // { success, data }
}

/* -------------------------------- ORDERS ---------------------------------- */
/**
 * Get a paginated list of orders for a user.
 * kind = "diy" | "startup" | "intent" | "direct"
 * params: { uid, kind, q="", page=1, pageSize=7, sort="recent" }
 * returns: { success, data, total, page, pageSize }
 */
export async function getAdminOrders({
  uid,
  kind,
  q = "",
  page = 1,
  pageSize = 7,
  sort = "recent",
} = {}) {
  const headers = { "x-api-key": API_KEY };
  const auth = authHeaderFromStorage();
  if (auth) headers.Authorization = auth;

  const res = await axios.get(`${API_BASE}/api/admin/orders`, {
    headers,
    params: { uid, kind, q, page, pageSize, sort },
    withCredentials: false,
  });
  return res.data;
}

/** Alias used by some screens (e.g., Orders.jsx expects this name). */
export function getUserOrders(opts) {
  return getAdminOrders(opts);
}

/** Convenience wrappers (optional, some components prefer them) */
export function getDIYOrders({ uid, ...rest }) {
  return getAdminOrders({ uid, kind: "diy", ...rest });
}
export function getStartupOrders({ uid, ...rest }) {
  return getAdminOrders({ uid, kind: "startup", ...rest });
}
export function getIntentOrders({ uid, ...rest }) {
  return getAdminOrders({ uid, kind: "intent", ...rest });
}
export function getDirectOrders({ uid, ...rest }) {
  return getAdminOrders({ uid, kind: "direct", ...rest });
}

/* ------------------------------ ORDER DETAIL ------------------------------ */
/**
 * Get a single order detail.
 * params: { uid, kind, orderId }
 * returns: { success, data }
 */
export async function getAdminOrderDetail({ uid, kind, orderId }) {
  const headers = { "x-api-key": API_KEY };
  const auth = authHeaderFromStorage();
  if (auth) headers.Authorization = auth;

  try {
    const res = await axios.get(
      `${API_BASE}/api/admin/orders/${encodeURIComponent(orderId)}`,
      {
        headers,
        params: { uid, kind },
        withCredentials: false,
      }
    );
    return res.data; // { success, data: {...} }
  } catch (err) {
    // Fallback: try to find the order from a list call if detail endpoint
    // isn’t available yet on your backend.
    try {
      const list = await getAdminOrders({
        uid,
        kind,
        q: String(orderId),
        page: 1,
        pageSize: 50,
      });
      const hit =
        list?.data?.find(
          (o) =>
            String(o.orderId || o._id || o.id) === String(orderId) ||
            String(o.orderNo || o.order_no) === String(orderId)
        ) || null;
      return { success: !!hit, data: hit };
    } catch {
      throw err;
    }
  }
}
