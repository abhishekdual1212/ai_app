// Removed server-side Mongoose schemas — these belong in backend files, not in the React component.
import { useState, useEffect } from "react";
import order from "../../../public/assets/imgs/order.png";
import { useNavigate } from "react-router-dom";
import { FiChevronLeft, FiChevronRight, FiSearch } from "react-icons/fi";
 
import { Loader } from "lucide-react";
const SummaryOrder = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  // Tabs: DIY Lawyer | DIY Startups | services | Direct
  const [activeTab, setActiveTab] = useState("DIY_LAWYER"); // "DIY_LAWYER" | "DIY_STARTUP" | "Intent" | "Direct"
  const itemsPerPage = 7;
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("sessionId"));
  const navigate = useNavigate();

  const API_BASE = "http://localhost:3000";
  const API_HEADERS = { "x-api-key": "1234567890abcdef" };
 
  const highlightMatch = (text, search) => {
    if (!search) return text;
    const regex = new RegExp(`(${search})`, "gi");
    const parts = String(text ?? "").split(regex);
    return parts.map((part, idx) =>
      part.toLowerCase() === search.toLowerCase() ? (
        <span key={idx} className="bg-yellow-200 font-semibold">
          {part}
        </span>
      ) : (
        part
      )
    );
  };
 
  const matchesSearch = (order, search) => {
    const fields = [order.orderNo, order.customerName, order.status, order.chatType];
    return fields.some((field) => String(field ?? "").toLowerCase().includes(search));
  };
 
  useEffect(() => {
    const handleStorageChange = () => {
      setIsLoggedIn(!!localStorage.getItem("sessionId"));
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);
 
  useEffect(() => {
    if (isLoggedIn) fetchOrders();
    else setLoading(false);
  }, [isLoggedIn]);
 
  const safeDate = (o) => {
    const raw =
      o?.createdAt ||
      o?.updatedAt ||
      o?.timestamp ||
      Date.now();
    const d = new Date(raw);
    return isNaN(d.getTime())
      ? new Date().toLocaleDateString("en-CA")
      : d.toLocaleDateString("en-CA");
  };
 
  const fetchOrders = async () => {
    try {
      const sessionId = localStorage.getItem("sessionId");
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/dashboard/${sessionId}/all-chats`, {
        headers: API_HEADERS,
      });
 
      if (!response.ok) throw new Error("Failed to fetch orders");
      const data = await response.json();
 
      if (data.success) {
        const allOrders = [];
 
        const isFlatArray =
          Array.isArray(data.data) &&
          data.data.length > 0 &&
          !Array.isArray(data.data[0]);
 
        const mapChat = (o) => {
          if (!o || !o.chat_id) return null;
          return {
            id: o.chat_id,
            orderNo: `#${o.chat_id.slice(-6).toUpperCase()}`,
            customerName: o.customer_name || "User",
            date: safeDate(o),
            status: o.status,
            chatType: o.chatType, // "DIY" | "Intent" | maybe "Direct"
            origin: o.origin,     // optional
            // Extra hints from BE if present:
            diyFlow: o.diyFlow || o.flow || o.role || o.subtype || o.category || "",
            isStartup: o.isStartup === true,
            labels: Array.isArray(o.labels) ? o.labels : [],
            createdAt: o.createdAt || new Date().toISOString(),
            _id: o._id,
          };
        };
 
        if (isFlatArray) {
          data.data.forEach((o) => {
            const mapped = mapChat(o);
            if (mapped) allOrders.push(mapped);
          });
        } else {
          if (data.data[0] && Array.isArray(data.data[0])) {
            data.data[0].forEach((o) => {
              const mapped = mapChat(o);
              if (mapped) allOrders.push(mapped);
            });
          }
          for (let i = 1; i < data.data.length; i++) {
            const mapped = mapChat(data.data[i]);
            if (mapped) allOrders.push(mapped);
          }
        }
 
        // Mark Direct from client memo if present
        try {
          const raw = localStorage.getItem("directChatIds");
          const parsed = raw ? JSON.parse(raw) : [];
          const directIds = new Set(Array.isArray(parsed) ? parsed : []);
          if (directIds.size) {
            for (let i = 0; i < allOrders.length; i++) {
              if (directIds.has(allOrders[i].id) && allOrders[i].chatType !== "DIY") {
                allOrders[i] = { ...allOrders[i], chatType: "Direct" };
              }
            }
          }
        } catch { /* no-op */ }

        // Mark Startup DIY from client memo if present
        try {
          const rawS = localStorage.getItem("startupChatIds");
          const parsedS = rawS ? JSON.parse(rawS) : [];
          const startupIds = new Set(Array.isArray(parsedS) ? parsedS : []);
          if (startupIds.size) {
            for (let i = 0; i < allOrders.length; i++) {
              const o = allOrders[i];
              if (
                startupIds.has(o.id) &&
                String(o.chatType || "").toLowerCase() === "diy"
              ) {
                allOrders[i] = {
                  ...o,
                  isStartup: true,
                  diyFlow: o.diyFlow || "Startup",
                };
              }
            }
          }
        } catch { /* no-op */ }
 
        allOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setOrders(allOrders);
      } else throw new Error(data.message || "Failed to fetch orders");
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (orderId, newStatus) => {
    setOrders(currentOrders =>
      currentOrders.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
    // In a real application, you would also make an API call here
    // to update the status on the backend.
    // For example:
    // await fetch(`${API_BASE}/api/orders/${orderId}/status`, { method: 'PATCH', body: JSON.stringify({ status: newStatus }), headers: { ...API_HEADERS, 'Content-Type': 'application/json' } });
  };
  const isStartupDIY = (o) => {
    if (!o || String(o.chatType || "").toLowerCase() !== "diy") return false;
    const hint1 = String(o.diyFlow || "").toLowerCase();
    if (hint1.includes("startup")) return true;
    if (o.isStartup === true) return true;
    const labels = (o.labels || []).map((x) => String(x || "").toLowerCase());
    if (labels.includes("startup")) return true;
    const hint2 = String(o.flow || o.role || o.subtype || o.category || "").toLowerCase();
    if (hint2.includes("startup")) return true;
    return false;
  };
 
  const isLawyerDIY = (o) => {
    return String(o?.chatType || "").toLowerCase() === "diy" && !isStartupDIY(o);
  };

  const tryPrimeStartupQueryId = async (chatId) => {
    try {
      const resp = await fetch(`${API_BASE}/api/session/startup/${chatId}`, {
        headers: API_HEADERS,
      });
      if (!resp.ok) return;
      const json = await resp.json();
      const qid =
        json?.data?.query_id ||
        json?.query_id ||
        json?.data?.intentQueryId ||
        null;
      if (qid) {
        localStorage.setItem("S_query_id", qid);
        localStorage.setItem("query_id", qid);
      }
    } catch {
      // non-blocking
    }
  };
 
  const handleGoClick = async (order) => {
    if (!isLoggedIn) return navigate("/login");
 
    // DIY Startup → pass chat_id in URL + prime storage keys
    if (isStartupDIY(order)) {
      localStorage.setItem("Schat_id", order.id);
      localStorage.setItem("startup_chat_id", order.id);
      localStorage.setItem("startupChatId", order.id);
      localStorage.setItem("Dchat_id", order.id);
      localStorage.setItem("chatId", order.id);
      localStorage.setItem("startupFlow", "true");
      localStorage.setItem("diyRole", "startup");

      await tryPrimeStartupQueryId(order.id);

      navigate(`/dashboard/startup/outcome?chat_id=${order.id}`, {
        state: { chatId: order.id }, // extra hydration path
      });
      return;
    }
 
    // DIY Lawyer → unchanged
    if (isLawyerDIY(order)) {
      localStorage.setItem("Dchat_id", order.id);
      navigate(`/dashboard/diyPayment`);
      return;
    }
 
    // services/Intent → unchanged
    if (String(order.chatType || "").toLowerCase() === "intent") {
      localStorage.setItem("Ichat_id", order.id);
      localStorage.setItem("chatId", order.id); // normalize
      navigate(`/dashboard/static?chat_id=${order.id}`);
      return;
    }
 
    // Direct orders → chatBoard (search flow)
    if (String(order.chatType || "").toLowerCase() === "direct" || order.origin === "Direct") {
      localStorage.setItem("chatId", order.id);
      navigate(`/dashboard/chat-bot?chat_id=${order.id}`);
    }
  };
 
  const getStatusColor = (status) => {
    switch (String(status || "").toLowerCase()) {
      case "active":
        return "text-green-600";
      case "pending":
        return "text-yellow-600";
      case "completed":
        return "text-blue-600";
      default:
        return "text-gray-600";
    }
  };
 
  const search = searchTerm.toLowerCase();
 
  const typedOrders = orders.filter((o) => {
    if (activeTab === "DIY_LAWYER") return isLawyerDIY(o);
    if (activeTab === "DIY_STARTUP") return isStartupDIY(o);
    if (activeTab === "Intent") return String(o.chatType || "").toLowerCase() === "intent";
    if (activeTab === "Direct")
      return String(o.chatType || "").toLowerCase() === "direct" || o.origin === "Direct";
    return true;
  });
 
  const filteredOrders = typedOrders.filter((order) => matchesSearch(order, search));
 
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentOrders = filteredOrders.slice(startIndex, endIndex);
 
  useEffect(() => {
    setCurrentPage(1);
    setSearchTerm("");
  }, [activeTab]);
 
  if (loading) {
    return (
      <div className="w-[48rem] bg-[#F8F8F8] p-8 flex justify-center items-center h-64 rounded-xl">
        <div className="flex flex-col items-center text-[#6A6A6A]">
          <Loader className="animate-spin text-blue-600" size={40} />
          <span className="mt-4 text-lg font-[poppins]">Loading orders...</span>
        </div>
      </div>
    );
  }
 
  if (error)
    return (
      <div className="w-[48rem] bg-[#F8F8F8] p-8 flex justify-center items-center h-64 rounded-xl">
        <div className="text-lg font-[poppins] text-red-600">Error: {error}</div>
      </div>
    );
 
  return (
    <>
      {orders.length > 0 ? (
        <div className="bg-[#F8F8F8] p-8 rounded-xl w-[48rem] mb-10 pb-20">
          {/* 4 tabs */}
          <div className="flex gap-3 mb-4">
            <button
              className={`px-4 py-2 rounded-md text-sm font-[poppins] transition-colors ${
                activeTab === "DIY_LAWYER"
                  ? "bg-[#2F5EAC] text-white"
                  : "text-[#2F5EAC] bg-white hover:bg-[#EAF2FF]"
              }`}
              onClick={() => setActiveTab("DIY_LAWYER")}
            >
              DIY Lawyer
            </button>
 
            <button
              className={`px-4 py-2 rounded-md text-sm font-[poppins] transition-colors ${
                activeTab === "DIY_STARTUP"
                  ? "bg-[#2F5EAC] text-white"
                  : "text-[#2F5EAC] bg-white hover:bg-[#EAF2FF]"
              }`}
              onClick={() => setActiveTab("DIY_STARTUP")}
            >
              DIY Startups
            </button>
 
            <button
              className={`px-4 py-2 rounded-md text-sm font-[poppins] transition-colors ${
                activeTab === "Intent"
                  ? "bg-[#2F5EAC] text-white"
                  : "text-[#2F5EAC] bg-white hover:bg-[#EAF2FF]"
              }`}
              onClick={() => setActiveTab("Intent")}
            >
              services 
            </button>
 
            <button
              className={`px-4 py-2 rounded-md text-sm font-[poppins] transition-colors ${
                activeTab === "Direct"
                  ? "bg-[#2F5EAC] text-white"
                  : "text-[#2F5EAC] bg-white hover:bg-[#EAF2FF]"
              }`}
              onClick={() => setActiveTab("Direct")}
            >
              Direct Orders
            </button>
          </div>
 
          {/* Search Bar */}
          <div className="flex w-full bg-white rounded-md mb-6 shadow-sm">
            <div className="flex items-center pl-3">
              <FiSearch className="text-gray-500 text-lg" />
            </div>
            <input
              type="text"
              placeholder="Search by Order ID, Customer, Status or Type"
              className="flex-1 px-3 py-2 outline-none text-sm"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
 
          {/* Table Header */}
          <div className="grid grid-cols-6 text-sm text-[#2E2E2E] font-medium font-[poppins] mb-4 px-4">
            <div>Order ID</div>
            <div>Customer Name</div>
            <div>Order Date</div>
            <div>Status</div>
            <div>Type</div>
            <div>Action</div>
          </div>
 
          {/* Table Rows */}
          <div className="flex flex-col gap-3">
            {currentOrders.length > 0 ? (
              currentOrders.map((order) => (
                <div
                  key={order.id}
                  onClick={() => setSelectedOrderId(order.id)}
                  className={`grid grid-cols-6 items-center text-sm px-4 py-3 rounded-xl shadow-sm cursor-pointer transition-colors ${
                    selectedOrderId === order.id
                      ? "bg-[#E8FDCE]"
                      : "bg-white hover:bg-gray-50"
                  }`}
                >
                  <div className="underline text-[#6A6A6A] font-light font-[poppins]">
                    {highlightMatch(order.orderNo, searchTerm)}
                  </div>
                  <div className="text-[#6A6A6A] font-light font-[poppins]">
                    {highlightMatch(order.customerName, searchTerm)}
                  </div>
                  <div className="text-[#6A6A6A] font-light font-[poppins]">{order.date}</div>
                  <div>
                    <select
                      value={order.status}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleStatusChange(order.id, e.target.value);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className={`font-light font-[poppins] border-none outline-none appearance-none bg-transparent ${getStatusColor(
                        order.status
                      )}`}
                    >
                      <option value="pending" className="text-yellow-600">
                        pending
                      </option>
                      <option value="active" className="text-green-600">
                        active
                      </option>
                      <option value="completed" className="text-blue-600">
                        completed
                      </option>
                    </select>
                  </div>
                  <div className="text-[#6A6A6A] font-light font-[poppins]">
                    {highlightMatch(order.chatType, searchTerm)}
                  </div>
                  <div>
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        await handleGoClick(order);
                      }}
                      className={`text-sm font-[poppins] px-4 py-1 rounded-md transition-colors ${
                        selectedOrderId === order.id
                          ? "bg-[#2F5EAC] text-white"
                          : "text-[#2F5EAC] hover:bg-[#2F5EAC] hover:text-white"
                      }`}
                    >
                      {isLoggedIn ? "Go" : "Login"}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-6">No matching orders found</div>
            )}
          </div>
 
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-12">
              <div className="text-sm text-[#6A6A6A] font-[poppins]">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredOrders.length)} of{" "}
                {filteredOrders.length} orders
              </div>
              <div className="flex items-center gap-3">
                <button
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    currentPage === 1
                      ? "bg-[#E4E4E4] text-gray-400 cursor-not-allowed"
                      : "bg-[#E4E4E4] text-[#2F5EAC] hover:bg-[#2F5EAC] hover:text-white"
                  }`}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <FiChevronLeft />
                </button>
                <span className="text-sm font-[poppins] text-[#6A6A6A]">
                  {currentPage} of {totalPages}
                </span>
                <button
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    currentPage === totalPages
                      ? "bg-[#E4E4E4] text-gray-400 cursor-not-allowed"
                      : "bg-[#2F5EAC] text-white hover:bg-[#1a4a96]"
                  }`}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <FiChevronRight />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        // Empty state
        <div className="w-[48rem] bg-[#F8F8F8] p-8 flex flex-col justify-center items-center h-screen">
          <img src={order} alt="order" className="w-[16rem]" />
          <h1 className="font-[poppins] font-medium text-2xl text-[#000000] text-center mb-3.5">
            No Orders Yet!
          </h1>
          <p className="font-[poppins] font-light text-[16px] text-[#787878] text-center">
            Looks like you haven't placed any orders yet. Start exploring and <br />
            place your first order now!
          </p>
          <button
            className="bg-[#2F5EAC] text-white rounded-md px-8 py-2 my-3.5 font-[poppins] font-medium hover:bg-[#1a4a96] transition-colors"
            onClick={() => (isLoggedIn ? navigate("/dashboard/static") : navigate("/login"))}
          >
            {isLoggedIn ? "Start Ordering" : "Login to Start"}
          </button>
        </div>
      )}
    </>
  );
};
 
export default SummaryOrder;
