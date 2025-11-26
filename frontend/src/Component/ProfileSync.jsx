// src/Component/ProfileSync.jsx
import { useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const API_BASE = "http://localhost:3000";
const API_HEADERS = { "x-api-key": "1234567890abcdef", "Content-Type": "application/json" };

/**
 * Mount once at the top of the app. It:
 *  - Keeps localStorage.userPhotoURL in sync with Firebase auth
 *  - Posts profile to backend /api/user/profile-sync (for Admin panel fallback)
 */
export default function ProfileSync() {
  useEffect(() => {
    let unsub = () => {};
    try {
      const auth = getAuth();

      const push = async (u) => {
        if (!u) return;
        const payload = {
          uid: u.uid,
          email: u.email || "",
          displayName: u.displayName || "",
          photoURL: u.photoURL || "",
          createdAt: u.metadata?.creationTime || "",
          lastLoginAt: u.metadata?.lastSignInTime || "",
        };

        // Save photo for FE usage (chat bubbles etc.)
        if (payload.photoURL) {
          localStorage.setItem("userPhotoURL", payload.photoURL);
        }

        try {
          await fetch(`${API_BASE}/api/user/profile-sync`, {
            method: "POST",
            headers: API_HEADERS,
            body: JSON.stringify(payload),
          });
        } catch {
          // ignore network errors here; not critical to FE
        }
      };

      // Immediate
      if (auth?.currentUser) push(auth.currentUser);

      // Subscribe to changes
      unsub = onAuthStateChanged(auth, (u) => {
        if (u?.photoURL) localStorage.setItem("userPhotoURL", u.photoURL);
        push(u);
      });

      // Sync across tabs
      const onStorage = (e) => {
        if (e.key === "userPhotoURL") {
          // no-op: Admin reads from DB, FE chat reads from localStorage directly
        }
      };
      window.addEventListener("storage", onStorage);

      return () => {
        unsub && unsub();
        window.removeEventListener("storage", onStorage);
      };
    } catch {
      // Firebase not available in this scope; no-op
    }
  }, []);

  return null;
}
