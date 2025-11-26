import { createContext, useContext, useMemo, useState } from "react";

const AdminNavCtx = createContext(null);

export function AdminNavProvider({ children }) {
  const [selectedUser, setSelectedUser] = useState(null); // { uid, displayName, email } | null
  const [section, setSection] = useState("");             // "DIY Lawyer" | "DIY Startups" | "services" | "Direct Orders" | ""

  const clearNav = () => {
    setSelectedUser(null);
    setSection("");
  };

  const value = useMemo(
    () => ({
      selectedUser,
      setSelectedUser,
      section,
      setSection,
      clearNav,
    }),
    [selectedUser, section]
  );

  return <AdminNavCtx.Provider value={value}>{children}</AdminNavCtx.Provider>;
}

export function useAdminNav() {
  const ctx = useContext(AdminNavCtx);
  if (!ctx) {
    throw new Error("useAdminNav must be used within <AdminNavProvider>");
  }
  return ctx;
}
