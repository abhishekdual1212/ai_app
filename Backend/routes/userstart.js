// routes/userstart.js
const express = require("express");
const router = express.Router();

/**
 * userstart collection schema (loose, enforced by code):
 * {
 *   _id,
 *   userid: string,                    // Firebase uid (renamed to userid)
 *   email: string,                     // normalized lowercased
 *   emailVerified: boolean,
 *   displayName: string,
 *   photoURL: string,
 *   providerData: array,
 *   creationTime: string,              // ISO
 *   lastSignInTime: string,            // ISO
 *   brandName: string,                 // optional
 *   phoneNumber: string,               // optional
 *   brandStatus: 0 | 1,                // 0 = missing, 1 = provided
 *   phoneStatus: 0 | 1,                // 0 = missing, 1 = provided
 *   createdAt: string,                 // ISO
 *   updatedAt: string,                 // ISO
 * }
 */

function col(req) {
  const db = req.app.get("db");
  if (!db) throw new Error("DB not ready");
  return db.collection("userstart");
}

function to01(v) {
  if (v === 1 || v === "1" || v === true || v === "true") return 1;
  return 0;
}

function nowISO() {
  return new Date().toISOString();
}

/**
 * GET /api/userstart
 * List (search + pagination)
 * query: q?, limit?, offset?
 */
router.get("/", async (req, res) => {
  try {
    const C = col(req);
    const q = String(req.query.q || "").trim();
    const limit = Math.max(1, Math.min(200, parseInt(req.query.limit || "50", 10)));
    const offset = Math.max(0, parseInt(req.query.offset || "0", 10));

    const filter = q
      ? {
          $or: [
            { userid: { $regex: q, $options: "i" } },
            { email: { $regex: q, $options: "i" } },
            { displayName: { $regex: q, $options: "i" } },
            { brandName: { $regex: q, $options: "i" } },
            { phoneNumber: { $regex: q, $options: "i" } },
          ],
        }
      : {};

    const cursor = C.find(filter).sort({ updatedAt: -1, createdAt: -1 }).skip(offset).limit(limit);
    const data = await cursor.toArray();
    const total = await C.countDocuments(filter);

    return res.json({ success: true, data, total, limit, offset });
  } catch (e) {
    console.error("[userstart][GET /] error:", e);
    return res.status(500).json({ success: false, message: "server error" });
  }
});

/**
 * POST /api/userstart/sync
 * Upsert from Firebase profile data on login.
 */
router.post("/sync", async (req, res) => {
  try {
    const {
      userid,
      email = "",
      emailVerified = false,
      displayName = "",
      photoURL = "",
      providerData = [],
      creationTime = "",
      lastSignInTime = "",
    } = req.body || {};

    if (!userid && !email) {
      return res.status(400).json({ success: false, message: "userid or email required" });
    }

    const C = col(req);
    const or = [];
    if (userid) or.push({ userid });
    if (email) or.push({ email: String(email).toLowerCase() });

    const now = nowISO();

    const setOnInsert = {
      createdAt: now,
      userid: userid || undefined,
      email: email ? String(email).toLowerCase() : "",
      brandName: "",
      phoneNumber: "",
      brandStatus: 0,
      phoneStatus: 0,
    };

    const $set = {
      email: email ? String(email).toLowerCase() : "",
      emailVerified: !!emailVerified,
      displayName,
      photoURL,
      providerData: Array.isArray(providerData) ? providerData : [],
      creationTime,
      lastSignInTime,
      updatedAt: now,
    };

    const result = await C.updateOne(
      { $or: or.length ? or : [{ userid: "__none__" }] },
      { $set, $setOnInsert: setOnInsert },
      { upsert: true }
    );

    return res.json({
      success: true,
      action: result.upsertedCount ? "insert" : "update",
    });
  } catch (e) {
    console.error("[userstart/sync] error:", e);
    return res.status(500).json({ success: false, message: "sync failed" });
  }
});

/**
 * GET /api/userstart/status?userid=...&email=...&autocreate=1
 */
