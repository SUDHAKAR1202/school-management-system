import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm]     = useState({ username: "", password: "" });
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data } = await authAPI.login(form);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify({ username: form.username }));
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.response?.data?.msg || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  }

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div style={{ minHeight: "100vh", display: "flex", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Left */}
      <div style={{ flex: 1.1, background: "#111827", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "48px 56px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, background: "linear-gradient(135deg,#3b82f6,#6366f1)", borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
            </svg>
          </div>
          <span style={{ color: "white", fontWeight: 800, fontSize: 18, letterSpacing: "-0.02em" }}>EduManage</span>
        </div>
        <div>
          <h1 style={{ color: "white", fontSize: 44, fontWeight: 800, lineHeight: 1.12, letterSpacing: "-0.03em", marginBottom: 16 }}>
            School management,<br />made simple.
          </h1>
          <p style={{ color: "#6b7280", fontSize: 16, lineHeight: 1.7, maxWidth: 380 }}>
            Manage students, assign tasks, and track progress — all from one clean admin dashboard.
          </p>
        </div>
        <div style={{ display: "flex", gap: 32 }}>
          {[["Students", "Managed"], ["Tasks", "Tracked"], ["Admin", "Roles"]].map(([n, l]) => (
            <div key={n}>
              <p style={{ color: "#3b82f6", fontWeight: 800, fontSize: 22 }}>{n}</p>
              <p style={{ color: "#4b5563", fontSize: 12, fontWeight: 600 }}>{l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right */}
      <div style={{ flex: 1, background: "#f9fafb", display: "flex", alignItems: "center", justifyContent: "center", padding: 32 }}>
        <div style={{ background: "white", borderRadius: 20, padding: "40px 36px", width: "100%", maxWidth: 400, boxShadow: "0 4px 40px rgba(0,0,0,0.08)", border: "1px solid #e5e7eb" }}>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: "#111827", marginBottom: 4, letterSpacing: "-0.03em" }}>Welcome back</h2>
          <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 28 }}>Sign in to your admin account</p>

          <form onSubmit={handleSubmit} autoComplete="off">
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 6 }}>Username</label>
                <input type="text" value={form.username} onChange={set("username")} placeholder="Enter username" autoComplete="off" required
                  style={{ width: "100%", padding: "11px 14px", border: "1.5px solid #e5e7eb", borderRadius: 10, fontSize: 14, outline: "none" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 6 }}>Password</label>
                <input type="password" value={form.password} onChange={set("password")} placeholder="••••••••" autoComplete="new-password" required
                  style={{ width: "100%", padding: "11px 14px", border: "1.5px solid #e5e7eb", borderRadius: 10, fontSize: 14, outline: "none" }} />
              </div>
              {error && <div style={{ background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", borderRadius: 9, padding: "10px 14px", fontSize: 13, fontWeight: 600 }}>{error}</div>}
              <button type="submit" disabled={loading} style={{ padding: "12px", background: "linear-gradient(135deg,#3b82f6,#6366f1)", color: "white", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, marginTop: 4, opacity: loading ? 0.7 : 1 }}>
                {loading ? "Signing in…" : "Sign In"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
