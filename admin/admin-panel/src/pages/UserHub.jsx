import { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAdminNav } from "../store/adminNav";
import { getAdminUsers } from "../lib/api";

export default function UserHub() {
  const { uid } = useParams();
  const { selectedUser, setSelectedUser, setSection } = useAdminNav();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const options = useMemo(
    () => [
      { key: "DIY", label: "DIY Lawyer", kind: "diy" },
      { key: "DIY_STARTUP", label: "DIY Startups", kind: "startup" },
      { key: "Intent", label: "Services", kind: "intent" },
      { key: "Direct", label: "Direct Orders", kind: "direct" },
    ],
    []
  );

  const handleChooseOption = useCallback((opt) => {
    if (!currentUser) return;
    setSelectedUser({ uid: currentUser.uid, displayName: currentUser.displayName, email: currentUser.email });
    setSection(opt.label);
    navigate(`/user/${encodeURIComponent(currentUser.uid)}/orders/${opt.kind}`);
  }, [currentUser, setSelectedUser, setSection, navigate]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        // If selectedUser not set (direct URL), fetch minimal info
        if (!selectedUser || selectedUser.uid !== uid) {
          const res = await getAdminUsers({ limit: 200 });
          const u = (res?.data || []).find((x) => x.uid === uid);
          if (u) {
            // Log all user data to the console as requested
            console.log("Full user data:", u);
            setSelectedUser({ uid: u.uid, displayName: u.displayName, email: u.email });
            setCurrentUser(u);
          } else {
            // Handle case where user is not found
            setCurrentUser({ uid, displayName: "Unknown User", email: "" });
          }
        } else {
          setCurrentUser(selectedUser);
        }
        setSection("");
      } finally {
        setLoading(false);
      }
    })();
  }, [uid, selectedUser, setSelectedUser, setSection]);

  if (!currentUser) {
    return <div className="max-w-7xl mx-auto px-4 py-8 text-sm text-[#6A6A6A]">Loading user details...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {loading ? (
        <div className="text-sm text-[#6A6A6A]">Loading…</div>
      ) : (
        <>
          <div className="bg-white border border-[#E6ECF6] rounded-2xl p-6 space-y-4">
            <div className="text-[#2E2E2E] text-lg font-semibold">
              Select an option for {currentUser.displayName || currentUser.email || currentUser.uid}
            </div>
            <p className="text-sm text-[#6A6A6A]">
              Choose one of the following sections to view orders for this user.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-[#2F5EAC] text-sm">
              {options.map((opt) => (
                <button
                  key={opt.key}
                  className="w-full text-left py-3 px-4 hover:bg-[#2F5EAC14] border border-[#2F5EAC40] rounded-md shadow-sm"
                  onClick={() => handleChooseOption(opt)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
