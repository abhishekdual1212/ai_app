const express = require("express");
const router = express.Router();

// ----- Basic Auth gate (username/password) -----
const ADMIN_USER = process.env.ADMIN_USER || "shivam07";
const ADMIN_PASS = process.env.ADMIN_PASS || "tomar25";

router.use((req, res, next) => {
  try {
    const hdr = req.headers.authorization || "";
    if (!hdr.startsWith("Basic ")) {
      res.setHeader("WWW-Authenticate", 'Basic realm="Admin"');
      return res.status(401).json({ success: false, message: "Missing admin auth" });
    }
    const decoded = Buffer.from(hdr.slice(6), "base64").toString("utf8");
    const [u, p] = decoded.split(":");
    if (u !== ADMIN_USER || p !== ADMIN_PASS) {
      return res.status(403).json({ success: false, message: "Invalid credentials" });
    }
    next();
  } catch {
    return res.status(401).json({ success: false, message: "Auth error" });
  }
});

/** Lightweight credential check */
router.get("/ping", (req, res) => {
  return res.json({ success: true, message: "Admin auth OK" });
});

// ----- Best-effort Firebase Admin initialization -----
let adminSdk = null;
let firebaseReady = false;

try {
  adminSdk = require("firebase-admin");

  if (!adminSdk.apps?.length) {
    const svcJsonStr = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (svcJsonStr) {
      try {
        const svc = JSON.parse(svcJsonStr);
        adminSdk.initializeApp({
          credential: adminSdk.credential.cert(svc),
        });
        firebaseReady = true;
        console.log("[admin] Firebase Admin initialized from FIREBASE_SERVICE_ACCOUNT_JSON");
      } catch (e) {
        console.warn("[admin] Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON:", e.message);
      }
    }

    if (!firebaseReady) {
      try {
        adminSdk.initializeApp({
          credential: adminSdk.credential.applicationDefault(),
        });
        firebaseReady = true;
        console.log("[admin] Firebase Admin initialized with applicationDefault()");
      } catch (e) {
        console.warn("[admin] Failed applicationDefault init:", e.message);
      }
    }
  } else {
    firebaseReady = true;
  }
} catch (e) {
  console.warn("[admin] firebase-admin not available:", e.message);
  adminSdk = null;
  firebaseReady = false;
}

// ----- Utilities -----
async function getLatestChatMap(db) {
  const map = new Map();
  if (!db) return map;

  const touch = (uid, t) => {
    if (!uid || !t) return;
    const time = new Date(t).getTime();
    if (!Number.isFinite(time)) return;
    if (!map.has(uid) || time > map.get(uid)) map.set(uid, time);
  };

  try {
    const sessions = db.collection("sessions");
    const sDocs = await sessions
      .find({}, { projection: { user_id: 1, userId: 1, session_id: 1, updatedAt: 1, createdAt: 1, timestamp: 1 } })
      .sort({ updatedAt: -1 })
      .toArray();
    for (const s of sDocs) {
      const uid = s.user_id || s.userId || s.session_id || null;
      const t = s.updatedAt || s.createdAt || s.timestamp || null;
      touch(uid, t);
    }
  } catch {}

  try {
    const chats = db.collection("chats");
    const cDocs = await chats
      .find({}, { projection: { user_id: 1, userId: 1, updatedAt: 1, createdAt: 1, timestamp: 1 } })
      .toArray();
    for (const c of cDocs) {
      const uid = c.user_id || c.userId || null;
      const t = c.updatedAt || c.createdAt || c.timestamp || null;
      touch(uid, t);
    }
  } catch {}

  return map;
}

async function fetchUsersFromDb(db) {
  if (!db) return { users: [], note: "no-db" };

  try {
    const collNames = (await db.listCollections().toArray()).map((c) => c.name);
    const hasUsers = collNames.includes("users");
    if (!hasUsers) {
      return { users: [], note: "fallback: no 'users' collection" };
    }

    const latestMap = await getLatestChatMap(db);

    const docs = await db
      .collection("users")
      .find({}, { projection: { uid: 1, email: 1, displayName: 1, photoURL: 1, createdAt: 1, lastLoginAt: 1 } })
      .toArray();
    console.log('Fetched user documents from MongoDB "users" collection:', docs);

    const users = (docs || []).map((u) => ({
      uid: u.uid || u._id?.toString() || "",
      email: u.email || "",
      displayName: u.displayName || "",
      photoURL: u.photoURL || "",
      createdAt: u.createdAt || "",
      lastLoginAt: u.lastLoginAt || "",
      lastChatAt: Number(latestMap.get(u.uid) || 0),
    }));

    return { users, note: "fallback:db" };
  } catch (e) {
    console.warn("[admin] fetchUsersFromDb error:", e.message);
    return { users: [], note: "fallback:error" };
  }
}

