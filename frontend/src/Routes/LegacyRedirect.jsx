// src/Routes/LegacyRedirect.jsx
import { useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import http from "../api/http";
import { userToSlug } from "../utils/slug";

/**
 * Catches any legacy `/dashboard` or `/dashboard/*` URL and
 * redirects to the slugged equivalent:
 *   /dashboard                  -> /:slug/explore
 *   /dashboard/order            -> /:slug/dashboard
 *   /dashboard/<anything-else>  -> /:slug/dashboard/<anything-else>
 *
 * Slug resolution order:
 *   1) app_slug in localStorage (set by SessionBootstrap / PrettyGuard)
 *   2) /api/auth/me -> compute slug via userToSlug & store
 */
export default function LegacyRedirect() {
  const loc = useLocation();
  const navigate = useNavigate();

  const targetInfo = useMemo(() => {
    const path = loc.pathname.replace(/\/+$/, ""); // trim trailing slash
    if (path === "/dashboard") return { kind: "explore", tail: "" };
    if (path === "/dashboard/order") return { kind: "dashboard", tail: "" };

    // /dashboard/<tail...>
    const m = path.match(/^\/dashboard\/(.*)$/);
    if (m) return { kind: "dashboard", tail: m[1] || "" };

    // Fallback to explore
    return { kind: "explore", tail: "" };
  }, [loc.pathname]);

  useEffect(() => {
    let mounted = true;

    async function redirect() {
      // 1) Try cached slug first
      let slug = localStorage.getItem("app_slug");

      // 2) If missing, compute from /api/auth/me (also cache)
      if (!slug) {
        try {
          const { data } = await http.get("/api/auth/me");
          if (data?.authenticated) {
            const sessionId = localStorage.getItem("sessionId") || "";
            slug =
              userToSlug?.({ userid: data.userid, username: data.username }, sessionId) ||
              `${String(data.userid || "").slice(0, 3)}-${(data.username || "user")
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-+|-+$/g, "")
                .slice(0, 40)}`;
            localStorage.setItem("app_slug", slug);
          }
        } catch {
          // If we can't resolve a slug (e.g., not logged in), punt to /login
          if (mounted) navigate("/login", { replace: true });
          return;
        }
      }

      if (!slug) {
        if (mounted) navigate("/login", { replace: true });
        return;
      }

      const base =
        targetInfo.kind === "explore"
          ? `/${encodeURIComponent(slug)}/explore`
          : `/${encodeURIComponent(slug)}/dashboard`;

      const next =
        targetInfo.tail && targetInfo.kind === "dashboard"
          ? `${base}/${targetInfo.tail}`
          : base;

      if (!mounted) return;

      // Preserve query + hash
      const finalUrl = `${next}${loc.search || ""}${loc.hash || ""}`;
      navigate(finalUrl, { replace: true });
    }

    redirect();
    return () => {
      mounted = false;
    };
  }, [navigate, targetInfo, loc.search, loc.hash]);

  // Small inline loader while we resolve slug/me
  return (
    <div className="w-full h-screen flex items-center justify-center">
      <div className="animate-pulse">Redirecting…</div>
    </div>
  );
}
