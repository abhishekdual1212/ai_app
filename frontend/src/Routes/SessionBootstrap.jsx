// src/Routes/SessionBootstrap.jsx
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import http from "../api/http";

// helper: stable, non-reversible 3-digit from userid
function codeFromUserId(userid = "") {
  let sum = 0;
  for (let i = 0; i < userid.length; i++) sum = (sum + userid.charCodeAt(i) * (i + 11)) % 1000;
  return String(sum).padStart(3, "0");
}

function slugify(name = "") {
  return String(name)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "user";
}

export default function SessionBootstrap() {
  const { _id } = useParams(); // short-lived sid in /:_id/consume/*
  const location = useLocation();
  const navigate = useNavigate();
  const ranRef = useRef(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    const wantsDashboard = location.pathname.endsWith("/consume/dashboard");
    const dest = wantsDashboard ? "dashboard" : "explore";

    (async () => {
      try {
        // 1) Consume short-lived URL token -> server sets HttpOnly cookies
        await http.get(`/api/auth/consume/${encodeURIComponent(_id)}?dest=${dest}&_=${Date.now()}`);

        // 2) Get the user (now that cookies exist) to build a pretty, non-secret slug
        const { data: me } = await http.get("/api/auth/me");
        const username = me?.username || "user";
        const userid = me?.userid || "";
        const pretty = `${codeFromUserId(userid)}-${slugify(username)}`;

        // Cache for future redirects/guards
        localStorage.setItem("app_slug", pretty);

        // 3) Land on cosmetic route (no secrets)
        navigate(`/${pretty}/${dest}`, { replace: true });
      } catch (e) {
        // If already authenticated (idempotent), still try to pretty-redirect
        try {
          const { data: me2 } = await http.get("/api/auth/me");
          if (me2?.authenticated) {
            const pretty = `${codeFromUserId(me2.userid)}-${slugify(me2.username)}`;
            localStorage.setItem("app_slug", pretty);
            navigate(`/${pretty}/${dest}`, { replace: true });
            return;
          }
        } catch {}
        setErr("Login link expired or invalid. Redirecting to login…");
        setTimeout(() => navigate("/login", { replace: true }), 1200);
      }
    })();
  }, [_id, location.pathname, navigate]);

  return (
    <div className="w-full h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-pulse text-lg font-medium">
          Setting up your secure session…
        </div>
        {err && <div className="mt-3 text-red-600">{err}</div>}
      </div>
    </div>
  );
}
