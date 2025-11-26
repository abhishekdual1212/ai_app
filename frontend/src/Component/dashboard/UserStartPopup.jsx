// src/Component/dashboard/UserStartPopup.jsx
import React, { useEffect, useMemo, useState } from "react";

export default function UserStartPopup({
  open,
  onClose,
  onSave,
  showBrand = true,
  showPhone = true,
  initialBrand = "",
  initialPhone = "",
}) {
  const [brandName, setBrandName] = useState(initialBrand || "");
  const [phoneNumber, setPhoneNumber] = useState(initialPhone || "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setBrandName(initialBrand || "");
  }, [initialBrand]);

  useEffect(() => {
    setPhoneNumber(initialPhone || "");
  }, [initialPhone]);

  const canSubmit = useMemo(() => true, []);

  if (!open) return null;

  const submit = async (e) => {
    e?.preventDefault?.();
    if (!canSubmit) return;
    setSaving(true);
    try {
      const payload = {};
      if (showBrand) payload.brandName = brandName || "";
      if (showPhone) payload.phoneNumber = phoneNumber || "";
      await onSave?.(payload);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center"
      aria-modal="true"
      role="dialog"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="relative w-[92%] max-w-md bg-white rounded-2xl shadow-xl p-6 border border-[#E6ECF6]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-lg font-semibold text-[#2F5EAC]">
          Complete your profile (optional)
        </div>
        <p className="text-sm text-[#6A6A6A] mt-1">
          You can update these later — providing them now helps personalize your experience.
        </p>

        <form className="mt-5 space-y-4" onSubmit={submit}>
          {showBrand ? (
            <div>
              <label className="block text-sm text-[#2E2E2E] mb-1">Brand name</label>
              <input
                className="w-full border border-[#E6ECF6] rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#2F5EAC33]"
                placeholder="e.g., Acme Corp"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
              />
            </div>
          ) : null}

          {showPhone ? (
            <div>
              <label className="block text-sm text-[#2E2E2E] mb-1">Phone number</label>
              <input
                className="w-full border border-[#E6ECF6] rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#2F5EAC33]"
                placeholder="e.g., 9876543210"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>
          ) : null}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-sm"
            >
              Skip
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-md text-white text-sm font-semibold disabled:opacity-60"
              style={{ background: "#2F5EAC" }}
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </form>

        <div className="mt-3 text-[11px] text-[#6A6A6A]">
          This popup will appear again until both fields are provided.
        </div>
      </div>
    </div>
  );
}
