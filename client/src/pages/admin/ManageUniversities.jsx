import React, { useEffect, useState, useCallback } from "react";
import adminApi from "../../services/adminApi.js";
import Sidebar from "../../components/admin/Sidebar.jsx";
import DataTable from "../../components/admin/DataTable.jsx";

const uniEmpty = { name: "", code: "", district: "", province: "", website: "", logoUrl: "" };
const progEmpty = { name: "", code: "", universityId: "", stream: "Maths", durationYears: "", degreeType: "BSc", careerTags: "", isActive: true };
const streamOptions = ["Maths", "Bio", "Commerce", "Arts", "Tech"];

export default function ManageUniversities() {
  const [tab, setTab] = useState("universities");

  // Universities
  const [unis, setUnis] = useState([]);
  const [uniMeta, setUniMeta] = useState({});
  const [uniLoading, setUniLoading] = useState(true);
  const [uniSearch, setUniSearch] = useState("");
  const [uniPage, setUniPage] = useState(1);
  const [uniModal, setUniModal] = useState(false);
  const [uniEditing, setUniEditing] = useState(null);
  const [uniForm, setUniForm] = useState(uniEmpty);

  // Programs
  const [progs, setProgs] = useState([]);
  const [progMeta, setProgMeta] = useState({});
  const [progLoading, setProgLoading] = useState(true);
  const [progSearch, setProgSearch] = useState("");
  const [progPage, setProgPage] = useState(1);
  const [progUniFilter, setProgUniFilter] = useState("");
  const [progStreamFilter, setProgStreamFilter] = useState("");
  const [progModal, setProgModal] = useState(false);
  const [progEditing, setProgEditing] = useState(null);
  const [progForm, setProgForm] = useState(progEmpty);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Fetch universities
  const fetchUnis = useCallback(async () => {
    setUniLoading(true);
    try {
      const { data } = await adminApi.get("/universities", { params: { search: uniSearch, page: uniPage, limit: 10 } });
      setUnis(data.data);
      setUniMeta(data.meta);
    } catch (err) { console.error(err); }
    setUniLoading(false);
  }, [uniSearch, uniPage]);

  // Fetch programs
  const fetchProgs = useCallback(async () => {
    setProgLoading(true);
    try {
      const params = { search: progSearch, page: progPage, limit: 10 };
      if (progUniFilter) params.universityId = progUniFilter;
      if (progStreamFilter) params.stream = progStreamFilter;
      const { data } = await adminApi.get("/programs", { params });
      setProgs(data.data);
      setProgMeta(data.meta);
    } catch (err) { console.error(err); }
    setProgLoading(false);
  }, [progSearch, progPage, progUniFilter, progStreamFilter]);

  useEffect(() => { fetchUnis(); }, [fetchUnis]);
  useEffect(() => { fetchProgs(); }, [fetchProgs]);

  // ── University CRUD ──
  function openUniCreate() { setUniEditing(null); setUniForm({ ...uniEmpty }); setError(""); setUniModal(true); }
  function openUniEdit(row) {
    setUniEditing(row._id);
    setUniForm({ name: row.name, code: row.code, district: row.district, province: row.province || "", website: row.website || "", logoUrl: row.logoUrl || "" });
    setError(""); setUniModal(true);
  }
  async function saveUni(e) {
    e.preventDefault(); setSaving(true); setError("");
    try {
      if (uniEditing) await adminApi.put(`/universities/${uniEditing}`, uniForm);
      else await adminApi.post("/universities", uniForm);
      setUniModal(false); fetchUnis();
    } catch (err) { setError(err.response?.data?.message || "Save failed"); }
    setSaving(false);
  }
  async function deleteUni(id) { if (!confirm("Delete university?")) return; await adminApi.delete(`/universities/${id}`); fetchUnis(); }

  // ── Program CRUD ──
  function openProgCreate() { setProgEditing(null); setProgForm({ ...progEmpty }); setError(""); setProgModal(true); }
  function openProgEdit(row) {
    setProgEditing(row._id);
    setProgForm({
      name: row.name, code: row.code,
      universityId: row.universityId?._id || row.universityId || "",
      stream: row.stream, durationYears: row.durationYears ?? "",
      degreeType: row.degreeType || "BSc",
      careerTags: (row.careerTags || []).join(", "),
      isActive: row.isActive ?? true,
    });
    setError(""); setProgModal(true);
  }
  async function saveProg(e) {
    e.preventDefault(); setSaving(true); setError("");
    const body = { ...progForm, durationYears: Number(progForm.durationYears), careerTags: progForm.careerTags.split(",").map(s => s.trim()).filter(Boolean) };
    try {
      if (progEditing) await adminApi.put(`/programs/${progEditing}`, body);
      else await adminApi.post("/programs", body);
      setProgModal(false); fetchProgs();
    } catch (err) { setError(err.response?.data?.message || "Save failed"); }
    setSaving(false);
  }
  async function deleteProg(id) { if (!confirm("Delete program?")) return; await adminApi.delete(`/programs/${id}`); fetchProgs(); }

  // ── Columns ──
  const uniCols = [
    { key: "name", label: "Name" },
    { key: "code", label: "Code" },
    { key: "district", label: "District" },
    { key: "actions", label: "Actions", render: (r) => (
      <div style={{ display: "flex", gap: 6 }}>
        <button className="btn secondary" onClick={() => openUniEdit(r)}>Edit</button>
        <button className="btn secondary" style={{ color: "#dc2626" }} onClick={() => deleteUni(r._id)}>Delete</button>
        <button className="btn secondary" onClick={() => { setTab("programs"); setProgUniFilter(r._id); setProgPage(1); }}>Programs</button>
      </div>
    )},
  ];

  const progCols = [
    { key: "name", label: "Name" },
    { key: "code", label: "Code" },
    { key: "university", label: "University", render: (r) => r.universityId?.name || "—" },
    { key: "stream", label: "Stream" },
    { key: "durationYears", label: "Years" },
    { key: "isActive", label: "Active", render: (r) => r.isActive ? "Yes" : "No" },
    { key: "actions", label: "Actions", render: (r) => (
      <div style={{ display: "flex", gap: 6 }}>
        <button className="btn secondary" onClick={() => openProgEdit(r)}>Edit</button>
        <button className="btn secondary" style={{ color: "#dc2626" }} onClick={() => deleteProg(r._id)}>Delete</button>
      </div>
    )},
  ];

  const progFilters = (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <select className="input" style={{ width: 160 }} value={progUniFilter}
        onChange={(e) => { setProgUniFilter(e.target.value); setProgPage(1); }}>
        <option value="">All Universities</option>
        {unis.map((u) => <option key={u._id} value={u._id}>{u.name}</option>)}
      </select>
      <select className="input" style={{ width: 120 }} value={progStreamFilter}
        onChange={(e) => { setProgStreamFilter(e.target.value); setProgPage(1); }}>
        <option value="">All Streams</option>
        {streamOptions.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
    </div>
  );

  return (
    <div className="admin-layout">
      <Sidebar />
      <main className="admin-main">
        <h1 style={{ margin: "0 0 16px" }}>Manage Universities & Programs</h1>

        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          <button className={`filter-chip${tab === "universities" ? " filter-chip-active" : ""}`}
            onClick={() => setTab("universities")}>Universities</button>
          <button className={`filter-chip${tab === "programs" ? " filter-chip-active" : ""}`}
            onClick={() => setTab("programs")}>Degree Programs</button>
        </div>

        {tab === "universities" ? (
          <>
            <DataTable columns={uniCols} rows={unis} loading={uniLoading} pagination={uniMeta}
              onPageChange={setUniPage} onSearch={setUniSearch}
              actions={<button className="btn" onClick={openUniCreate}>+ Add University</button>} />

            {uniModal && (
              <div className="admin-modal-overlay" onClick={() => setUniModal(false)}>
                <div className="admin-modal card" onClick={(e) => e.stopPropagation()}>
                  <h2 style={{ margin: "0 0 16px" }}>{uniEditing ? "Edit University" : "Add University"}</h2>
                  <form onSubmit={saveUni} className="admin-form">
                    <div className="form-grid">
                      <div className="form-group"><label className="small" style={{ fontWeight: 600 }}>Name</label>
                        <input className="input" value={uniForm.name} onChange={(e) => setUniForm({ ...uniForm, name: e.target.value })} required /></div>
                      <div className="form-group"><label className="small" style={{ fontWeight: 600 }}>Code</label>
                        <input className="input" value={uniForm.code} onChange={(e) => setUniForm({ ...uniForm, code: e.target.value })} required /></div>
                      <div className="form-group"><label className="small" style={{ fontWeight: 600 }}>District</label>
                        <input className="input" value={uniForm.district} onChange={(e) => setUniForm({ ...uniForm, district: e.target.value })} required /></div>
                      <div className="form-group"><label className="small" style={{ fontWeight: 600 }}>Province</label>
                        <input className="input" value={uniForm.province} onChange={(e) => setUniForm({ ...uniForm, province: e.target.value })} /></div>
                      <div className="form-group"><label className="small" style={{ fontWeight: 600 }}>Website</label>
                        <input className="input" value={uniForm.website} onChange={(e) => setUniForm({ ...uniForm, website: e.target.value })} /></div>
                      <div className="form-group"><label className="small" style={{ fontWeight: 600 }}>Logo URL</label>
                        <input className="input" value={uniForm.logoUrl} onChange={(e) => setUniForm({ ...uniForm, logoUrl: e.target.value })} /></div>
                    </div>
                    {error && <p className="error">{error}</p>}
                    <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                      <button className="btn" type="submit" disabled={saving}>{saving ? "Saving..." : "Save"}</button>
                      <button className="btn secondary" type="button" onClick={() => setUniModal(false)}>Cancel</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            <DataTable columns={progCols} rows={progs} loading={progLoading} pagination={progMeta}
              onPageChange={setProgPage} onSearch={setProgSearch} filters={progFilters}
              actions={<button className="btn" onClick={openProgCreate}>+ Add Program</button>} />

            {progModal && (
              <div className="admin-modal-overlay" onClick={() => setProgModal(false)}>
                <div className="admin-modal card" onClick={(e) => e.stopPropagation()}>
                  <h2 style={{ margin: "0 0 16px" }}>{progEditing ? "Edit Program" : "Add Program"}</h2>
                  <form onSubmit={saveProg} className="admin-form">
                    <div className="form-grid">
                      <div className="form-group"><label className="small" style={{ fontWeight: 600 }}>Name</label>
                        <input className="input" value={progForm.name} onChange={(e) => setProgForm({ ...progForm, name: e.target.value })} required /></div>
                      <div className="form-group"><label className="small" style={{ fontWeight: 600 }}>Code</label>
                        <input className="input" value={progForm.code} onChange={(e) => setProgForm({ ...progForm, code: e.target.value })} required /></div>
                      <div className="form-group"><label className="small" style={{ fontWeight: 600 }}>University</label>
                        <select className="input" value={progForm.universityId} onChange={(e) => setProgForm({ ...progForm, universityId: e.target.value })} required>
                          <option value="">Select university</option>
                          {unis.map((u) => <option key={u._id} value={u._id}>{u.name}</option>)}
                        </select></div>
                      <div className="form-group"><label className="small" style={{ fontWeight: 600 }}>Stream</label>
                        <select className="input" value={progForm.stream} onChange={(e) => setProgForm({ ...progForm, stream: e.target.value })}>
                          {streamOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select></div>
                      <div className="form-group"><label className="small" style={{ fontWeight: 600 }}>Duration (years)</label>
                        <input className="input" type="number" value={progForm.durationYears} onChange={(e) => setProgForm({ ...progForm, durationYears: e.target.value })} required /></div>
                      <div className="form-group"><label className="small" style={{ fontWeight: 600 }}>Degree Type</label>
                        <input className="input" value={progForm.degreeType} onChange={(e) => setProgForm({ ...progForm, degreeType: e.target.value })} /></div>
                      <div className="form-group full-width"><label className="small" style={{ fontWeight: 600 }}>Career Tags (comma-sep)</label>
                        <input className="input" value={progForm.careerTags} onChange={(e) => setProgForm({ ...progForm, careerTags: e.target.value })} /></div>
                    </div>
                    {error && <p className="error">{error}</p>}
                    <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                      <button className="btn" type="submit" disabled={saving}>{saving ? "Saving..." : "Save"}</button>
                      <button className="btn secondary" type="button" onClick={() => setProgModal(false)}>Cancel</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
