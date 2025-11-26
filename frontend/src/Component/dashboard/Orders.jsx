// src/Component/dashboard/Orders.jsx
import React, { useEffect, useMemo, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useLocation } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";
const API_KEY  = import.meta.env.VITE_API_KEY  || "1234567890abcdef";

/**
 * This component renders the 4 buckets:
 * - DIY Lawyer
 * - DIY Startups
 * - services (Intent)
 * - Direct Orders  <-- now wired to /api/direct-orders/list
 *
 * It keeps your UI and table the same; only the fetch for Direct Orders is swapped.
 */
export default function Orders() {
  const [authUser, setAuthUser] = useState(null);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 7;

  const [activeTab, setActiveTab] = useState("DIY Lawyer"); // default
  const location = useLocation();

  // Watch auth
  useEffect(() => {
    const auth = getAuth();
    const unsub = onAuthStateChanged(auth, (u) => setAuthUser(u || null));
    return () => unsub && unsub();
  }, []);

  // Optional: derive active tab from URL or keep local state
  useEffect(() => {
    // if your URL carries a query or hash to pick tab, parse it here
  }, [location]);

  const maxPage = Math.max(1, Math.ceil(total / pageSize));

  // Core loader
  useEffect(() => {
    let abort = false;
    if (!authUser) {
      setRows([]);
      setTotal(0);
      return;
    }

    (async () => {
      try {
        // Reset
        setRows([]);
        setTotal(0);

        // Normalize tab to a category string used by the backend
        const tab = String(activeTab).toLowerCase();

        if (tab.includes("direct")) {
          // NEW: Direct Orders endpoint
          const url = new URL(`${API_BASE}/api/direct-orders/list`);
          url.searchParams.set("uid", authUser.uid);
          url.searchParams.set("page", String(page));
          url.searchParams.set("pageSize", String(pageSize));
          if (search.trim()) url.searchParams.set("search", search.trim());

          const r = await fetch(url.toString(), {
            headers: { "x-api-key": API_KEY },
          });
          const j = await r.json();
          if (abort) return;

          if (j?.success) {
            setRows(Array.isArray(j.data) ? j.data : []);
            setTotal(Number(j.total || 0));
          } else {
            setRows([]);
            setTotal(0);
          }
          return;
        }

        // Existing logic for other tabs (DIY/Startup/Services)
        // NOTE: If you already have a utility here, keep using it — this is a safe fallback.
        const category =
          tab.includes("startup") ? "DIY_STARTUP" :
          tab.includes("service") ? "Intent" :
          "DIY";

        const url = new URL(`${API_BASE}/api/dashboard/${encodeURIComponent(authUser.uid)}/orders`);
        url.searchParams.set("category", category);
        url.searchParams.set("page", String(page));
        url.searchParams.set("pageSize", String(pageSize));
        if (search.trim()) url.searchParams.set("search", search.trim());

        const r = await fetch(url.toString(), {
          headers: { "x-api-key": API_KEY },
        });
        const j = await r.json();
        if (abort) return;

        if (j?.success) {
          setRows(Array.isArray(j.data) ? j.data : []);
          setTotal(Number(j.total || 0));
        } else {
          setRows([]);
          setTotal(0);
        }
      } catch {
        if (!abort) {
          setRows([]);
          setTotal(0);
        }
      }
    })();

    return () => {
      abort = true;
    };
  }, [authUser, activeTab, page, pageSize, search]);

  const tabs = useMemo(
    () => ["DIY Lawyer", "DIY Startups", "services", "Direct Orders"],
    []
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => {
          const active = t === activeTab;
          return (
            <button
              key={t}
              onClick={() => {
                setActiveTab(t);
                setPage(1);
                setSearch("");
              }}
              className={`px-3 py-1.5 rounded-full border ${
                active
                  ? "bg-[#2F5EAC] border-[#2F5EAC] text-white"
                  : "bg-white border-[#E6ECF6] text-[#2E2E2E]"
              }`}
            >
              {t}
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative max-w-md w-full">
        <input
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
          placeholder="Search by Order ID, Customer, Status or Type"
          className="w-full bg-white border border-[#E6ECF6] rounded-md pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#2F5EAC33]"
        />
        <Search className="w-4 h-4 text-[#6A6A6A] absolute left-2.5 top-1/2 -translate-y-1/2" />
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white border border-[#E6ECF6] rounded-xl">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[#6A6A6A] bg-[#F8FAFE] ">
              <th className="px-4 py-3 font-medium">Order ID</th>
              <th className="px-4 py-3 font-medium">Customer Name</th>
              <th className="px-4 py-3 font-medium">Order Date</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-[#6A6A6A]">
                  No matching orders found
                </td>
              </tr>
            ) : (
              rows.map((r, i) => (
                <tr key={`${r.orderNo}-${i}`} className="border-t border-[#E6ECF6]">
                  <td className="px-4 py-3 font-medium">{r.orderNo}</td>
                  <td className="px-4 py-3">{r.customerName}</td>
                  <td className="px-4 py-3">{r.orderDate}</td>
                  <td className="px-4 py-3 capitalize">{r.status}</td>
                  <td className="px-4 py-3">{r.type}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => openOrder(r, activeTab)}
                      className="text-white text-xs font-semibold px-3 py-1.5 rounded-md"
                      style={{ background: "#2F5EAC" }}
                    >
                      Go
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-[#6A6A6A]">
        <div>
          {rows.length > 0
            ? `Showing ${(page - 1) * pageSize + 1} to ${Math.min(page * pageSize, total)} of ${total} orders`
            : `Showing 0 of 0 orders`}
        </div>
        <div className="flex items-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-3 py-1.5 border border-[#E6ECF6] rounded-md disabled:opacity-50"
          >
            <span className="inline-flex items-center gap-1">
              <ChevronLeft className="w-4 h-4" />
              Prev
            </span>
          </button>
          <div className="px-2">{page} of {maxPage}</div>
          <button
            disabled={page >= maxPage}
            onClick={() => setPage((p) => Math.min(maxPage, p + 1))}
            className="px-3 py-1.5 border border-[#E6ECF6] rounded-md disabled:opacity-50"
          >
            <span className="inline-flex items-center gap-1">
              Next
              <ChevronRight className="w-4 h-4" />
            </span>
          </button>
        </div>
      </div>
    </div>
  );

  function openOrder(row, tabLabel) {
    // Keep your current deep-link behavior:
    const FE_BASE = (import.meta.env.VITE_FE_BASE || "http://localhost:3001").replace(/\/$/, "");
    const isIntent = String(tabLabel).toLowerCase().includes("service");
    const isDirect = String(tabLabel).toLowerCase().includes("direct");
    const path = isIntent
      ? "/dashboard/static"
      : isDirect
      ? "/dashboard/chat-bot"
      : "/dashboard/diyPayment";
    const url = `${FE_BASE}${path}?chat_id=${encodeURIComponent(row.chatId || "")}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }
}
