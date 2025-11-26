import { X } from "lucide-react";

const BRAND = "#2F5EAC";

export default function OptionModal({ user, onClose }) {
  const options = [
    { label: "DIY Lawyer", key: "diy-lawyer" },
    { label: "DIY Startups", key: "diy-startups" },
    { label: "Services", key: "services" },
    { label: "Direct Orders", key: "direct" },
  ];

  // For now we just close; wire these to your main FE routes if you want to open in new tab.
  const choose = (opt) => {
    // Example (if you add deep-linking later):
    // window.open(`http://localhost:3001/admin/impersonate?uid=${user.uid}&target=${opt.key}`, "_blank");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Modal */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg w-full max-w-md relative">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            <X size={20} />
          </button>
          <div className="px-6 py-5">
            <div className="text-lg font-semibold mb-4" style={{ color: BRAND }}>
              Choose an option to open
            </div>
            <div className="text-sm text-gray-600 mb-4">
              {user?.displayName || "User"} ({user?.email || user?.uid})
            </div>

            <div className="border border-[#2F5EAC40] rounded-2xl overflow-hidden text-[15px]">
              {options.map((o, i) => (
                <button
                  key={o.key}
                  onClick={() => choose(o)}
                  className={`w-full text-left px-5 py-4 hover:bg-[#EAF2FF] ${
                    i !== options.length - 1 ? "border-b border-[#2F5EAC40]/40" : ""
                  }`}
                  style={{ color: BRAND }}
                >
                  {o.label}
                </button>
              ))}
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-md text-white"
                style={{ backgroundColor: BRAND }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
