import React, { useEffect, useState, useCallback } from "react";
import adminApi from "../../services/adminApi.js";
import Sidebar from "../../components/admin/Sidebar.jsx";
import DataTable from "../../components/admin/DataTable.jsx";

export default function ManageZScore() {
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ year: "", district: "", programId: "" });
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [editModal, setEditModal] = useState(null);
  const [editForm, setEditForm] = useState({ cutoffZScore: "" });
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (filters.year) params.year = filters.year;
      if (filters.district) params.district = filters.district;
      if (filters.programId) params.programId = filters.programId;
      const { data } = await adminApi.get("/zscore", { params });
      setRows(data.data);
      setMeta(data.meta);
    } catch (err) { console.error(err); }
    setLoading(false);
  }, [page, filters]);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function handleUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setUploadResult(null);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const { data } = await adminApi.post("/zscore/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUploadResult(data.data);
      fetchData();
    } catch (err) {
      setUploadResult({ error: err.response?.data?.message || "Upload failed" });
    }
    setUploading(false);
    e.target.value = "";
  }

  function openEdit(row) {
    setEditModal(row);
    setEditForm({ cutoffZScore: row.cutoffZScore ?? "" });
  }

  async function handleSaveEdit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await adminApi.put(`/zscore/${editModal._id}`, { cutoffZScore: Number(editForm.cutoffZScore) });
      setEditModal(null);
      fetchData();
    } catch (err) { console.error(err); }
    setSaving(false);
  }

  async function handleDelete(id) {
    if (!confirm("Delete this Z-Score entry?")) return;
    await adminApi.delete(`/zscore/${id}`);
    fetchData();
  }

  const columns = [
    { key: "year", label: "Year" },
    { key: "district", label: "District" },
    { key: "university", label: "University", render: (r) => r.universityId?.name || "—" },
    { key: "program", label: "Program", render: (r) => r.degreeProgramId?.name || "—" },
    { key: "cutoffZScore", label: "Cutoff Z-Score" },
    { key: "actions", label: "Actions", render: (r) => (
      <div style={{ display: "flex", gap: 6 }}>
        <button className="btn secondary" onClick={() => openEdit(r)}>Edit</button>
        <button className="btn secondary" style={{ color: "#dc2626" }} onClick={() => handleDelete(r._id)}>Del</button>
      </div>
    )},
  ];

  const filterUI = (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <select className="input" style={{ width: 120 }} value={filters.year}
        onChange={(e) => { setFilters({ ...filters, year: e.target.value }); setPage(1); }}>
        <option value="">All Years</option>
        {[2021, 2022, 2023, 2024, 2025].map((y) => <option key={y} value={y}>{y}</option>)}
      </select>
      <input className="input" style={{ width: 150 }} placeholder="District..."
        value={filters.district} onChange={(e) => { setFilters({ ...filters, district: e.target.value }); setPage(1); }} />
    </div>
  );

  return (
    <div className="admin-layout">
      <Sidebar />
      <main className="admin-main">
        <h1 style={{ margin: "0 0 20px" }}>Manage Z-Score Tables</h1>

        <div className="card" style={{ padding: 16, marginBottom: 20 }}>
          <h3 style={{ margin: "0 0 10px" }}>Upload CSV</h3>
          <p className="small" style={{ marginBottom: 10 }}>
            Columns: year, district, universityCode, programCode, cutoffZScore
          </p>
          <input type="file" accept=".csv" onChange={handleUpload} disabled={uploading} />
          {uploading && <p className="small">Uploading...</p>}
          {uploadResult && !uploadResult.error && (
            <div style={{ marginTop: 10, padding: 12, background: "#f0fdf4", borderRadius: 10 }}>
              <strong>Upload Complete</strong>
              <p className="small">Inserted: {uploadResult.inserted} | Updated: {uploadResult.updated} | Failed: {uploadResult.failed}</p>
              {uploadResult.errors?.length > 0 && (
                <ul style={{ fontSize: 12, color: "#dc2626", marginTop: 6 }}>
                  {uploadResult.errors.slice(0, 10).map((e, i) => <li key={i}>{e}</li>)}
                </ul>
              )}
            </div>
          )}
          {uploadResult?.error && <p className="error">{uploadResult.error}</p>}
        </div>

        <DataTable
          columns={columns}
          rows={rows}
          loading={loading}
          pagination={meta}
          onPageChange={setPage}
          filters={filterUI}
        />

        {editModal && (
          <div className="admin-modal-overlay" onClick={() => setEditModal(null)}>
            <div className="admin-modal card" onClick={(e) => e.stopPropagation()}>
              <h2 style={{ margin: "0 0 16px" }}>Edit Z-Score</h2>
              <p className="small">{editModal.degreeProgramId?.name} — {editModal.district} ({editModal.year})</p>
              <form onSubmit={handleSaveEdit} style={{ marginTop: 12 }}>
                <div className="form-group">
                  <label className="small" style={{ fontWeight: 600 }}>Cutoff Z-Score</label>
                  <input className="input" type="number" step="0.0001" value={editForm.cutoffZScore}
                    onChange={(e) => setEditForm({ cutoffZScore: e.target.value })} required />
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                  <button className="btn" type="submit" disabled={saving}>{saving ? "Saving..." : "Save"}</button>
                  <button className="btn secondary" type="button" onClick={() => setEditModal(null)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