// -------- USERS ----------
router.get("/users", async (req, res) => {
  const db = req.app.get("db");

  const q = String(req.query.q ?? "").trim().toLowerCase();
  const sort = (String(req.query.sort || "alpha") || "alpha").toLowerCase();
  const limit = Math.max(1, Math.min(1000, parseInt(req.query.limit || "200", 10) || 200));
  const offset = Math.max(0, parseInt(req.query.offset || "0", 10) || 0);

  let all = [];
  let note;

  if (firebaseReady && adminSdk?.auth) {
    try {
      const latestChatMap = await getLatestChatMap(db);
      let nextPageToken = undefined;
      do {
        const result = await adminSdk.auth().listUsers(1000, nextPageToken);
        console.log('Fetched user documents from Firebase:', result.users);
        for (const u of result.users) {
          all.push({
            uid: u.uid,
            email: u.email || "",
            displayName: u.displayName || "",
            photoURL: u.photoURL || "",
            createdAt: u.metadata?.creationTime || "",
            lastLoginAt: u.metadata?.lastSignInTime || "",
            lastChatAt: Number(latestChatMap.get(u.uid) || 0),
          });
        }
        nextPageToken = result.pageToken;
      } while (nextPageToken);
      note = "firebase";
    } catch (e) {
      console.warn("[admin] Firebase listUsers failed, falling back to DB:", e.message);
      const fb = await fetchUsersFromDb(db);
      all = fb.users;
      note = fb.note;
    }
  } else {
    const fb = await fetchUsersFromDb(db);
    all = fb.users;
    note = fb.note;
  }

  const filtered = q
    ? all.filter((u) => (u.displayName || "").toLowerCase().includes(q))
    : all;

  const alphaKey = (u) => (u.displayName || u.email || u.uid || "").toString().toLowerCase();
  if (sort === "lastupdated") {
    filtered.sort((a, b) => {
      const bt = Number(b.lastChatAt || 0);
      const at = Number(a.lastChatAt || 0);
      if (bt !== at) return bt - at; // newest first
      return alphaKey(a).localeCompare(alphaKey(b));
    });
  } else {
    filtered.sort((a, b) => alphaKey(a).localeCompare(alphaKey(b)));
  }

  const total = filtered.length;
  const page = filtered.slice(offset, offset + limit);

  return res.json({ success: true, data: page, total, note });
});

// -------- ORDERS (NEW) ----------
function normalizeCategory(input) {
  const raw = String(input || "").toLowerCase().trim();
  // Accept UI labels too
  if (raw.includes("startup")) return { ui: "DIY Startups", norm: "DIY_STARTUP", matches: ["diy_startup", "startup", "diy startups"] };
  if (raw.includes("direct")) return { ui: "Direct Orders", norm: "Direct", matches: ["direct", "direct orders"] };
  if (raw.includes("service") || raw === "intent") return { ui: "services", norm: "Intent", matches: ["intent", "service", "services"] };
  // default DIY Lawyer
  return { ui: "DIY Lawyer", norm: "DIY", matches: ["diy", "diy lawyer"] };
}

function toOrderNo(id) {
  const s = String(id || "");
  const clean = s.replace(/[^a-zA-Z0-9]/g, "");
  const tail = clean.slice(-6).toUpperCase().padStart(6, "0");
  return `#${tail}`;
}

