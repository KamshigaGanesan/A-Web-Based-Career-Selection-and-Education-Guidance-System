import React, { useEffect, useState, useCallback } from "react";
import adminApi from "../../services/adminApi.js";
import Sidebar from "../../components/admin/Sidebar.jsx";
import DataTable from "../../components/admin/DataTable.jsx";

const emptyForm = {
  title: "", company: "", type: "internship", location: "",
  workMode: "onsite", salary: "", description: "",
  applyLink: "", deadline: "", isActive: true,
};

export default function ManageJobs() {
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = { search, page, limit: 10 };
      if (typeFilter) params.type = typeFilter;
      const { data } = await adminApi.get("/jobs", { params });
      setRows(data.data);
      setMeta(data.meta);
    } catch (err) { console.error(err); }
    setLoading(false);
  }, [search, typeFilter, page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  function openCreate() {
    setEditing(null);
    setForm({ ...emptyForm });
    setError("");
    setModal(true);
  }

  function openEdit(row) {
    setEditing(row._id);
    setForm({
      title: row.title || "", company: row.company || "",
      type: row.type || "internship", location: row.location || "",
      workMode: row.workMode || "onsite", salary: row.salary || "",
      description: row.description || "", applyLink: row.applyLink || "",
      deadline: row.deadline ? row.deadline.split("T")[0] : "",
      isActive: row.isActive ?? true,
    });
    setError("");
    setModal(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const body = { ...form };
    if (body.deadline) body.deadline = new Date(body.deadline);
    else delete body.deadline;
    try {
      if (editing) {
        await adminApi.put(`/jobs/${editing}`, body);
      } else {
        await adminApi.post("/jobs", body);
      }
      setModal(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Save failed");
    }
    setSaving(false);
  }

  async function handleDelete(id) {
    if (!confirm("Deactivate this job?")) return;
    await adminApi.delete(`/jobs/${id}`);
    fetchData();
  }

  const columns = [
    { key: "title", label: "Title" },
    { key: "company", label: "Company" },
    { key: "type", label: "Type", render: (r) => (
      <span className={`pill`} style={{ fontSize: 11 }}>{r.type}</span>
    )},
    { key: "workMode", label: "Mode" },
    { key: "isActive", label: "Active", render: (r) => r.isActive ? "Yes" : "No" },
    { key: "actions", label: "Actions", render: (r) => (
      <div style={{ display: "flex", gap: 6 }}>
        <button className="btn secondary" onClick={() => openEdit(r)}>Edit</button>
        <button className="btn secondary" style={{ color: "#dc2626" }} onClick={() => handleDelete(r._id)}>Delete</button>
      </div>
    )},
  ];

  const filterUI = (
    <div style={{ display: "flex", gap: 8 }}>
      <button className={`filter-chip${typeFilter === "" ? " filter-chip-active" : ""}`}
        onClick={() => { setTypeFilter(""); setPage(1); }}>All</button>
      <button className={`filter-chip${typeFilter === "internship" ? " filter-chip-active" : ""}`}
        onClick={() => { setTypeFilter("internship"); setPage(1); }}>Internships</button>
      <button className={`filter-chip${typeFilter === "job" ? " filter-chip-active" : ""}`}
        onClick={() => { setTypeFilter("job"); setPage(1); }}>Jobs</button>
    </div>
  );

  return (
    <div className="admin-layout">
      <Sidebar />
      <main className="admin-main">
        <h1 style={{ margin: "0 0 20px" }}>Manage Jobs & Internships</h1>
        <DataTable
          columns={columns}
          rows={rows}
          loading={loading}
          pagination={meta}
          onPageChange={setPage}
          onSearch={setSearch}
          filters={filterUI}
          actions={<button className="btn" onClick={openCreate}>+ Add Job</button>}
        />

        {modal && (
          <div className="admin-modal-overlay" onClick={() => setModal(false)}>
            <div className="admin-modal card" onClick={(e) => e.stopPropagation()}>
              <h2 style={{ margin: "0 0 16px" }}>{editing ? "Edit Job" : "Add Job"}</h2>
              <form onSubmit={handleSave} className="admin-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label className="small" style={{ fontWeight: 600 }}>Title</label>
                    <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label className="small" style={{ fontWeight: 600 }}>Company</label>
                    <input className="input" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label className="small" style={{ fontWeight: 600 }}>Type</label>
                    <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                      <option value="internship">Internship</option>
                      <option value="job">Job</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="small" style={{ fontWeight: 600 }}>Work Mode</label>
                    <select className="input" value={form.workMode} onChange={(e) => setForm({ ...form, workMode: e.target.value })}>
                      <option value="onsite">Onsite</option>
                      <option value="remote">Remote</option>
                      <option value="hybrid">Hybrid</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="small" style={{ fontWeight: 600 }}>Location</label>
                    <input className="input" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="small" style={{ fontWeight: 600 }}>Salary</label>
                    <input className="input" value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="small" style={{ fontWeight: 600 }}>Apply Link</label>
                    <input className="input" value={form.applyLink} onChange={(e) => setForm({ ...form, applyLink: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="small" style={{ fontWeight: 600 }}>Deadline</label>
                    <input className="input" type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
                  </div>
                  <div className="form-group full-width">
                    <label className="small" style={{ fontWeight: 600 }}>Description</label>
                    <textarea className="input" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
                  </div>
                </div>
                {error && <p className="error">{error}</p>}
                <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                  <button className="btn" type="submit" disabled={saving}>{saving ? "Saving..." : "Save"}</button>
                  <button className="btn secondary" type="button" onClick={() => setModal(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
