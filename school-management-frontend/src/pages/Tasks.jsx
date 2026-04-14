import { useState, useEffect } from "react";
import { tasksAPI, studentsAPI } from "../services/api";
import Modal from "../components/Modal";

const EMPTY = { title: "", description: "", studentId: "", status: "pending" };

export default function Tasks() {
  const [tasks,    setTasks]    = useState([]);
  const [students, setStudents] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState("all");
  const [search,   setSearch]   = useState("");
  const [modal,    setModal]    = useState(null);
  const [editing,  setEditing]  = useState(null);
  const [form,     setForm]     = useState(EMPTY);
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState("");
  const [toggling, setToggling] = useState(null); // id being toggled

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [tr, sr] = await Promise.all([tasksAPI.getAll(), studentsAPI.getAll()]);
        if (!cancelled) { setTasks(tr.data || []); setStudents(sr.data || []); }
      } catch (e) { console.error(e); }
      finally { if (!cancelled) setLoading(false); }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  function refresh() {
    tasksAPI.getAll().then(({ data }) => setTasks(data || [])).catch(console.error);
  }

  const counts = {
    all:       tasks.length,
    pending:   tasks.filter((t) => t.status === "pending").length,
    completed: tasks.filter((t) => t.status === "completed").length,
  };

  const filtered = tasks.filter((t) => {
    const ok1 = filter === "all" || t.status === filter;
    const ok2 = t.title?.toLowerCase().includes(search.toLowerCase()) ||
                t.studentId?.name?.toLowerCase().includes(search.toLowerCase());
    return ok1 && ok2;
  });

  function openAdd()   { setForm(EMPTY); setError(""); setModal("add"); }
  function openEdit(t) {
    setEditing(t);
    setForm({ title: t.title, description: t.description || "", studentId: t.studentId?._id || t.studentId || "", status: t.status });
    setError(""); setModal("edit");
  }
  function closeModal() { setModal(null); setEditing(null); setError(""); }
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function handleSave(e) {
    e.preventDefault(); setSaving(true); setError("");
    try {
      const payload = {
        title:       form.title,
        status:      form.status,
        ...(form.description && { description: form.description }),
        ...(form.studentId   && { studentId:   form.studentId }),
      };
      if (modal === "add") await tasksAPI.create(payload);
      else                 await tasksAPI.update(editing._id, payload);
      closeModal(); refresh();
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to save task");
    } finally { setSaving(false); }
  }

  // Optimistic status toggle
  async function toggleStatus(t) {
    const next = t.status === "pending" ? "completed" : "pending";
    setToggling(t._id);
    // Optimistically update UI first
    setTasks((prev) => prev.map((x) => x._id === t._id ? { ...x, status: next } : x));
    try {
      await tasksAPI.update(t._id, {
        title:       t.title,
        description: t.description,
        studentId:   t.studentId?._id || t.studentId,
        status:      next,
      });
    } catch (err) {
      // Revert on failure
      setTasks((prev) => prev.map((x) => x._id === t._id ? { ...x, status: t.status } : x));
      console.error("Toggle failed:", err.message);
    } finally { setToggling(null); }
  }

  return (
    <div style={{ padding: 32, maxWidth: 1200 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "#111827", letterSpacing: "-0.03em" }}>Tasks</h1>
          <p style={{ color: "#6b7280", marginTop: 4, fontSize: 14 }}>{tasks.length} total task{tasks.length !== 1 ? "s" : ""}</p>
        </div>
        <button onClick={openAdd} style={BTN_PRIMARY}>+ Add Task</button>
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {[{ key: "all", label: "All" }, { key: "pending", label: "Pending" }, { key: "completed", label: "Completed" }].map((tab) => (
          <button key={tab.key} onClick={() => setFilter(tab.key)} style={{
            display: "flex", alignItems: "center", gap: 7,
            padding: "8px 16px", borderRadius: 9, border: "1.5px solid",
            borderColor: filter === tab.key ? "#111827" : "#e5e7eb",
            background:  filter === tab.key ? "#111827"  : "white",
            color:       filter === tab.key ? "white"    : "#6b7280",
            fontSize: 13, fontWeight: 600, transition: "all 0.15s",
          }}>
            {tab.label}
            <span style={{ background: filter === tab.key ? "rgba(255,255,255,0.2)" : "#f3f4f6", color: filter === tab.key ? "white" : "#6b7280", padding: "1px 7px", borderRadius: 12, fontSize: 11, fontWeight: 700 }}>
              {counts[tab.key]}
            </span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div style={{ display: "flex", alignItems: "center", gap: 9, background: "white", border: "1.5px solid #e5e7eb", borderRadius: 10, padding: "9px 14px", marginBottom: 20, maxWidth: 360 }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by title or student…" style={{ border: "none", outline: "none", fontSize: 14, width: "100%", background: "transparent" }} />
      </div>

      {/* Table */}
      {loading
        ? <p style={{ color: "#9ca3af", fontSize: 14 }}>Loading tasks…</p>
        : <div style={{ background: "white", borderRadius: 14, border: "1px solid #e5e7eb", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead><tr style={{ background: "#f9fafb" }}>
                {["Title","Assigned To","Status","Created","Actions"].map((h) => <th key={h} style={TH}>{h}</th>)}
              </tr></thead>
              <tbody>
                {filtered.length === 0 && <tr><td colSpan={5} style={{ padding: 40, textAlign: "center", color: "#d1d5db" }}>No tasks found</td></tr>}
                {filtered.map((t) => (
                  <tr key={t._id} style={{ borderTop: "1px solid #f3f4f6" }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "#fafafa"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "white"}>
                    <td style={TD}>
                      <p style={{ fontWeight: 700, color: "#111827", margin: 0 }}>{t.title}</p>
                      {t.description && <p style={{ color: "#9ca3af", fontSize: 12, margin: "2px 0 0" }}>{t.description.slice(0,55)}{t.description.length > 55 ? "…" : ""}</p>}
                    </td>
                    <td style={{ ...TD, color: "#6b7280" }}>
                      {t.studentId?.name
                        ? <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                            <div style={{ width: 26, height: 26, borderRadius: 7, background: "#eff6ff", color: "#1d4ed8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800 }}>
                              {t.studentId.name[0].toUpperCase()}
                            </div>
                            {t.studentId.name}
                          </div>
                        : "—"
                      }
                    </td>
                    <td style={TD}>
                      {/* Click to toggle status */}
                      <button onClick={() => toggleStatus(t)} disabled={toggling === t._id}
                        title="Click to toggle status"
                        style={{
                          display: "inline-flex", alignItems: "center", gap: 5,
                          border: "none", borderRadius: 20, padding: "5px 12px",
                          fontSize: 12, fontWeight: 700, cursor: toggling === t._id ? "wait" : "pointer",
                          background: t.status === "completed" ? "#ecfdf5" : "#fffbeb",
                          color:      t.status === "completed" ? "#059669"  : "#d97706",
                          textTransform: "capitalize", transition: "opacity 0.15s",
                          opacity: toggling === t._id ? 0.6 : 1,
                        }}>
                        {t.status === "completed"
                          ? <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                          : <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="8"/></svg>
                        }
                        {t.status}
                      </button>
                    </td>
                    <td style={{ ...TD, color: "#9ca3af" }}>{new Date(t.createdAt).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}</td>
                    <td style={TD}>
                      <button onClick={() => openEdit(t)} style={BTN_ICON} title="Edit">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4z"/></svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
      }

      {/* Add / Edit Modal */}
      {(modal === "add" || modal === "edit") && (
        <Modal title={modal === "add" ? "Add Task" : "Edit Task"} onClose={closeModal}>
          <form onSubmit={handleSave}>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={LBL}>Title *</label>
                <input value={form.title} onChange={set("title")} placeholder="e.g. Complete assignment" required style={INPUT} />
              </div>
              <div>
                <label style={LBL}>Description</label>
                <textarea value={form.description} onChange={set("description")} placeholder="Optional details…" rows={3} style={{ ...INPUT, resize: "vertical" }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <label style={LBL}>Assign to Student</label>
                  <select value={form.studentId} onChange={set("studentId")} style={INPUT}>
                    <option value="">— None —</option>
                    {students.map((s) => <option key={s._id} value={s._id}>{s.name} ({s.class})</option>)}
                  </select>
                </div>
                <div>
                  <label style={LBL}>Status</label>
                  <select value={form.status} onChange={set("status")} style={INPUT}>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
            </div>
            {error && <div style={ERR}>{error}</div>}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 22 }}>
              <button type="button" onClick={closeModal} style={BTN_GHOST}>Cancel</button>
              <button type="submit" disabled={saving} style={BTN_PRIMARY}>{saving ? "Saving…" : "Save Task"}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

const TH         = { padding: "11px 18px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em" };
const TD         = { padding: "13px 18px", verticalAlign: "middle" };
const BTN_PRIMARY= { background: "linear-gradient(135deg,#3b82f6,#6366f1)", color: "white", border: "none", borderRadius: 9, padding: "10px 20px", fontSize: 14, fontWeight: 700 };
const BTN_GHOST  = { background: "none", border: "1.5px solid #e5e7eb", borderRadius: 9, padding: "10px 18px", fontSize: 14, fontWeight: 600, color: "#6b7280" };
const BTN_ICON   = { background: "none", border: "1.5px solid #e5e7eb", borderRadius: 8, padding: "6px 8px", color: "#6b7280", display: "flex", alignItems: "center" };
const INPUT      = { width: "100%", padding: "10px 12px", border: "1.5px solid #e5e7eb", borderRadius: 9, fontSize: 14, outline: "none" };
const LBL        = { display: "block", fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 6 };
const ERR        = { background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", borderRadius: 8, padding: "9px 13px", fontSize: 13, fontWeight: 600, marginTop: 12 };
