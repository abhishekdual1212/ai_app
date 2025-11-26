import React, { useContext, useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { AdminAuthProvider, AdminAuthContext } from "./state/AdminAuthContext";
import { makeApi } from "./lib/api";

function OrdersPage() {
  const { authHeader } = useContext(AdminAuthContext);
  const api = useMemo(() => makeApi(authHeader), [authHeader]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const params = new URLSearchParams(window.location.search);
  const sessionId = params.get("session_id") || "";
  const type = params.get("type") || "DIY";

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/api/admin/users/${sessionId}/orders`, {
          params: { type },
        });
        setOrders(Array.isArray(res.data?.data) ? res.data.data : []);
      } catch (e) {
        console.error(e);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [api, sessionId, type]);

  return (
    <div className="max-w-5xl mx-auto mt-8 bg-white border rounded-2xl p-6">
      <div className="text-xl text-[#2F5EAC] mb-4">
        Orders for <span className="font-semibold">{sessionId}</span> ({type})
      </div>
      {loading ? (
        <div className="text-gray-600">Loading…</div>
      ) : orders.length === 0 ? (
        <div className="text-gray-600">No orders found.</div>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <div
              key={o.chat_id}
              className="p-3 rounded-xl border shadow-sm flex justify-between items-center"
            >
              <div className="text-sm text-[#2E2E2E]">
                <div className="font-medium">{o.chatType} • #{(o.chat_id||"").slice(-6).toUpperCase()}</div>
                <div className="text-gray-600">status: {o.status}</div>
                <div className="text-gray-600">created: {o.createdAt || "-"}</div>
              </div>
              
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Bootstrap() {
  return (
    <AdminAuthProvider>
      <OrdersPage />
    </AdminAuthProvider>
  );
}

const root = createRoot(document.getElementById("app"));
root.render(<Bootstrap />);
