// routes/userProfileSync.js
const express = require("express");
const router = express.Router();

/**
 * Upsert into legacy 'users' and mirror into new 'userstart' collection.
 * OPEN endpoint (no x-api-key) so FE can call this right after Firebase login.
 *
 * Body:
 * {
 *   uid,                           // -> stored as userid in userstart, uid in users
 *   email, emailVerified,
 *   displayName, photoURL,
 *   providerData,                  // array
 *   metadata: { creationTime, lastSignInTime }
 * }
 */
router.post("/user/profile-sync", async (req, res) => {
  try {
    const db = req.app.get("db");
    if (!db) return res.status(500).json({ success: false, message: "DB not ready" });

    const body = req.body || {};
    const {
      uid,
      email = "",
      emailVerified = false,
      displayName = "",
      photoURL = "",
      providerData = [],
      metadata = {},
    } = body;

    if (!uid && !email) {
      return res.status(400).json({ success: false, message: "uid or email is required" });
    }

    const creationTime = metadata?.creationTime || body.creationTime || "";
    const lastSignInTime = metadata?.lastSignInTime || body.lastSignInTime || "";

    const normalizedEmail = email ? String(email).toLowerCase() : "";

    const usersCol = db.collection("users");
    const userstartCol = db.collection("userstart");

    /* ---------------------- legacy 'users' upsert (non-breaking) ---------------------- */
    const usersMatch = [];
    if (uid) usersMatch.push({ uid });
    if (normalizedEmail) usersMatch.push({ email: normalizedEmail });

    const usersExisting = usersMatch.length
      ? await usersCol.find({ $or: usersMatch }).toArray()
      : [];

    const usersSet = {
      email: normalizedEmail,
      displayName,
      photoURL,
      lastLoginAt: lastSignInTime,
      updatedAt: new Date().toISOString(),
    };

    if (usersExisting.length === 0) {
      await usersCol.insertOne({
        uid: uid || undefined,
        email: normalizedEmail,
        displayName,
        photoURL,
        createdAt: creationTime || new Date().toISOString(),
        lastLoginAt: lastSignInTime || "",
        updatedAt: usersSet.updatedAt,
      });
    } else {
      const bulk = usersCol.initializeUnorderedBulkOp();
      for (const doc of usersExisting) {
        bulk.find({ _id: doc._id }).updateOne({ $set: usersSet });
      }
      for (const doc of usersExisting) {
        if (!doc.uid && uid) {
          bulk.find({ _id: doc._id }).updateOne({ $set: { uid } });
        }
      }
      await bulk.execute();
    }

    /* -------------------------- mirror to 'userstart' -------------------------- */
    const userstartFilter = uid
      ? { userid: uid }
      : { email: normalizedEmail || "__no_email__" };

    const userstartUpdate = {
      $setOnInsert: {
        createdAt: creationTime || new Date().toISOString(),
      },
      $set: {
        userid: uid || undefined,
        email: normalizedEmail,
        emailVerified: !!emailVerified,
        displayName,
        photoURL,
        providerData: Array.isArray(providerData) ? providerData : [],
        creationTime: creationTime || "",
        lastSignInTime: lastSignInTime || "",
        // optional fields may be absent; do not overwrite if already present
        updatedAt: new Date().toISOString(),
      },
    };

    const up = await userstartCol.findOneAndUpdate(
      userstartFilter,
      userstartUpdate,
      { upsert: true, returnDocument: "after" }
    );

    return res.json({
      success: true,
      data: {
        userstart: up?.value || null,
      },
    });
  } catch (e) {
    console.error("[profile-sync] error:", e);
    return res.status(500).json({ success: false, message: "profile sync failed" });
  }
});

module.exports = router;
