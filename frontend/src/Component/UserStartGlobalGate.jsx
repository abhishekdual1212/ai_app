// src/Component/UserStartGlobalGate.jsx
import React, { useEffect, useMemo, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import UserStartPopup from "./dashboard/UserStartPopup.jsx";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";
const API_KEY = import.meta.env.VITE_API_KEY || "1234567890abcdef";

export default function UserStartGlobalGate() {
  const [authUser, setAuthUser] = useState(null);
  const [doc, setDoc] = useState(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const missing = useMemo(() => {
    const brandMissing = !doc || Number(doc.brandStatus || 0) !== 1;
    const phoneMissing = !doc || Number(doc.phoneStatus || 0) !== 1;
    return { brandMissing, phoneMissing };
  }, [doc]);

  useEffect(() => {
    let unsub = () => {};
    try {
      const auth = getAuth();
      unsub = onAuthStateChanged(auth, (u) => setAuthUser(u || null));
    } catch {
      setAuthUser(null);
    }
    return () => unsub && unsub();
  }, []);

  useEffect(() => {
    const run = async () => {
      if (!authUser) {
        setDoc(null);
        setOpen(false);
        return;
      }
      setLoading(true);
      try {
        const tokenEmail = authUser.email || "";
        const url = new URL(`${API_BASE}/api/userstart/status`);
        url.searchParams.set("userid", authUser.uid);
        if (tokenEmail) url.searchParams.set("email", tokenEmail);
        url.searchParams.set("autocreate", "1");

        const r = await fetch(url.toString(), {
          headers: { "x-api-key": API_KEY },
          credentials: "omit",
        });
        if (!r.ok) {
          setDoc(null);
          setOpen(false);
          return;
        }
        const j = await r.json();
        setDoc(j?.data || null);

        const bMissing = Number(j?.data?.brandStatus || 0) !== 1;
        const pMissing = Number(j?.data?.phoneStatus || 0) !== 1;
        setOpen(bMissing || pMissing);
      } catch {
        setDoc(null);
        setOpen(false);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [authUser]);

  const handleSave = async ({ brandName, phoneNumber }) => {
    if (!authUser) return;
    try {
      const r = await fetch(`${API_BASE}/api/userstart/${encodeURIComponent(authUser.uid)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-api-key": API_KEY },
        body: JSON.stringify({
          ...(typeof brandName !== "undefined" ? { brandName } : {}),
          ...(typeof phoneNumber !== "undefined" ? { phoneNumber } : {}),
        }),
      });
      const j = await r.json();
      if (j?.success) {
        setDoc(j.data);
        const bMissing = Number(j?.data?.brandStatus || 0) !== 1;
        const pMissing = Number(j?.data?.phoneStatus || 0) !== 1;
        setOpen(bMissing || pMissing);
      }
    } catch {
      // swallow
    }
  };

  if (!authUser || loading || !open) return null;

  return (
    <UserStartPopup
      open={open}
      onClose={() => setOpen(false)}
      onSave={handleSave}
      showBrand={missing.brandMissing}
      showPhone={missing.phoneMissing}
      initialBrand={doc?.brandName || ""}
      initialPhone={doc?.phoneNumber || ""}
    />
  );
}
