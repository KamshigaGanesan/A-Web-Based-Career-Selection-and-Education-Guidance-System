import React, { useEffect, useState, useCallback } from "react";
import adminApi from "../../services/adminApi.js";
import Sidebar from "../../components/admin/Sidebar.jsx";
import DataTable from "../../components/admin/DataTable.jsx";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

const CATEGORIES = [
  "Information Technology", "Business & Management", "Accounting & Finance",
  "Marketing & Sales", "Design & Creative Arts", "Media & Communication",
  "Healthcare & Nursing", "Education & Teaching", "Law & Legal Studies",
  "Engineering", "Science", "Social Sciences", "Hospitality & Tourism",
  "Technical & Vocational", "Agriculture & Environment", "Psychology & Counseling",
  "Languages & Literature", "Sports & Physical Education", "Aviation & Logistics",
  "Cybersecurity",
];

const emptyForm = {
  name: "", description: "", duration: "", fees: "", category: "",
};

export default function ManageCourses() {
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.get("/courses", { params: { search, page, limit: 10 } });
      setRows(data.data);
      setMeta(data.meta);
    } catch (err) { console.error(err); }
    setLoading(false);
  }, [search, page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  function openCreate() {
    setEditing(null);
    setForm({ ...emptyForm });
    setImageFile(null);
    setImagePreview(null);
    setError("");
    setModal(true);
  }

  function openEdit(row) {
    setEditing(row._id);
    setForm({
      name: row.name || "",
      description: row.description || "",
      duration: row.duration || "",
      fees: row.fees || "",
      category: row.category || "",
    });
    setImageFile(null);
    setImagePreview(row.image ? `${API_URL}${row.image}` : null);
    setError("");
    setModal(true);
  }

  function onImageChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      let imageUrl = null;
      if (imageFile) {
        const fd = new FormData();
        fd.append("image", imageFile);
        const uploadRes = await adminApi.post("/upload-image", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        imageUrl = uploadRes.data.data.url;
      }

      const body = { ...form };
      if (imageUrl) body.image = imageUrl;

      if (editing) {
        await adminApi.put(`/courses/${editing}`, body);
      } else {
        await adminApi.post("/courses", body);
      }
      setModal(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Save failed");
    }
    setSaving(false);
  }

  async function handleDelete(id) {
    if (!confirm("Delete this course?")) return;
    try {
      await adminApi.delete(`/courses/${id}`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  }

  const columns = [
    {
      key: "image", label: "Image", render: (r) => r.image ? (
        <img src={`${API_URL}${r.image}`} alt="" style={{ width: 48, height: 36, objectFit: "cover", borderRadius: 6 }} />
      ) : <span className="small">—</span>,
    },
    { key: "name", label: "Name" },
    { key: "category", label: "Category", render: (r) => (
      <span className="pill" style={{ fontSize: 11 }}>{r.category}</span>
    )},
    { key: "duration", label: "Duration" },
    { key: "fees", label: "Fees" },
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
        <h1 style={{ margin: "0 0 20px" }}>Manage Courses</h1>
        <DataTable
          columns={columns}
          rows={rows}
          loading={loading}
          pagination={meta}
          onPageChange={setPage}
          onSearch={setSearch}
          actions={<button className="btn" onClick={openCreate}>+ Add Course</button>}
        />

        {modal && (
          <div className="admin-modal-overlay" onClick={() => setModal(false)}>
            <div className="admin-modal card" onClick={(e) => e.stopPropagation()}>
              <h2 style={{ margin: "0 0 16px" }}>{editing ? "Edit Course" : "Add Course"}</h2>
              <form onSubmit={handleSave} className="admin-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label className="small" style={{ fontWeight: 600 }}>Course Name</label>
                    <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Computer Science" required />
                  </div>
                  <div className="form-group">
                    <label className="small" style={{ fontWeight: 600 }}>Category</label>
                    <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required>
                      <option value="">Select category...</option>
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="small" style={{ fontWeight: 600 }}>Duration</label>
                    <input className="input" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="e.g. 4 years" required />
                  </div>
                  <div className="form-group">
                    <label className="small" style={{ fontWeight: 600 }}>Fees</label>
                    <input className="input" value={form.fees} onChange={(e) => setForm({ ...form, fees: e.target.value })} placeholder="e.g. Rs. 200,000" required />
                  </div>
                  <div className="form-group full-width">
                    <label className="small" style={{ fontWeight: 600 }}>Description</label>
                    <textarea className="input" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Course description..." required />
                  </div>
                  <div className="form-group full-width">
                    <label className="small" style={{ fontWeight: 600 }}>Course Image</label>
                    <input type="file" accept="image/jpeg,image/png,image/webp" onChange={onImageChange} className="input" />
                    {imagePreview && (
                      <img src={imagePreview} alt="Preview" className="image-preview" />
                    )}
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
