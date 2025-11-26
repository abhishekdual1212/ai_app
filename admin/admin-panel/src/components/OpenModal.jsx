export default function OpenModal({ open, onClose, onSelect }) {
  if (!open) return null;
  const options = [
    { key: "DIY", label: "DIY Lawyer" },
    { key: "DIY_STARTUP", label: "DIY Startups" },
    { key: "Intent", label: "services" },
    { key: "Direct", label: "Direct Orders" },
  ];
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-[92%] max-w-lg rounded-2xl shadow-card overflow-hidden">
        <div className="bg-[#E6ECF6] border-b border-[#ACC1E7] px-6 py-4 text-[#2F5EAC] font-medium">
          Choose an option to get started
        </div>
        <div className="p-6">
          <div className="text-[#2F5EAC] border border-[#2F5EAC40] shadow rounded-2xl overflow-hidden">
            {options.map((opt, i) => (
              <button
                key={opt.key}
                onClick={() => onSelect(opt.key)}
                className={`w-full text-left px-5 py-4 hover:bg-[#2F5EAC38] ${
                  i !== options.length - 1 ? "border-b border-[#2F5EAC40]/40" : ""
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div className="flex justify-end mt-5">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