router.get("/status", async (req, res) => {
  try {
    const { userid = "", email = "", autocreate = "1" } = req.query || {};
    if (!userid && !email) {
      return res
        .status(400)
        .json({ success: false, message: "userid or email is required" });
    }

    const C = col(req);
    const or = [];
    if (userid) or.push({ userid });
    if (email) or.push({ email: String(email).toLowerCase() });

    let doc = await C.findOne({ $or: or });

    if (!doc && autocreate !== "0") {
      const base = {
        userid: userid || undefined,
        email: email ? String(email).toLowerCase() : "",
        emailVerified: false,
        displayName: "",
        photoURL: "",
        providerData: [],
        creationTime: "",
        lastSignInTime: "",
        brandName: "",
        phoneNumber: "",
        brandStatus: 0,
        phoneStatus: 0,
        createdAt: nowISO(),
        updatedAt: nowISO(),
      };
      await C.insertOne(base);
      doc = await C.findOne({ $or: or });
    }

    if (!doc) {
      return res.status(404).json({ success: false, message: "not found" });
    }

    return res.json({ success: true, data: doc });
  } catch (e) {
    console.error("[userstart][GET /status] error:", e);
    return res
      .status(500)
      .json({ success: false, message: "failed to fetch status" });
  }
});

/**
 * POST /api/userstart/ensure
 * Ensure a row exists (insert if not; else update meta)
 */
router.post("/ensure", async (req, res) => {
  try {
    const {
      userid,
      email = "",
      emailVerified = false,
      displayName = "",
      photoURL = "",
      providerData = [],
      creationTime = "",
      lastSignInTime = "",
    } = req.body || {};

    if (!userid && !email) {
      return res
        .status(400)
        .json({ success: false, message: "userid or email is required" });
    }

    const C = col(req);
    const or = [];
    if (userid) or.push({ userid });
    if (email) or.push({ email: String(email).toLowerCase() });

    let doc = await C.findOne({ $or: or });
    if (!doc) {
      const base = {
        userid: userid || undefined,
        email: email ? String(email).toLowerCase() : "",
        emailVerified: !!emailVerified,
        displayName,
        photoURL,
        providerData,
        creationTime,
        lastSignInTime,
        brandName: "",
        phoneNumber: "",
        brandStatus: 0,
        phoneStatus: 0,
        createdAt: nowISO(),
        updatedAt: nowISO(),
      };
      await C.insertOne(base);
      doc = await C.findOne({ $or: or });
      return res.json({ success: true, action: "insert", data: doc });
    }

    const $set = {
      email: email ? String(email).toLowerCase() : doc.email || "",
      emailVerified: !!emailVerified,
      displayName,
      photoURL,
      providerData,
      creationTime,
      lastSignInTime,
      updatedAt: nowISO(),
    };
    await C.updateOne({ _id: doc._id }, { $set });
    const updated = await C.findOne({ _id: doc._id });

    return res.json({ success: true, action: "update", data: updated });
  } catch (e) {
    console.error("[userstart][POST /ensure] error:", e);
    return res
      .status(500)
      .json({ success: false, message: "failed to ensure" });
  }
});

/**
 * GET  /api/userstart/me?userid=... | ?email=...
 * PATCH /api/userstart/me?userid=... | ?email=... (body: { brandName?, phoneNumber? })
 */
router.get("/me", async (req, res) => {
  try {
    const { userid, email } = req.query || {};
    if (!userid && !email) {
      return res.status(400).json({ success: false, message: "userid or email required" });
    }
    const C = col(req);
    const query = userid ? { userid } : { email: (email || "").toLowerCase() };
    const doc = await C.findOne(query);
    return res.json({ success: true, data: doc || null });
  } catch (e) {
    console.error("[userstart/me] error:", e);
    return res.status(500).json({ success: false, message: "failed" });
  }
});