function safeDate(d) {
  const t = new Date(d || Date.now());
  if (Number.isNaN(t.getTime())) return "";
  const y = t.getFullYear();
  const m = String(t.getMonth() + 1).padStart(2, "0");
  const day = String(t.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

router.get("/orders", async (req, res) => {
  try {
    const db = req.app.get("db");
    if (!db) return res.status(500).json({ success: false, message: "DB not ready" });

    const uid = String(req.query.uid || "").trim();
    if (!uid) return res.status(400).json({ success: false, message: "uid is required" });

    const cat = normalizeCategory(req.query.category || req.query.type || "DIY");
    const search = String(req.query.search || "").toLowerCase().trim();
    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const pageSize = Math.max(1, Math.min(100, parseInt(req.query.pageSize || "7", 10)));

    // Get a display name/email for rows
    let customerName = "";
    try {
      const uDoc = await db.collection("users").findOne({ $or: [{ uid }, { _id: uid }] });
      customerName = uDoc?.displayName || uDoc?.name || uDoc?.email || "";
    } catch {}

    const collNames = (await db.listCollections().toArray()).map((c) => c.name);

    // Accumulate rows here
    let rows = [];

    // Helper: push mapped row
    const pushRow = (doc, opts = {}) => {
      const type = opts.type || doc.type || doc.chatType || cat.norm;
      const id = doc.orderId || doc.order_no || doc.chat_id || doc.session_id || doc._id;
      const orderNo = doc.orderNo || toOrderNo(id);
      const name = customerName || doc.customerName || doc.name || doc.displayName || "";
      const date = doc.orderDate || doc.createdAt || doc.timestamp || doc.updatedAt || Date.now();
      const status = (doc.status || "pending").toString().toLowerCase();
      rows.push({
        orderNo,
        customerName: name || uid,
        orderDate: safeDate(date),
        status,
        type: type.toString().toLowerCase().includes("intent") ? "Intent"
          : type.toString().toLowerCase().includes("direct") ? "Direct"
          : type.toString().toLowerCase().includes("startup") ? "DIY"
          : "DIY",
        chatId: doc.chat_id || doc.session_id || String(doc._id || ""),
      });
    };

    // 1) Preferred: 'orders' collection
    if (collNames.includes("orders")) {
      const typeMatch = new RegExp(`^(${cat.matches.map((s) => s.replace(/\W+/g, "\\W*")).join("|")})$`, "i");
      const orderDocs = await db
        .collection("orders")
        .find({
          $and: [
            { $or: [{ user_id: uid }, { userId: uid }, { uid }] },
            { $or: [{ type: typeMatch }, { category: typeMatch }] },
          ],
        })
        .sort({ createdAt: -1, updatedAt: -1 })
        .toArray();

      for (const d of orderDocs) pushRow(d, { type: d.type || d.category || cat.norm });
    }

    // 2) Sessions as fallback (common for Intent/Direct/DIY flows)
    if (rows.length === 0 && collNames.includes("sessions")) {
      const sDocs = await db
        .collection("sessions")
        .find({ $or: [{ user_id: uid }, { userId: uid }] })
        .sort({ updatedAt: -1, createdAt: -1 })
        .toArray();

      for (const d of sDocs) {
        const t = (d.chatType || d.type || "").toString().toLowerCase();
        const isDIY = cat.norm === "DIY" && (t.includes("diy") || t.includes("lawyer"));
        const isStartup = cat.norm === "DIY_STARTUP" && (t.includes("startup") || t.includes("diy_startup"));
        const isIntent = cat.norm === "Intent" && (t.includes("intent") || t.includes("service"));
        const isDirect = cat.norm === "Direct" && t.includes("direct");
        if (isDIY || isStartup || isIntent || isDirect) pushRow(d, { type: d.chatType || d.type || cat.norm });
      }
    }

    // 3) Intents (if used to store service/intent orders)
    if (rows.length === 0 && collNames.includes("intents")) {
      const iDocs = await db
        .collection("intents")
        .find({ $or: [{ user_id: uid }, { userId: uid }] })
        .sort({ updatedAt: -1, createdAt: -1 })
        .toArray();
      for (const d of iDocs) {
        const t = (d.type || d.category || "").toString().toLowerCase();
        const isDIY = cat.norm === "DIY" && t.includes("diy");
        const isStartup = cat.norm === "DIY_STARTUP" && (t.includes("startup") || t.includes("diy_startup"));
        const isIntent = cat.norm === "Intent" && (t.includes("intent") || t.includes("service"));
        const isDirect = cat.norm === "Direct" && t.includes("direct");
        if (isDIY || isStartup || isIntent || isDirect) pushRow(d, { type: d.type || d.category || cat.norm });
      }
    }

    // Optional extra fallbacks: startup/diy collections if you store them separately
    if (rows.length === 0) {
      const tryColl = async (name) => {
        if (!collNames.includes(name)) return;
        const docs = await db
          .collection(name)
          .find({ $or: [{ user_id: uid }, { userId: uid }, { uid }] })
          .sort({ updatedAt: -1, createdAt: -1 })
          .toArray();
        for (const d of docs) pushRow(d, { type: d.type || cat.norm });
      };
      if (cat.norm === "DIY") await tryColl("diy");
      if (cat.norm === "DIY_STARTUP") await tryColl("startup");
    }

    // Filter (search on Order No, Customer, Status, Type)
    if (search) {
      const s = search;
      rows = rows.filter((r) => {
        return (
          (r.orderNo || "").toLowerCase().includes(s) ||
          (r.customerName || "").toLowerCase().includes(s) ||
          (r.status || "").toLowerCase().includes(s) ||
          (r.type || "").toLowerCase().includes(s)
        );
      });
    }

    // Sort newest first by date (like your FE)
    rows.sort((a, b) => (a.orderDate < b.orderDate ? 1 : a.orderDate > b.orderDate ? -1 : 0));

    // Pagination
    const total = rows.length;
    const start = (page - 1) * pageSize;
    const paged = rows.slice(start, start + pageSize);

    return res.json({
      success: true,
      data: paged,
      total,
      page,
      pageSize,
      user: { uid, name: customerName || uid },
      category: cat.norm,
    });
  } catch (e) {
    console.error("Admin /orders error:", e);
    return res.status(500).json({ success: false, message: "Failed to load orders" });
  }
});

module.exports = router;
