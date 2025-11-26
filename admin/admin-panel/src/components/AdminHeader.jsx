import { useNavigate } from "react-router-dom";
import { useAdminNav } from "../store/adminNav";
import { LogOut, ChevronRight } from "lucide-react";
import { signOutAdmin } from "../lib/api";

const BRAND = "#2F5EAC";

export default function AdminHeader() {
  const navigate = useNavigate();
  const {
    selectedUser,
    setSelectedUser,
    section,
    setSection,
  } = useAdminNav();

  const goUsers = () => {
    // reset the “crumbs” and go back to users grid
    setSelectedUser(null);
    setSection("");
    navigate("/", { replace: true });
  };

  const goUser = () => {
    if (!selectedUser?.uid) return;
    // keep selected user but clear the section so the hub/chooser shows
    setSection("");
    navigate(`/user/${encodeURIComponent(selectedUser.uid)}`);
  };

  const goSection = () => {
    if (!selectedUser?.uid || !section) return;
    navigate(`/user/${encodeURIComponent(selectedUser.uid)}/orders/${labelToKind(section)}`);
  };

  const signOut = () => {
    signOutAdmin();
    setSelectedUser(null);
    setSection("");
    navigate("/login", { replace: true });
  };

  return (
    <div className="sticky top-0 z-10 bg-white border-b border-[#E6ECF6]">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Left: breadcrumb tokens */}
        <div className="flex items-center gap-2">
          {/* Users token */}
          <button
            onClick={goUsers}
            className="text-xl font-semibold"
            style={{ color: BRAND }}
            title="Back to users"
          >
            Users
          </button>

          {/* Username token */}
          {selectedUser ? (
            <>
              <ChevronRight className="w-4 h-4 text-[#9AA4B2]" />
              <button
                onClick={goUser}
                className="text-base font-medium hover:underline"
                style={{ color: BRAND }}
                title="Choose a service"
              >
                {selectedUser.displayName || selectedUser.email || selectedUser.uid}
              </button>
            </>
          ) : null}

          {/* Section token */}
          {selectedUser && section ? (
            <>
              <ChevronRight className="w-4 h-4 text-[#9AA4B2]" />
              <button
                onClick={goSection}
                className="text-base hover:underline"
                style={{ color: BRAND }}
                title="Open orders list"
              >
                {section}
              </button>
            </>
          ) : null}
        </div>

        {/* Right: sign out */}
        <button
          onClick={signOut}
          className="inline-flex items-center gap-2 text-sm"
          style={{ color: BRAND }}
        >
          <LogOut className="w-4 h-4" />
          <span>Sign out</span>
        </button>
      </div>
    </div>
  );
}

/** Maps UI label to route `:kind` segment */
function labelToKind(label) {
  const L = String(label || "").toLowerCase();
  if (L.includes("startup")) return "startup";
  if (L.includes("direct")) return "direct";
  if (L.includes("service")) return "intent";
  return "diy"; // default “DIY Lawyer”
}