router.patch("/me", async (req, res) => {
  try {
    const { userid, email } = req.query || {};
    const { brandName, phoneNumber } = req.body || {};

    if (!userid && !email) {
      return res.status(400).json({ success: false, message: "userid or email required" });
    }
    if (typeof brandName === "undefined" && typeof phoneNumber === "undefined") {
      return res.status(400).json({ success: false, message: "nothing to update" });
    }

    const C = col(req);
    const query = userid ? { userid } : { email: (email || "").toLowerCase() };

    const doc = await C.findOne(query);
    if (!doc) {
      return res.status(404).json({ success: false, message: "userstart row not found" });
    }

    const $set = { updatedAt: nowISO() };
    if (typeof brandName !== "undefined") {
      $set.brandName = brandName;
      $set.brandStatus = brandName && String(brandName).trim() ? 1 : 0;
    }
    if (typeof phoneNumber !== "undefined") {
      $set.phoneNumber = phoneNumber;
      $set.phoneStatus = phoneNumber && String(phoneNumber).trim() ? 1 : 0;
    }

    await C.updateOne({ _id: doc._id }, { $set });
    const fresh = await C.findOne({ _id: doc._id });

    return res.json({ success: true, data: fresh });
  } catch (e) {
    console.error("[userstart/me:patch] error:", e);
    return res.status(500).json({ success: false, message: "update failed" });
  }
});

/**
 * PATCH /api/userstart/:userid
 * Accepts canonical fields and aliases (brandname, phone)
 */
router.patch("/:userid", async (req, res) => {
  try {
    const { userid } = req.params;
    if (!userid) {
      return res.status(400).json({ success: false, message: "userid required" });
    }

    // accept aliases
    const body = { ...req.body };
    if (typeof body.brandname !== "undefined" && typeof body.brandName === "undefined") {
      body.brandName = body.brandname;
    }
    if (typeof body.phone !== "undefined" && typeof body.phoneNumber === "undefined") {
      body.phoneNumber = body.phone;
    }

    const {
      brandName,
      phoneNumber,
      brandStatus,
      phoneStatus,
      email,
      emailVerified,
      displayName,
      photoURL,
      providerData,
      creationTime,
      lastSignInTime,
    } = body;

    const C = col(req);
    const doc = await C.findOne({ userid });
    if (!doc) {
      return res.status(404).json({ success: false, message: "not found" });
    }

    const $set = { updatedAt: nowISO() };

    // Optional meta updates
    if (typeof email !== "undefined") $set.email = String(email).toLowerCase();
    if (typeof emailVerified !== "undefined") $set.emailVerified = !!emailVerified;
    if (typeof displayName !== "undefined") $set.displayName = displayName || "";
    if (typeof photoURL !== "undefined") $set.photoURL = photoURL || "";
    if (typeof providerData !== "undefined") $set.providerData = providerData || [];
    if (typeof creationTime !== "undefined") $set.creationTime = creationTime || "";
    if (typeof lastSignInTime !== "undefined") $set.lastSignInTime = lastSignInTime || "";

    // Brand/Phone values
    if (typeof brandName !== "undefined") $set.brandName = brandName || "";
    if (typeof phoneNumber !== "undefined") $set.phoneNumber = phoneNumber || "";

    // Status logic
    if (typeof brandStatus !== "undefined") {
      $set.brandStatus = to01(brandStatus);
    } else if (typeof brandName !== "undefined") {
      $set.brandStatus = brandName && String(brandName).trim() ? 1 : 0;
    }

    if (typeof phoneStatus !== "undefined") {
      $set.phoneStatus = to01(phoneStatus);
    } else if (typeof phoneNumber !== "undefined") {
      $set.phoneStatus = phoneNumber && String(phoneNumber).trim() ? 1 : 0;
    }

    await C.updateOne({ userid }, { $set });
    const updated = await C.findOne({ userid });

    return res.json({ success: true, data: updated });
  } catch (e) {
    console.error("[userstart][PATCH /:userid] error:", e);
    return res
      .status(500)
      .json({ success: false, message: "failed to update" });
  }
});

/**
 * GET /api/userstart/:userid
 * Keep AFTER the literal routes above (/sync, /status, /ensure, /me)
 */
router.get("/:userid", async (req, res) => {
  try {
    const { userid } = req.params;
    if (!userid) {
      return res.status(400).json({ success: false, message: "userid required" });
    }
    const C = col(req);
    const doc = await C.findOne({ userid });
    if (!doc) return res.status(404).json({ success: false, message: "not found" });
    return res.json({ success: true, data: doc });
  } catch (e) {
    console.error("[userstart][GET /:userid] error:", e);
    return res.status(500).json({ success: false, message: "server error" });
  }
});

module.exports = router;
