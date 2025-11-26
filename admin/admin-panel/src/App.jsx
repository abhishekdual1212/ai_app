import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Login from "./pages/Login";
import Users from "./pages/Users";
import UserHub from "./pages/UserHub";
import Orders from "./pages/Orders";
import OrderDetail from "./pages/OrderDetail";
import AdminHeader from "./components/AdminHeader";
import { AdminNavProvider } from "./store/adminNav";

function RequireAuth({ children }) {
  const token = sessionStorage.getItem("admin_auth");
  const loc = useLocation();
  if (!token) return <Navigate to="/login" state={{ from: loc }} replace />;
  return children;
}

export default function App() {
  const loc = useLocation();
  const showHeader = !loc.pathname.startsWith("/login");

  return (
    <AdminNavProvider>
      <div className="min-h-dvh bg-[#F5F7FB]">
        {showHeader ? <AdminHeader /> : null}

        <Routes>
          {/* Auth */}
          <Route path="/login" element={<Login />} />

          {/* Users grid (default) */}
          <Route
            path="/"
            element={
              <RequireAuth>
                <Users />
              </RequireAuth>
            }
          />

          {/* User hub (shows the same 4-option chooser flow) */}
          <Route
            path="/user/:uid"
            element={
              <RequireAuth>
                <UserHub />
              </RequireAuth>
            }
          />

          {/* Orders list for a user & section (diy | startup | intent | direct) */}
          <Route
            path="/user/:uid/orders/:kind"
            element={
              <RequireAuth>
                <Orders />
              </RequireAuth>
            }
          />

          {/* Optional: single order detail (if/when you wire it) */}
          <Route
            path="/user/:uid/orders/:kind/:orderId"
            element={
              <RequireAuth>
                <OrderDetail />
              </RequireAuth>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </AdminNavProvider>
  );
}
