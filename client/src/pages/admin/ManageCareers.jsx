import React, { useEffect, useState, useCallback, useRef } from "react";
import adminApi from "../../services/adminApi.js";
import Sidebar from "../../components/admin/Sidebar.jsx";
import DataTable from "../../components/admin/DataTable.jsx";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

const emptyForm = {
  title: "", slug: "", description: "", streamTags: "",
  salaryMinLKR: "", salaryMaxLKR: "", demandLevel: "Medium",
  requiredSkills: "", educationPaths: "", workEnvironment: "",
  imageUrl: "", isActive: true,
};

export default function ManageCareers() {
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.get("/careers", { params: { search, page, limit: 10 } });
      setRows(data.data);
      setMeta(data.meta);
    } catch (err) { console.error(err); }
    setLoading(false);
  }, [search, page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setImagePreview("");
    setError("");
    setModal(true);
  }

  function openEdit(row) {
    setEditing(row._id);
    const imgUrl = row.imageUrl || "";
    setForm({
      title: row.title || "", slug: row.slug || "",
      description: row.description || "",
      streamTags: (row.streamTags || []).join(", "),
      salaryMinLKR: row.salaryMinLKR ?? "",
      salaryMaxLKR: row.salaryMaxLKR ?? "",
      demandLevel: row.demandLevel || "Medium",
      requiredSkills: (row.requiredSkills || []).join(", "),
      educationPaths: (row.educationPaths || []).join(", "),
      workEnvironment: row.workEnvironment || "",
      imageUrl: imgUrl,
      isActive: row.isActive ?? true,
    });
    setImagePreview(imgUrl ? (imgUrl.startsWith("http") ? imgUrl : `${API_URL}${imgUrl}`) : "");
    setError("");
    setModal(true);
  }

  async function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setImagePreview(URL.createObjectURL(file));
    const fd = new FormData();
    fd.append("image", file);
    try {
      const { data } = await adminApi.post("/upload-image", fd);
      const serverUrl = data.data.url;
      setForm((prev) => ({ ...prev, imageUrl: serverUrl }));
      setImagePreview(`${API_URL}${serverUrl}`);
    } catch (err) {
      setError("Image upload failed: " + (err.response?.data?.message || err.message));
      setImagePreview("");
    }
    setUploading(false);
  }

  function removeImage() {
    setForm((prev) => ({ ...prev, imageUrl: "" }));
    setImagePreview("");
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const body = {
      ...form,
      streamTags: form.streamTags.split(",").map((s) => s.trim()).filter(Boolean),
      requiredSkills: form.requiredSkills.split(",").map((s) => s.trim()).filter(Boolean),
      educationPaths: form.educationPaths.split(",").map((s) => s.trim()).filter(Boolean),
      salaryMinLKR: Number(form.salaryMinLKR) || 0,
      salaryMaxLKR: Number(form.salaryMaxLKR) || 0,
    };
    try {
      if (editing) {
        await adminApi.put(`/careers/${editing}`, body);
      } else {
        await adminApi.post("/careers", body);
      }
      setModal(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Save failed");
    }
    setSaving(false);
  }

  async function handleDelete(id) {
    if (!confirm("Deactivate this career?")) return;
    await adminApi.delete(`/careers/${id}`);
    fetchData();
  }

  const columns = [
    { key: "imageUrl", label: "Image", render: (r) => r.imageUrl ? (
      <img
        src={r.imageUrl.startsWith("http") ? r.imageUrl : `${API_URL}${r.imageUrl}`}
        alt=""
        style={{ width: 44, height: 44, borderRadius: 8, objectFit: "cover" }}
      />
    ) : <span style={{ color: "#ccc" }}>—</span> },
    { key: "title", label: "Title" },
    { key: "demandLevel", label: "Demand", render: (r) => (
      <span className={`career-demand-badge small demand-${r.demandLevel?.toLowerCase()}`}>{r.demandLevel}</span>
    )},
    { key: "streamTags", label: "Streams", render: (r) => (r.streamTags || []).join(", ") },
    { key: "isActive", label: "Active", render: (r) => r.isActive ? "Yes" : "No" },
    { key: "actions", label: "Actions", render: (r) => (
      <div style={{ display: "flex", gap: 6 }}>
        <button className="btn secondary" onClick={() => openEdit(r)}>Edit</button>
        <button className="btn secondary" style={{ color: "#dc2626" }} onClick={() => handleDelete(r._id)}>Delete</button>
      </div>
    )},
  ];

  return (
    <div className="admin-layout">
      <Sidebar />
      <main className="admin-main">
        <h1 style={{ margin: "0 0 20px" }}>Manage Careers</h1>
        <DataTable
          columns={columns}
          rows={rows}
          loading={loading}
          pagination={meta}
          onPageChange={setPage}
          onSearch={setSearch}
          actions={<button className="btn" onClick={openCreate}>+ Add Career</button>}
        />

        {modal && (
          <div className="admin-modal-overlay" onClick={() => setModal(false)}>
            <div className="admin-modal card" onClick={(e) => e.stopPropagation()}>
              <h2 style={{ margin: "0 0 16px" }}>{editing ? "Edit Career" : "Add Career"}</h2>
              <form onSubmit={handleSave} className="admin-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label className="small" style={{ fontWeight: 600 }}>Title</label>
                    <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label className="small" style={{ fontWeight: 600 }}>Slug</label>
                    <input className="input" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required />
                  </div>
                  <div className="form-group full-width">
                    <label className="small" style={{ fontWeight: 600 }}>Description</label>
                    <textarea className="input" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label className="small" style={{ fontWeight: 600 }}>Stream Tags (comma-sep)</label>
                    <input className="input" value={form.streamTags} onChange={(e) => setForm({ ...form, streamTags: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="small" style={{ fontWeight: 600 }}>Demand Level</label>
                    <select className="input" value={form.demandLevel} onChange={(e) => setForm({ ...form, demandLevel: e.target.value })}>
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="small" style={{ fontWeight: 600 }}>Salary Min (LKR)</label>
                    <input className="input" type="number" value={form.salaryMinLKR} onChange={(e) => setForm({ ...form, salaryMinLKR: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="small" style={{ fontWeight: 600 }}>Salary Max (LKR)</label>
                    <input className="input" type="number" value={form.salaryMaxLKR} onChange={(e) => setForm({ ...form, salaryMaxLKR: e.target.value })} />
                  </div>
                  <div className="form-group full-width">
                    <label className="small" style={{ fontWeight: 600 }}>Required Skills (comma-sep)</label>
                    <input className="input" value={form.requiredSkills} onChange={(e) => setForm({ ...form, requiredSkills: e.target.value })} />
                  </div>
                  <div className="form-group full-width">
                    <label className="small" style={{ fontWeight: 600 }}>Education Paths (comma-sep)</label>
                    <input className="input" value={form.educationPaths} onChange={(e) => setForm({ ...form, educationPaths: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="small" style={{ fontWeight: 600 }}>Work Environment</label>
                    <input className="input" value={form.workEnvironment} onChange={(e) => setForm({ ...form, workEnvironment: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="small" style={{ fontWeight: 600 }}>Image</label>
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImageUpload}
                      style={{ fontSize: 13 }}
                    />
                    {uploading && <span className="small" style={{ color: "#6366f1" }}>Uploading...</span>}
                    {imagePreview && (
                      <div style={{ marginTop: 8, position: "relative", display: "inline-block" }}>
                        <img
                          src={imagePreview}
                          alt="Preview"
                          style={{ maxWidth: 200, maxHeight: 140, borderRadius: 10, objectFit: "cover" }}
                        />
                        <button
                          type="button"
                          onClick={removeImage}
                          style={{
                            position: "absolute", top: 4, right: 4,
                            background: "#dc2626", color: "#fff", border: "none",
                            borderRadius: "50%", width: 22, height: 22,
                            cursor: "pointer", fontSize: 12, lineHeight: 1,
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}
                        >
                          X
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                {error && <p className="error">{error}</p>}
                <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                  <button className="btn" type="submit" disabled={saving || uploading}>{saving ? "Saving..." : uploading ? "Uploading image..." : "Save"}</button>
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
