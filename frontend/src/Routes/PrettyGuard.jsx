// src/Routes/PrettyGuard.jsx
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import http from "../api/http";

// Keep identical to SessionBootstrap's logic so slugs match everywhere
function codeFromUserId(userid = "") {
  let sum = 0;
  for (let i = 0; i < userid.length; i++) sum = (sum + userid.charCodeAt(i) * (i + 11)) % 1000;
  return String(sum).padStart(3, "0");
}
function slugify(name = "") {
  return (
    String(name)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "user"
  );
}

export default function PrettyGuard({ children }) {
  const { slug = "" } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function ensureCanonicalSlug() {
      // 1) If we already have a cached slug, prefer it immediately for a fast fix
      const cached = localStorage.getItem("app_slug");
      const pathSuffix = location.pathname.replace(/^\/[^/]+/, ""); // keep trailing path after the slug
      if (cached && cached !== slug) {
        if (!mounted) return;
        navigate(`/${encodeURIComponent(cached)}${pathSuffix}${location.search}${location.hash}`, {
          replace: true,
        });
        return;
      }

      // 2) Compute canonical from /api/auth/me (also refresh cache)
      try {
        const { data } = await http.get("/api/auth/me");
        if (!mounted) return;

        // Not authenticated? Let RequireAuth handle it; don't block UI here.
        if (!data?.authenticated) {
          setChecked(true);
          return;
        }

        const canonical = `${codeFromUserId(data.userid)}-${slugify(data.username)}`;
        if (cached !== canonical) {
          localStorage.setItem("app_slug", canonical);
        }

        // If the current slug differs, rewrite only the first path segment and keep the rest
        if (slug !== canonical) {
          navigate(
            `/${encodeURIComponent(canonical)}${pathSuffix}${location.search}${location.hash}`,
            { replace: true }
          );
          return;
        }
      } catch {
        // If /me fails, don't loop; RequireAuth will deal with session state.
      } finally {
        if (mounted) setChecked(true);
      }
    }

    ensureCanonicalSlug();
    return () => {
      mounted = false;
    };
    // Intentionally key only on pathname so we run when the first segment (slug) changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  if (!checked) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="animate-pulse">Preparing…</div>
      </div>
    );
  }
  return children;
}
