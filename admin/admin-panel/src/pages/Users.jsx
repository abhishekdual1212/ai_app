import { useEffect, useMemo, useState, useCallback } from "react";
import { getAdminUsers } from "../lib/api";
import { useNavigate } from "react-router-dom";
import { useAdminNav } from "../store/adminNav";

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
      <span className="text-xl font-semibold">{initials || "U"}</span>
    </div>
  );
}

function UserCard({ user, onChooseOption }) {
  const { photoURL, displayName, email, uid, lastLoginAt, brandName, phNo } = user || {};

  const options = useMemo(
    () => [
      { key: "DIY", label: "DIY Lawyer", kind: "diy" },
      { key: "DIY_STARTUP", label: "DIY Startups", kind: "startup" },
      { key: "Intent", label: "Services", kind: "intent" },
      { key: "Direct", label: "Direct Orders", kind: "direct" },
    ],
    []
  );

  const handleChoose = (opt) => {
    onChooseOption(opt);
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E6ECF6] overflow-hidden shadow-sm flex">
      {/* Left Column: User Info */}
      <div className="w-1/2 p-4 flex items-center gap-4">
        <div className="w-20 h-20 rounded-full overflow-hidden shrink-0 border border-[#E6ECF6]">
          {photoURL ? (
            <img
              src={photoURL}
              alt={displayName}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.style.display = "none";
                const p = e.currentTarget.parentElement;
                if (p) {
                  p.innerHTML = "";
                  const el = document.createElement("div");
                  el.className =
                    "w-full h-full flex items-center justify-center bg-[#EAF2FF] text-[#2F5EAC]";
                  el.innerText =
                    (displayName || email || "U")
                      .split(" ")
                      .map((s) => s[0])
                      .filter(Boolean)
                      .slice(0, 2)
                      .join("")
                      .toUpperCase() || "U";
                  p.appendChild(el);
                }
              }}
            />
          ) : (
            <Initials name={displayName || email || uid} />
          )}
        </div>
        <div className="min-w-0">
          <div className="font-semibold text-base text-[#2E2E2E] truncate">
            {displayName || email || uid}
          </div>
          {email ? (
            <div className="text-sm text-[#6A6A6A] truncate" title={email}>
              {email}
            </div>
          ) : null}
          {brandName && (
            <div className="text-sm text-[#6A6A6A] mt-1 truncate" title={brandName}>
              Brand: {brandName}
            </div>
          )}
          {phNo && (
            <div className="text-sm text-[#6A6A6A] mt-1 truncate" title={phNo}>
              Phone: {phNo}
            </div>
          )}
          <div className="text-xs text-gray-500 mt-2">
            Last login: {lastLoginAt ? new Date(lastLoginAt).toLocaleDateString() : "—"}
          </div>
        </div>
      </div>

      {/* Middle Column: Order Stats */}

      <div className="w-1/4 p-4 flex flex-col justify-center space-y-2">
        {options.map((opt) => (
          <button key={opt.key} className="w-full text-left py-2 px-4 text-sm text-[#2F5EAC] hover:bg-[#EAF2FF] rounded-md" onClick={() => handleChoose(opt)}>
            {opt.label}
          </button>
        ))}
      </div>

{/* Right Column: Options List */}
      <div className="w-1/4 p-4 flex flex-col justify-center items-center border-l border-r border-[#E6ECF6] space-y-2">
        <div className="text-center">
          <div className="text-lg font-bold text-[#2E2E2E]">12</div>
          <div className="text-xs text-[#6A6A6A]">Total Orders</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-gray-600">1,250 Rs</div>
          <div className="text-xs text-[#6A6A6A]">Total Paid</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-gray-600">50 Rs</div>
          <div className="text-xs text-[#6A6A6A]">Due Amount</div>
        </div>
      </div>

      
      
    </div>
  );
}

export default function Users() {
  const [users, setUsers] = useState([]);
  const [q, setQ] = useState("");
  const [sortMode, setSortMode] = useState("alpha");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const { setSelectedUser, setSection } = useAdminNav();
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const res = await getAdminUsers();
        if (!mounted) return;
        if (res?.success) {
          setUsers(Array.isArray(res.data) ? res.data : []);
        } else {
          setErr("Failed to load users");
        }
      } catch {
        setErr("Failed to load users");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    const base = term
      ? users.filter((u) => (u.displayName || "").toLowerCase().includes(term))
      : users.slice();

    const alphaCmp = (a, b) =>
      (a.displayName || a.email || a.uid || "")
        .toString()
        .toLowerCase()
        .localeCompare((b.displayName || b.email || b.uid || "").toString().toLowerCase());

    if (sortMode === "lastUpdated") {
      return base.sort((a, b) => {
        const at = Number(a.lastChatAt || 0);
        const bt = Number(b.lastChatAt || 0);
        if (bt !== at) return bt - at;
        return alphaCmp(a, b);
      });
    }
    return base.sort(alphaCmp);
  }, [q, users, sortMode]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Search + Sort */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search users by name"
            className="w-full bg-white border border-[#E6ECF6] rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#2F5EAC33]"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-[#6A6A6A]">Sort</label>
          <select
            value={sortMode}
            onChange={(e) => setSortMode(e.target.value)}
            className="appearance-none text-sm border border-[#E6ECF6] bg-white rounded-md px-3 py-2"
          >
            <option value="alpha">Alphabetical (A–Z)</option>
            <option value="lastUpdated">Last updated (latest first)</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="text-sm text-[#6A6A6A]">Loading users…</div>
      ) : err ? (
        <div className="text-sm text-red-600">{err}</div>
      ) : filtered.length === 0 ? (
        <div className="text-[#6A6A6A]">No users found.</div>
      ) : (
        <div className="grid grid-cols-1 gap-4"> {/* Changed to grid-cols-1 for one card per row */}
          {filtered.map((u) => (
            <UserCard
              key={u.uid}
              user={u}
              onChooseOption={(opt) => {
                setSelectedUser({ uid: u.uid, displayName: u.displayName, email: u.email });
                setSection(opt.label);
                navigate(`/user/${encodeURIComponent(u.uid)}/orders/${opt.kind}`);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
