// admin-panel/src/pages/OrderDetail.jsx
import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getAdminOrderDetail } from "../lib/api";
import { useAdminNav } from "../store/adminNav";
import { ArrowLeft, ExternalLink } from "lucide-react";

const BRAND = "#2F5EAC";
 
export default function OrderDetail() {
  const navigate = useNavigate();
  const { uid, kind, orderId } = useParams();
  const { selectedUser } = useAdminNav();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [order, setOrder] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const res = await getAdminOrderDetail({ uid, kind, orderId });
        if (!mounted) return;
        if (res?.success && res?.data) {
          setOrder(res.data);
        } else {
          setErr("Order not found.");
        }
      } catch (e) {
        setErr("Failed to load order.");
      } finally {
        if (mounted) setLoading(false);
      }
    })(); 
    return () => {
      mounted = false;
    };
  }, [uid, kind, orderId]);

  const title = useMemo(() => {
    const n =
      order?.orderNo || order?.order_no || order?.orderId || order?._id || orderId;
    return `Order ${n}`;
  }, [order, orderId]);
 
  const goBack = () => {
    // Navigate back to the orders list for the current kind
    navigate(`/user/${uid}/orders/${kind}`, { replace: true });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Back */}
      <div className="mb-4">
        <button
          onClick={goBack}
          className="inline-flex items-center gap-2 text-sm"
          style={{ color: BRAND }}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to orders</span>
        </button>
      </div>

      {/* Heading */}
      <div className="bg-white rounded-2xl border border-[#E6ECF6] shadow-sm p-5">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-800">{title}</h1>
          {selectedUser ? (
            <div className="text-sm text-gray-600">
              {selectedUser.displayName || selectedUser.email}
            </div>
          ) : null}
        </div>

        {/* Content */}
        {loading ? (
          <div className="mt-6 text-sm text-[#6A6A6A]">Loading…</div>
        ) : err ? (
          <div className="mt-6 text-sm text-red-600">{err}</div>
        ) : !order ? (
          <div className="mt-6 text-sm text-[#6A6A6A]">No details available.</div>
        ) : (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field label="Order No" value={order.orderNo || order.order_no || "—"} />
            <Field label="Type" value={prettyKind(kind)} />
            <Field label="Status" value={order.status || "pending"} />
            <Field
              label="Order Date"
              value={
                order.orderDate
                  ? new Date(order.orderDate).toLocaleDateString()
                  : order.createdAt
                  ? new Date(order.createdAt).toLocaleDateString()
                  : "—"
              }
            />
            <Field label="Customer" value={order.customerName || order.userName || "—"} />
            <Field label="Email" value={order.customerEmail || order.email || "—"} />

            {/* Optional links if your order has navigation targets */}
            {order?.links?.length ? (
              <div className="md:col-span-2">
                <div className="text-sm font-medium text-gray-700 mb-2">Links</div>
                <div className="flex flex-wrap gap-2">
                  {order.links.map((l, i) => (
                    <a
                      key={i}
                      href={l.href}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-sm underline"
                      style={{ color: BRAND }}
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>{l.label || l.href}</span>
                    </a>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Q&A Section */}
            <div className="md:col-span-2 mt-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Q&A</h2>
              <div className="space-y-4">
                {/* Static Q&A entry for now */}
                <div className="bg-[#F9FBFF] border border-[#E6ECF6] rounded-xl p-4">
                  <div className="text-sm font-medium text-gray-700 mb-1">
                    Q: What is the typical turnaround time for this service?
                  </div>
                  <div className="text-sm text-gray-800">
                    A: The standard turnaround time is 3-5 business days, but it can vary based on complexity.
                  </div>
                </div>
                {/* TODO: In the future, fetch and map dynamic Q&A entries here */}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div className="bg-[#F9FBFF] border border-[#E6ECF6] rounded-xl p-4">
      <div className="text-xs uppercase tracking-wide text-[#6A6A6A]">{label}</div>
      <div className="text-sm text-gray-800 mt-1 break-words">{value}</div>
    </div>
  );
}

function prettyKind(k) {
  const L = String(k || "").toLowerCase();
  if (L === "startup") return "DIY Startups";
  if (L === "intent") return "Services";
  if (L === "direct") return "Direct Orders";
  return "DIY Lawyer";
}
