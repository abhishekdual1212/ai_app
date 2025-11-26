// src/Component/dashboard/UserSettingsModal.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useSettings } from "../SettingsContext.jsx";
import { getAuth } from "firebase/auth";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";
const API_KEY = import.meta.env.VITE_API_KEY || "1234567890abcdef";

export default function UserSettingsModal() {
  const { isOpen, close } = useSettings();

  const [loading, setLoading] = useState(false);
  const [record, setRecord] = useState(null);
  const [step, setStep] = useState("menu"); // "menu" | "confirm-change" | "edit"
  const [field, setField] = useState(null); // "brandName" | "phoneNumber"
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const authUser = useMemo(() => {
    try {
      const a = getAuth();
      return a?.currentUser || null;
    } catch {
      return null;
    }
  }, [isOpen]);

  const userid = authUser?.uid || "";
  const email = authUser?.email || "";

  const hasPhone = !!(record?.phoneNumber && String(record.phoneNumber).trim());
  const hasBrand = !!(record?.brandName && String(record.brandName).trim());

  const menuOptions = useMemo(() => {
    if (hasPhone && hasBrand) {
      return [
        { key: "phoneNumber", label: "Change phone number" },
        { key: "brandName", label: "Change brand name" },
      ];
    } else if (hasPhone && !hasBrand) {
      return [
        { key: "phoneNumber", label: "Change phone number" },
        { key: "brandName", label: "Add brand name" },
      ];
    } else if (!hasPhone && hasBrand) {
      return [
        { key: "brandName", label: "Change brand name" },
        { key: "phoneNumber", label: "Add phone number" },
      ];
    }
    return [
      { key: "brandName", label: "Add brand name" },
      { key: "phoneNumber", label: "Add phone number" },
    ];
  }, [hasPhone, hasBrand]);

  // load current userstart doc
  useEffect(() => {
    if (!isOpen) return;
    if (!userid && !email) return;

    let mounted = true;
    (async () => {
      setLoading(true);
      setErr("");
      setStep("menu");
      setField(null);
      setValue("");

      try {
        const q = userid
          ? `userid=${encodeURIComponent(userid)}`
          : `email=${encodeURIComponent(email)}`;

        const res = await fetch(`${API_BASE}/api/userstart/status?${q}&autocreate=1`, {
          headers: { "x-api-key": API_KEY },
        });
        const data = await res.json();
        if (!mounted) return;
        if (!data?.success) throw new Error(data?.message || "Failed to load");
        setRecord(data.data || null);
      } catch (e) {
        setRecord(null);
        setErr("Failed to load settings.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [isOpen, userid, email]);

  const pick = (k) => {
    setField(k);
    const isChange =
      (k === "phoneNumber" && hasPhone) || (k === "brandName" && hasBrand);
    if (isChange) {
      setStep("confirm-change");
    } else {
      setStep("edit");
      setValue("");
    }
  };

  const beginEdit = () => {
    setStep("edit");
    setValue(field === "phoneNumber" ? (record?.phoneNumber || "") : (record?.brandName || ""));
  };

  const save = async () => {
    setErr("");

    // validate
    if (field === "phoneNumber") {
      const digits = String(value || "").replace(/\D/g, "");
      if (digits.length < 7 || digits.length > 15) {
        setErr("Please enter a valid phone number.");
        return;
      }
    } else if (field === "brandName") {
      if (!String(value || "").trim()) {
        setErr("Brand name cannot be empty.");
        return;
      }
    }

    setSaving(true);
    try {
      const payload = { [field]: String(value).trim() };

      const res = await fetch(`${API_BASE}/api/userstart/${encodeURIComponent(userid)}`, {
        method: "PATCH",
        headers: {
          "x-api-key": API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data?.success) throw new Error(data?.message || "Update failed");
      setRecord(data.data);
      setStep("menu");
      setField(null);
      setValue("");
    } catch (e) {
      setErr(e.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center" onClick={close}>
      <div className="absolute inset-0 bg-black/40" aria-hidden="true" />
      <div
        className="relative bg-white rounded-2xl w-[92vw] max-w-lg border border-[#E6ECF6] shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E6ECF6] flex items-center justify-between">
          <div className="text-[#2F5EAC] font-semibold">Settings</div>
          <button
            onClick={close}
            className="px-3 py-1.5 rounded-md text-sm bg-gray-100 hover:bg-gray-200"
          >
            Close
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {loading ? (
            <div className="text-sm text-[#6A6A6A]">Loading…</div>
          ) : step === "menu" ? (
            <>
              <div className="mb-4 text-xs text-[#6A6A6A]">
                Status:&nbsp;
                <span className="inline-flex items-center gap-1">
                  <span
                    className={`inline-block w-2 h-2 rounded-full ${
                      hasPhone && hasBrand ? "bg-green-500" : "bg-yellow-400"
                    }`}
                  />
                  {hasPhone && hasBrand
                    ? "Complete"
                    : hasPhone && !hasBrand
                    ? "Missing brand name"
                    : !hasPhone && hasBrand
                    ? "Missing phone"
                    : "Missing both"}
                </span>
              </div>

              <div className="text-[#2F5EAC] border border-[#2F5EAC40] rounded-2xl overflow-hidden">
                {menuOptions.map((opt, i) => (
                  <button
                    key={opt.key}
                    onClick={() => pick(opt.key)}
                    className={`w-full text-left px-5 py-4 hover:bg-[#2F5EAC14] ${
                      i !== menuOptions.length - 1 ? "border-b border-[#2F5EAC40]/40" : ""
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </>
          ) : step === "confirm-change" ? (
            <div className="space-y-4">
              <div className="text-sm text-[#2E2E2E]">
                Current {field === "phoneNumber" ? "phone number" : "brand name"}:{" "}
                <b className="text-[#2F5EAC]">
                  {field === "phoneNumber" ? record?.phoneNumber || "—" : record?.brandName || "—"}
                </b>
              </div>
              <div className="text-sm text-[#6A6A6A]">
                Do you want to change this {field === "phoneNumber" ? "phone number" : "brand name"}?
              </div>
              <div className="flex gap-2">
                <button
                  onClick={beginEdit}
                  className="px-4 py-2 rounded-md text-white bg-[#2F5EAC] hover:bg-[#244b90] text-sm"
                >
                  Yes, change
                </button>
                <button
                  onClick={() => {
                    setStep("menu");
                    setField(null);
                    setValue("");
                  }}
                  className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-sm"
                >
                  No, go back
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <label className="block text-sm text-[#2E2E2E] mb-1">
                {field === "phoneNumber" ? "New phone number" : "Brand name"}
              </label>
              <input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={field === "phoneNumber" ? "Enter phone number" : "Enter brand name"}
                className="w-full bg-white border border-[#E6ECF6] rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#2F5EAC33]"
              />
              {err ? <div className="text-xs text-red-600">{err}</div> : null}
              <div className="flex gap-2">
                <button
                  onClick={save}
                  disabled={saving}
                  className="px-4 py-2 rounded-md text-white bg-[#2F5EAC] hover:bg-[#244b90] text-sm disabled:opacity-60"
                >
                  {saving ? "Saving…" : "Save"}
                </button>
                <button
                  onClick={() => {
                    setStep("menu");
                    setField(null);
                    setValue("");
                    setErr("");
                  }}
                  className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
