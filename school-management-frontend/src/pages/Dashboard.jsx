import { useState, useEffect } from "react";
import { studentsAPI, tasksAPI } from "../services/api";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [tasks,    setTasks]    = useState([]);
  const [loading,  setLoading]  = useState(true);

  // Plain useEffect with [] — runs exactly once, no re-render loop
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [sr, tr] = await Promise.all([studentsAPI.getAll(), tasksAPI.getAll()]);
        if (!cancelled) {
          setStudents(sr.data || []);
          setTasks(tr.data    || []);
        }
      } catch (e) {
        console.error("Dashboard error:", e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; }; // cleanup prevents state update on unmount
  }, []);

  const pending   = tasks.filter((t) => t.status === "pending").length;
  const completed = tasks.filter((t) => t.status === "completed").length;

  const STATS = [
    { label: "Total Students", value: students.length, color: "#3b82f6", light: "#eff6ff",  icon: "👥", path: "/students" },
    { label: "Total Tasks",    value: tasks.length,    color: "#8b5cf6", light: "#f5f3ff",  icon: "📋", path: "/tasks"    },
    { label: "Pending Tasks",  value: pending,         color: "#f59e0b", light: "#fffbeb",  icon: "⏳", path: "/tasks"    },
    { label: "Completed",      value: completed,       color: "#10b981", light: "#ecfdf5",  icon: "✅", path: "/tasks"    },
  ];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const user = (() => { try { return JSON.parse(localStorage.getItem("user")); } catch { return null; } })();

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", gap: 12, color: "#6b7280", fontSize: 15 }}>
        <div style={{ width: 20, height: 20, border: "2px solid #e5e7eb", borderTop: "2px solid #3b82f6", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        Loading dashboard…
      </div>
    );
  }

  return (
    <div style={{ padding: 32, maxWidth: 1200 }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "#111827", letterSpacing: "-0.03em" }}>
          {greeting}, {user?.username || "Admin"} 👋
        </h1>
        <p style={{ color: "#6b7280", marginTop: 4, fontSize: 14 }}>
          {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 32 }}>
        {STATS.map((s) => (
          <div key={s.label} onClick={() => navigate(s.path)}
            style={{ background: s.light, borderRadius: 14, padding: "20px 22px", border: `1px solid ${s.color}22`, cursor: "pointer", transition: "transform 0.15s, box-shadow 0.15s" }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.08)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: s.color, textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.label}</p>
              <span style={{ fontSize: 20 }}>{s.icon}</span>
            </div>
            <p style={{ fontSize: 38, fontWeight: 800, color: "#111827", lineHeight: 1, letterSpacing: "-0.04em" }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tables */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* Recent Students */}
        <div style={{ background: "white", borderRadius: 14, border: "1px solid #e5e7eb", overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#111827" }}>Recent Students</h2>
            <button onClick={() => navigate("/students")} style={{ background: "none", border: "none", color: "#3b82f6", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>View all →</button>
          </div>
          {students.length === 0
            ? <p style={{ padding: 24, textAlign: "center", color: "#d1d5db", fontSize: 14 }}>No students yet</p>
            : <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead><tr style={{ background: "#f9fafb" }}>
                  {["Name","Class","Age"].map((h) => <th key={h} style={TH}>{h}</th>)}
                </tr></thead>
                <tbody>
                  {[...students].reverse().slice(0,5).map((s) => (
                    <tr key={s._id} style={{ borderTop: "1px solid #f3f4f6" }}>
                      <td style={TD}><div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                        <div style={{ ...AV, background: palette(s.name).bg, color: palette(s.name).fg }}>{s.name?.[0]?.toUpperCase()}</div>
                        <span style={{ fontWeight: 600, color: "#111827" }}>{s.name}</span>
                      </div></td>
                      <td style={TD}><span style={badge("#eff6ff","#1d4ed8")}>{s.class}</span></td>
                      <td style={{ ...TD, color: "#9ca3af" }}>{s.age ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
          }
        </div>

        {/* Recent Tasks */}
        <div style={{ background: "white", borderRadius: 14, border: "1px solid #e5e7eb", overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#111827" }}>Recent Tasks</h2>
            <button onClick={() => navigate("/tasks")} style={{ background: "none", border: "none", color: "#3b82f6", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>View all →</button>
          </div>
          {tasks.length === 0
            ? <p style={{ padding: 24, textAlign: "center", color: "#d1d5db", fontSize: 14 }}>No tasks yet</p>
            : <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead><tr style={{ background: "#f9fafb" }}>
                  {["Title","Student","Status"].map((h) => <th key={h} style={TH}>{h}</th>)}
                </tr></thead>
                <tbody>
                  {[...tasks].reverse().slice(0,5).map((t) => (
                    <tr key={t._id} style={{ borderTop: "1px solid #f3f4f6" }}>
                      <td style={{ ...TD, fontWeight: 600, color: "#111827", maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.title}</td>
                      <td style={{ ...TD, color: "#6b7280" }}>{t.studentId?.name ?? "—"}</td>
                      <td style={TD}>
                        <span style={badge(
                          t.status === "completed" ? "#ecfdf5" : "#fffbeb",
                          t.status === "completed" ? "#059669" : "#d97706"
                        )}>{t.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
          }
        </div>
      </div>
    </div>
  );
}

const TH = { padding: "10px 18px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em" };
const TD = { padding: "12px 18px", verticalAlign: "middle" };
const AV = { width: 30, height: 30, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, flexShrink: 0 };
const badge = (bg, color) => ({ background: bg, color, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, textTransform: "capitalize", display: "inline-block" });
const PALETTES = [{ bg:"#eff6ff",fg:"#1d4ed8"},{bg:"#f5f3ff",fg:"#6d28d9"},{bg:"#fdf2f8",fg:"#be185d"},{bg:"#ecfdf5",fg:"#065f46"},{bg:"#fff7ed",fg:"#c2410c"}];
const palette = (name) => PALETTES[(name?.charCodeAt(0) || 0) % PALETTES.length];
