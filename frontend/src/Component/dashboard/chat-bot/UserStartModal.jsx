// dashboard/chat-bot/UserStartModal.jsx
import React, { useState } from "react";

export default function UserStartModal({
  open,
  initialBrandname = "",
  initialPhone = "",
  onSubmit,
  onSkip,
}) {
  const [brandname, setBrandname] = useState(initialBrandname || "");
  const [phone, setPhone] = useState(initialPhone || "");
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onSkip} />
      {/* Modal */}
      <div className="relative bg-white w-[92%] max-w-md rounded-2xl shadow-xl border border-[#E6ECF6] p-6">
        <div className="mb-2">
          <h2 className="text-xl font-semibold text-[#2F5EAC]">
            A quick extra detail (optional)
          </h2>
          <p className="text-sm text-[#6A6A6A] mt-1">
            You can skip this and fill later from your dashboard.
          </p>
        </div>

        <div className="space-y-4 mt-4">
          <div>
            <label className="block text-sm text-[#2E2E2E] mb-1">Brand name</label>
            <input
              value={brandname}
              onChange={(e) => setBrandname(e.target.value)}
              placeholder="e.g., Acme Foods"
              className="w-full border border-[#E6ECF6] rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#2F5EAC33]"
            />
          </div>
          <div>
            <label className="block text-sm text-[#2E2E2E] mb-1">Phone number</label>
            <input
              value={phone}
              onChange={(e) => {
                // accept digits only, but don't enforce length (optional field)
                const digits = e.target.value.replace(/\D/g, "");
                setPhone(digits);
              }}
              placeholder="10-digit phone (optional)"
              className="w-full border border-[#E6ECF6] rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#2F5EAC33]"
            />
          </div>
        </div>

        <div className="flex items-center justify-between mt-6">
          <button
            onClick={onSkip}
            className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-sm"
          >
            Skip for now
          </button>
          <button
            onClick={() => onSubmit({ brandname: brandname.trim() || null, phone: phone?.trim() || null })}
            className="px-4 py-2 rounded-md text-white bg-[#2F5EAC] hover:bg-[#244b90] text-sm font-semibold"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
