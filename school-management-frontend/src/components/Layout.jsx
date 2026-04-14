import { Outlet, NavLink, useNavigate } from "react-router-dom";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: <DashIcon /> },
  { to: "/students",  label: "Students",  icon: <StudentsIcon /> },
  { to: "/tasks",     label: "Tasks",     icon: <TasksIcon /> },
];

export default function Layout() {
  const navigate = useNavigate();
  const user = (() => {
    try { return JSON.parse(localStorage.getItem("user")); } catch { return null; }
  })();

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  }

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      {/* ── Sidebar ── */}
      <aside style={{
        width: 240, background: "#111827", display: "flex",
        flexDirection: "column", padding: "0", flexShrink: 0,
      }}>
        {/* Brand */}
        <div style={{ padding: "28px 24px 24px", borderBottom: "1px solid #1f2937" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, background: "linear-gradient(135deg,#3b82f6,#6366f1)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
              </svg>
            </div>
            <div>
              <p style={{ color: "white", fontWeight: 800, fontSize: 15, letterSpacing: "-0.02em" }}>EduManage</p>
              <p style={{ color: "#6b7280", fontSize: 11, fontWeight: 500 }}>School System</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "16px 12px", display: "flex", flexDirection: "column", gap: 4 }}>
          <p style={{ color: "#4b5563", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "0 12px", marginBottom: 6 }}>Menu</p>
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} style={({ isActive }) => ({
              display: "flex", alignItems: "center", gap: 12,
              padding: "10px 14px", borderRadius: 10,
              background: isActive ? "linear-gradient(135deg,#3b82f6,#6366f1)" : "transparent",
              color: isActive ? "white" : "#9ca3af",
              fontWeight: 600, fontSize: 14, transition: "all 0.15s",
              textDecoration: "none",
            })}>
              {n.icon}
              {n.label}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div style={{ padding: "16px 16px 20px", borderTop: "1px solid #1f2937" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: "linear-gradient(135deg,#3b82f6,#6366f1)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 800, fontSize: 13 }}>
              {user?.username?.[0]?.toUpperCase() || "A"}
            </div>
            <div>
              <p style={{ color: "white", fontSize: 13, fontWeight: 700 }}>{user?.username || "Admin"}</p>
              <p style={{ color: "#6b7280", fontSize: 11 }}>Administrator</p>
            </div>
          </div>
          <button onClick={handleLogout} style={{ width: "100%", padding: "8px", borderRadius: 8, border: "1px solid #1f2937", background: "transparent", color: "#6b7280", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <LogoutIcon /> Sign out
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main style={{ flex: 1, overflow: "auto", background: "#f0f2f5" }}>
        <Outlet />
      </main>
    </div>
  );
}

function DashIcon()    { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>; }
function StudentsIcon(){ return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>; }
function TasksIcon()   { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>; }
function LogoutIcon()  { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>; }
