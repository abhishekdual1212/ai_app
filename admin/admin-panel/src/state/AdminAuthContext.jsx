import { createContext, useState } from "react";

export const AdminAuthContext = createContext({
  isAuthed: false,
  authHeader: "",
  login: (_u, _p) => {},
  logout: () => {},
});

export const AdminAuthProvider = ({ children }) => {
  const [isAuthed, setIsAuthed] = useState(false);
  const [authHeader, setAuthHeader] = useState("");

  const login = (username, password) => {
    // Fixed credentials (as requested)
    if (username === "shivam07" && password === "tomar25") {
      const token = btoa(`${username}:${password}`);
      setAuthHeader(`Basic ${token}`);
      setIsAuthed(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthed(false);
    setAuthHeader("");
  };

  return (
    <AdminAuthContext.Provider value={{ isAuthed, authHeader, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};
