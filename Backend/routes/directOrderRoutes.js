// backend/routes/directOrderRoutes.js
const express = require("express");
const router = express.Router();

/**
 * Collection: direct_orders
 * Document shape:
 * {
 *   _id,
 *   uid: string,
 *   chatId: string,
 *   orderNo: string,              // e.g. "#C449D3"
 *   customerName: string,
 *   customerEmail: string,
 *   orderDate: "YYYY-MM-DD",
 *   status: string,               // "pending" | "paid" | ...
 *   type: "Direct",
 *   createdAt: ISO string,
 *   updatedAt: ISO string
 * }
 */

function col(req) {
  const db = req.app.get("db");
  if (!db) throw new Error("DB not ready");
  return db.collection("direct_orders");
}

function nowISO() {
  return new Date().toISOString();
}

function ymd(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

function randomHex6() {
  return Math.floor(Math.random() * 0xffffff)
    .toString(16)
    .padStart(6, "0")
    .toUpperCase();
}

function normalizeBody(body = {}) {
  return {
    uid: body.uid || "",
    chatId: body.chatId || body.chat_id || "",
    customerName:
      body.customerName || body.displayName || body.name || "—",
    customerEmail:
      (body.customerEmail || body.email || "").toLowerCase(),
    status: body.status || "",
  };
}

/**
 * POST /api/direct-orders/ensure
 * Body: { uid, chatId|chat_id, customerName?, customerEmail?, status? }
 * - Idempotent on (uid, chatId)
 * - Creates if none; updates missing basics if it exists
 */
router.post("/ensure", async (req, res) => {
  try {
    const { uid, chatId, customerName, customerEmail, status } = normalizeBody(req.body);

    if (!uid || !chatId) {
      return res
        .status(400)
        .json({ success: false, message: "uid and chatId are required" });
    }

    const C = col(req);
    const existing = await C.findOne({ uid, chatId });

    if (existing) {
      const $set = {
        updatedAt: nowISO(),
      };
      if (!existing.orderNo) $set.orderNo = "#" + randomHex6();
      if (!existing.orderDate) $set.orderDate = ymd();
      if (!existing.type) $set.type = "Direct";
      if (customerName && !existing.customerName) $set.customerName = customerName;
      if (customerEmail && !existing.customerEmail) $set.customerEmail = customerEmail;
      if (status) $set.status = status;

      if (Object.keys($set).length > 1) {
        await C.updateOne({ _id: existing._id }, { $set });
      }
      const fresh = await C.findOne({ _id: existing._id });
      return res.json({ success: true, action: "exists", data: fresh });
    }

    const doc = {
      uid,
      chatId,
      orderNo: "#" + randomHex6(),
      customerName: customerName || "—",
      customerEmail: customerEmail || "",
      orderDate: ymd(),
      status: status || "pending",
      type: "Direct",
      createdAt: nowISO(),
      updatedAt: nowISO(),
    };

    await C.insertOne(doc);
    const saved = await C.findOne({ uid, chatId });
    return res.json({ success: true, action: "insert", data: saved });
  } catch (e) {
    console.error("[direct-orders][POST /ensure] error:", e);
    return res.status(500).json({ success: false, message: "failed to ensure direct order" });
  }
});

/**
 * POST /api/direct-orders/create
 * Legacy alias of /ensure (more strict)
 * Body: { uid, chatId|chat_id, customerName?, customerEmail?, status? }
 */
router.post("/create", async (req, res) => {
  try {
    const { uid, chatId, customerName, customerEmail, status } = normalizeBody(req.body);
    if (!uid || !chatId) {
      return res
        .status(400)
        .json({ success: false, message: "uid and chatId are required" });
    }
    // Delegate to ensure
    req.body = { uid, chatId, customerName, customerEmail, status };
    return router.handle({ ...req, url: "/ensure", method: "POST" }, res);
  } catch (e) {
    console.error("[direct-orders][POST /create] error:", e);
    return res.status(500).json({ success: false, message: "failed to create direct order" });
  }
});

/**
 * GET /api/direct-orders/list?uid=...&search=...&page=1&pageSize=20
 * Returns: { success, data: [], total, page, pageSize }
 */
router.get("/list", async (req, res) => {
  try {
    const { uid = "", search = "", page = "1", pageSize = "20" } = req.query || {};
    if (!uid) {
      return res.status(400).json({ success: false, message: "uid is required" });
    }

    const p = Math.max(1, parseInt(page, 10) || 1);
    const ps = Math.min(100, Math.max(1, parseInt(pageSize, 10) || 20));

    const query = { uid };
    if (search) {
      const re = new RegExp(String(search).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      Object.assign(query, {
        $or: [
          { orderNo: re },
          { customerName: re },
          { status: re },
          { type: re },
        ],
      });
    }

    const C = col(req);
    const total = await C.countDocuments(query);
    const rows = await C.find(query)
      .sort({ createdAt: -1 })
      .skip((p - 1) * ps)
      .limit(ps)
      .toArray();

    const data = rows.map((r) => ({
      orderNo: r.orderNo,
      customerName: r.customerName,
      orderDate: r.orderDate,
      status: r.status || "pending",
      type: r.type || "Direct",
      chatId: r.chatId || "",
    }));

    return res.json({ success: true, data, total, page: p, pageSize: ps });
  } catch (e) {
    console.error("[direct-orders][GET /list] error:", e);
    return res.status(500).json({ success: false, message: "failed to list direct orders" });
  }
});

/**
 * GET /api/direct-orders/by-chat?uid=...&chatId=...
 */
router.get("/by-chat", async (req, res) => {
  try {
    const { uid = "", chatId = "" } = req.query || {};
    if (!uid || !chatId) {
      return res.status(400).json({ success: false, message: "uid and chatId required" });
    }
    const C = col(req);
    const doc = await C.findOne({ uid, chatId });
    return res.json({ success: true, data: doc || null });
  } catch (e) {
    console.error("[direct-orders][GET /by-chat] error:", e);
    return res.status(500).json({ success: false, message: "failed to fetch" });
  }
});

module.exports = router;
