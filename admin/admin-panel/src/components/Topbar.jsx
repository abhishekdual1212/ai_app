import { useContext, useState } from "react";
import { AdminAuthContext } from "../state/AdminAuthContext";

export default function Topbar({ search, setSearch, sortMode, setSortMode }) {
  const { logout } = useContext(AdminAuthContext);
  const [filterOpen, setFilterOpen] = useState(false);

  return (
    <div className="w-full bg-[#2F5EAC] text-white rounded-t-2xl px-6 py-4 flex items-center justify-between">
      <div className="text-xl font-medium">Users</div>

      <div className="flex items-center gap-3">
        {/* search */}
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name"
          className="px-3 py-2 rounded-md text-black w-[16rem] outline-none"
        />

        {/* sort/filter */}
        <div className="relative">
          <button
            onClick={() => setFilterOpen((s) => !s)}
            className="bg-white/10 border border-white/30 px-3 py-2 rounded-md"
          >
            {sortMode === "alpha" ? "Alphabetical" : "Last updated"}
          </button>
          {filterOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded-md shadow-card border">
              <button
                className="w-full text-left px-3 py-2 hover:bg-gray-100"
                onClick={() => {
                  setSortMode("alpha");
                  setFilterOpen(false);
                }}
              >
                Alphabetical (A→Z)
              </button>
              <button
                className="w-full text-left px-3 py-2 hover:bg-gray-100"
                onClick={() => {
                  setSortMode("lastUpdated");
                  setFilterOpen(false);
                }}
              >
                Last updated (Newest)
              </button>
            </div>
          )}
        </div>

        <button
          onClick={logout}
          className="bg-white/10 border border-white/30 px-3 py-2 rounded-md hover:bg-white/20"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
