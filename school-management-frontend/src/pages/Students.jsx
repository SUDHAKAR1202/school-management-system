import { useState, useEffect } from "react";
import { studentsAPI } from "../services/api";
import Modal from "../components/Modal";

const EMPTY = { name: "", class: "", age: "" };
const PALETTES = [{ bg:"#eff6ff",fg:"#1d4ed8"},{bg:"#f5f3ff",fg:"#6d28d9"},{bg:"#fdf2f8",fg:"#be185d"},{bg:"#ecfdf5",fg:"#065f46"},{bg:"#fff7ed",fg:"#c2410c"}];
const pal = (n) => PALETTES[(n?.charCodeAt(0)||0) % PALETTES.length];

export default function Students() {
  const [students, setStudents] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [modal,    setModal]    = useState(null); // "add" | "edit" | "delete"
  const [editing,  setEditing]  = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [form,     setForm]     = useState(EMPTY);
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState("");

  useEffect(() => {
    let cancelled = false;
    studentsAPI.getAll()
      .then(({ data }) => { if (!cancelled) setStudents(data || []); })
      .catch(console.error)
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  function refresh() {
    studentsAPI.getAll().then(({ data }) => setStudents(data || [])).catch(console.error);
  }

  const filtered = students.filter((s) =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.class?.toLowerCase().includes(search.toLowerCase())
  );

  function openAdd()   { setForm(EMPTY); setError(""); setModal("add"); }
  function openEdit(s) { setEditing(s); setForm({ name: s.name, class: s.class, age: s.age ?? "" }); setError(""); setModal("edit"); }
  function openDel(s)  { setDeleting(s); setModal("delete"); }
  function closeModal(){ setModal(null); setEditing(null); setDeleting(null); setError(""); }
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true); setError("");
    try {
      const payload = { name: form.name, class: form.class, ...(form.age !== "" && { age: Number(form.age) }) };
      if (modal === "add") await studentsAPI.create(payload);
      else                 await studentsAPI.update(editing._id, payload);
      closeModal(); refresh();
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to save");
    } finally { setSaving(false); }
  }

  async function handleDelete() {
    setSaving(true);
    try { await studentsAPI.remove(deleting._id); closeModal(); refresh(); }
    catch (err) { setError(err.response?.data?.msg || "Failed to delete"); }
    finally { setSaving(false); }
  }

  return (
    <div style={{ padding: 32, maxWidth: 1200 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "#111827", letterSpacing: "-0.03em" }}>Students</h1>
          <p style={{ color: "#6b7280", marginTop: 4, fontSize: 14 }}>{students.length} enrolled student{students.length !== 1 ? "s" : ""}</p>
        </div>
        <button onClick={openAdd} style={BTN_PRIMARY}>+ Add Student</button>
      </div>

      {/* Search */}
      <div style={{ display: "flex", alignItems: "center", gap: 9, background: "white", border: "1.5px solid #e5e7eb", borderRadius: 10, padding: "9px 14px", marginBottom: 20, maxWidth: 340 }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or class…" style={{ border: "none", outline: "none", fontSize: 14, width: "100%", background: "transparent" }} />
      </div>

      {/* Table */}
      {loading
        ? <p style={{ color: "#9ca3af", fontSize: 14 }}>Loading students…</p>
        : <div style={{ background: "white", borderRadius: 14, border: "1px solid #e5e7eb", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead><tr style={{ background: "#f9fafb" }}>
                {["Student","Class","Age","Added On","Actions"].map((h) => <th key={h} style={TH}>{h}</th>)}
              </tr></thead>
              <tbody>
                {filtered.length === 0 && <tr><td colSpan={5} style={{ padding: 40, textAlign: "center", color: "#d1d5db" }}>No students found</td></tr>}
                {filtered.map((s) => (
                  <tr key={s._id} style={{ borderTop: "1px solid #f3f4f6" }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "#fafafa"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "white"}>
                    <td style={TD}>
                      <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: pal(s.name).bg, color: pal(s.name).fg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800 }}>
                          {s.name?.[0]?.toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 700, color: "#111827" }}>{s.name}</span>
                      </div>
                    </td>
                    <td style={TD}><span style={{ background: "#eff6ff", color: "#1d4ed8", fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 20 }}>{s.class}</span></td>
                    <td style={{ ...TD, color: "#6b7280" }}>{s.age ?? "—"}</td>
                    <td style={{ ...TD, color: "#9ca3af" }}>{new Date(s.createdAt).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}</td>
                    <td style={TD}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={() => openEdit(s)} style={BTN_ICON} title="Edit">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4z"/></svg>
                        </button>
                        <button onClick={() => openDel(s)} style={{ ...BTN_ICON, borderColor: "#fecaca", color: "#dc2626" }} title="Delete">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6M9 6V4h6v2"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
      }

      {/* Add / Edit Modal */}
      {(modal === "add" || modal === "edit") && (
        <Modal title={modal === "add" ? "Add Student" : "Edit Student"} onClose={closeModal}>
          <form onSubmit={handleSave}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
              <div>
                <label style={LBL}>Full Name *</label>
                <input value={form.name} onChange={set("name")} placeholder="e.g. Ravi Kumar" required style={INPUT} />
              </div>
              <div>
                <label style={LBL}>Class *</label>
                <input value={form.class} onChange={set("class")} placeholder="e.g. 10-A" required style={INPUT} />
              </div>
            </div>
            <div style={{ maxWidth: 160 }}>
              <label style={LBL}>Age</label>
              <input type="number" min="3" max="25" value={form.age} onChange={set("age")} placeholder="e.g. 15" style={INPUT} />
            </div>
            {error && <div style={ERR}>{error}</div>}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 22 }}>
              <button type="button" onClick={closeModal} style={BTN_GHOST}>Cancel</button>
              <button type="submit" disabled={saving} style={BTN_PRIMARY}>{saving ? "Saving…" : "Save Student"}</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Modal */}
      {modal === "delete" && (
        <Modal title="Delete Student" onClose={closeModal}>
          <p style={{ color: "#4b5563", lineHeight: 1.6, marginBottom: 20 }}>
            Are you sure you want to delete <strong style={{ color: "#111827" }}>{deleting?.name}</strong>?
            <br /><span style={{ fontSize: 13, color: "#9ca3af" }}>This cannot be undone.</span>
          </p>
          {error && <div style={ERR}>{error}</div>}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <button onClick={closeModal} style={BTN_GHOST}>Cancel</button>
            <button onClick={handleDelete} disabled={saving} style={{ ...BTN_PRIMARY, background: "#dc2626" }}>{saving ? "Deleting…" : "Delete"}</button>
          </div>
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
