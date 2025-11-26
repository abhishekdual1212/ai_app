// src/utils/storageHygiene.js
/* Run once on app boot. Keeps sensitive stuff out of localStorage. */

// Keys we never want in localStorage
const BLOCKLIST = [
  /(^|:)token$/i,                 // token, access_token, idToken
  /^abyd_(at|rt)$/i,              // our HttpOnly cookie names (just in case)
  /^sid$/i,                       // any "sid"
  /^firebase:authUser/i,          // firebase auth snapshot (already cookie+memory)
];

// migrate sessionId to sessionStorage (not persistent)
(function migrateSessionId() {
  try {
    const sid = localStorage.getItem("sessionId");
    if (sid && !sessionStorage.getItem("sessionId")) {
      sessionStorage.setItem("sessionId", sid);
    }
    localStorage.removeItem("sessionId");
  } catch {}
})();

// scrub existing keys
(function scrubExisting() {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach((k) => {
      if (BLOCKLIST.some((rx) => rx.test(k))) {
        localStorage.removeItem(k);
        // eslint-disable-next-line no-console
        console.warn(`[storageHygiene] removed "${k}" from localStorage`);
      }
    });
  } catch {}
})();

// block future writes
(function hardenSetItem() {
  try {
    const orig = Storage.prototype.setItem;
    Storage.prototype.setItem = function (k, v) {
      try {
        if (BLOCKLIST.some((rx) => rx.test(String(k)))) {
          // eslint-disable-next-line no-console
          console.warn(`[storageHygiene] blocked setItem("${k}")`);
          return;
        }
      } catch {}
      return orig.apply(this, arguments);
    };
  } catch {}
})();
