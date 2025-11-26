import { ChevronRight } from "lucide-react";

const BRAND = "#2F5EAC";

function Initials({ name }) {
  const initials = (name || "")
    .split(" ")
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div className="w-full h-full flex items-center justify-center bg-[#EAF2FF] text-[#2F5EAC]">
      <span className="text-base font-semibold">{initials || "U"}</span>
    </div>
  );
}

function fmtLastLoginText(text) {
  if (!text) return "—";
  try {
    const d = new Date(text);
    if (isNaN(d.getTime())) return text;
    return d.toLocaleDateString();
  } catch {
    return text;
  }
}

export default function UserCard({ user, onOpen }) {
  const {
    photoURL = "",
    displayName = "User",
    email = "",
    _lastLoginText = "—",
  } = user || {};

  const lastLogin = fmtLastLoginText(_lastLoginText);

  const open = (e) => {
    e?.preventDefault?.();
    onOpen?.();
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={open}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && open(e)}
      className="bg-white rounded-2xl border border-[#E6ECF6] shadow-sm p-3 flex flex-col justify-between h-full
                 transition-all hover:shadow-md hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[#2F5EAC33] cursor-pointer"
      aria-label={`Open ${displayName || email}`}
    >
      {/* Body */}
      <div className="flex gap-3 items-center">
        {/* Avatar */}
        <div className="shrink-0">
          <div className="w-16 h-16 rounded-full overflow-hidden border border-[#E6ECF6] bg-gray-100">
            {photoURL ? (
              <img
                src={photoURL}
                alt={displayName}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  const parent = e.currentTarget.parentElement;
                  if (parent) {
                    parent.innerHTML = "";
                    const span = document.createElement("div");
                    span.className =
                      "w-full h-full flex items-center justify-center bg-[#EAF2FF] text-[#2F5EAC]";
                    span.innerText = (displayName || email || "U")
                      .split(" ")
                      .map((s) => s[0])
                      .filter(Boolean)
                      .slice(0, 2)
                      .join("")
                      .toUpperCase() || "U";
                    parent.appendChild(span);
                  }
                }}
              />
            ) : (
              <Initials name={displayName || email} />
            )}
          </div>
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-gray-800 leading-tight truncate">
            {displayName || email}
          </div>
          {email && (
            <div className="text-[12px] text-gray-600 truncate" title={email}>
              {email}
            </div>
          )}
          <div className="text-[12px] text-gray-500 mt-1">
            <span className="inline-flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-full bg-[#2F5EAC] opacity-60"></span>
              Last login: {lastLogin}
            </span>
          </div>
        </div>

        {/* Subtle cue to click */}
        <ChevronRight className="w-4 h-4 text-[#2F5EAC] opacity-70 shrink-0" />
      </div>

      {/* Footer (explicit action) */}
      <div className="mt-3 flex justify-end">
        <button
          onClick={(e) => {
            e.stopPropagation();
            open(e);
          }}
          className="text-sm font-semibold underline"
          style={{ color: BRAND }}
        >
          Open
        </button>
      </div>
    </div>
  );
}
