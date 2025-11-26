import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { verifyAdminCredentials } from "../lib/api";

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("shivam07");
  const [password, setPassword] = useState("tomar25");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const { success, token } = await verifyAdminCredentials(
        username.trim(),
        password
      );
      if (success) {
        sessionStorage.setItem("admin_auth", token);
        sessionStorage.setItem("admin_user", JSON.stringify({ username: username.trim() }));
        navigate("/", { replace: true });
      }
    } catch (e) {
      setErr("Invalid credentials or server error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh bg-[#F5F7FB] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white border border-[#E6ECF6] rounded-2xl shadow-sm p-6">
        <h1 className="text-xl font-semibold text-[#2F5EAC] mb-1">Admin Login</h1>
        <p className="text-sm text-[#6A6A6A] mb-5">Enter your admin credentials to continue.</p>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm text-[#2E2E2E] mb-1">Username</label>
            <input
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="shivam07"
              className="w-full bg-white border border-[#E6ECF6] rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#2F5EAC33]"
            />
          </div>

          <div>
            <label className="block text-sm text-[#2E2E2E] mb-1">Password</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="••••••••"
              className="w-full bg-white border border-[#E6ECF6] rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#2F5EAC33]"
            />
          </div>

          {err ? <div className="text-sm text-red-600">{err}</div> : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#2F5EAC] hover:bg-[#244b90] text-white rounded-md px-4 py-2 text-sm font-semibold disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <div className="mt-4 text-xs text-[#6A6A6A]">
          Tip: default credentials are <b>shivam07</b> / <b>tomar25</b>
        </div>
      </div>
    </div>
  );
}
