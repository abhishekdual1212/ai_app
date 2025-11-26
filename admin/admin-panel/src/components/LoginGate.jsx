import { useContext, useState } from "react";
import { AdminAuthContext } from "../state/AdminAuthContext";

export default function LoginGate() {
  const { login } = useContext(AdminAuthContext);
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [err, setErr] = useState("");

  const submit = (e) => {
    e.preventDefault();
    const ok = login(u.trim(), p.trim());
    if (!ok) setErr("Invalid credentials.");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#E6ECF6]">
      <form
        onSubmit={submit}
        className="bg-white rounded-2xl shadow-card p-8 w-[90%] max-w-md border border-[#ACC1E7]"
      >
        <h1 className="text-2xl font-semibold text-brand-primary text-center mb-6">
          Admin Login
        </h1>
        <label className="block text-sm text-gray-700 mb-1">Username</label>
        <input
          className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4 focus:outline-none focus:ring-1 focus:ring-brand-primary"
          value={u}
          onChange={(e) => setU(e.target.value)}
          placeholder="Enter admin username"
        />
        <label className="block text-sm text-gray-700 mb-1">Password</label>
        <input
          type="password"
          className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4 focus:outline-none focus:ring-1 focus:ring-brand-primary"
          value={p}
          onChange={(e) => setP(e.target.value)}
          placeholder="Enter password"
        />
        {err && <p className="text-red-600 text-sm mb-2">{err}</p>}
        <button
          type="submit"
          className="w-full bg-brand-primary text-white rounded-md py-2 hover:opacity-90 transition"
        >
          Sign In
        </button>
      </form>
    </div>
  );
}
