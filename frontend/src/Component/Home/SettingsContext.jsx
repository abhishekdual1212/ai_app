// src/Component/SettingsContext.jsx
import React, { createContext, useContext, useMemo, useState } from "react";

const SettingsCtx = createContext(null);

export function SettingsProvider({ children }) {
  const [open, setOpen] = useState(false);

  const api = useMemo(
    () => ({
      open: () => setOpen(true),
      close: () => setOpen(false),
      isOpen: open,
    }),
    [open]
  );

  return <SettingsCtx.Provider value={api}>{children}</SettingsCtx.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsCtx);
  if (!ctx) throw new Error("useSettings must be used within <SettingsProvider>");
  return ctx;
}
