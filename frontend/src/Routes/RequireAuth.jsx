// src/Routes/RequireAuth.jsx
import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import http from "../api/http";

export default function RequireAuth({ children }) {
  const [loading, setLoading] = useState(true);
  const [ok, setOk] = useState(false);
  const loc = useLocation();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await http.get("/api/auth/me");
        if (!mounted) return;
        if (data?.authenticated) {
          setOk(true);
        } else {
          // try refresh once
          try {
            await http.post("/api/auth/refresh");
            const { data: me2 } = await http.get("/api/auth/me");
            if (!mounted) return;
            setOk(!!me2?.authenticated);
          } catch {
            if (mounted) setOk(false);
          }
        }
      } catch {
        if (mounted) setOk(false);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, [loc.pathname]);

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="animate-pulse">Checking session…</div>
      </div>
    );
  }
  if (!ok) return <Navigate to="/login" replace />;

  return children;
}
