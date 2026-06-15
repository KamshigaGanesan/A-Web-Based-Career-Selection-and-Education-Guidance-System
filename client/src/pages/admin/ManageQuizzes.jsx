import React, { useEffect, useState, useCallback } from "react";
import adminApi from "../../services/adminApi.js";
import Sidebar from "../../components/admin/Sidebar.jsx";
import DataTable from "../../components/admin/DataTable.jsx";

const streams = ["Common", "Maths", "Bio", "Commerce", "Arts", "Tech"];

const emptyForm = {
  questionText: "", stream: "Common", category: "", order: "",
  options: [
    { text: "", weightTags: [{ tag: "", value: 1 }] },
    { text: "", weightTags: [{ tag: "", value: 1 }] },
  ],
  isActive: true,
};

export default function ManageQuizzes() {
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [stream, setStream] = useState("");
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
      if (stream) params.stream = stream;
      const { data } = await adminApi.get("/quizzes/questions", { params });
      setRows(data.data);
      setMeta(data.meta);
    } catch (err) { console.error(err); }
    setLoading(false);
  }, [search, stream, page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  function openCreate() {
    setEditing(null);
    setForm(JSON.parse(JSON.stringify(emptyForm)));
    setError("");
    setModal(true);
  }

  function openEdit(row) {
    setEditing(row._id);
    setForm({
      questionText: row.questionText,
      stream: row.stream || "Common",
      category: row.category || "",
      order: row.order ?? "",
      options: row.options.map((o) => ({
        text: o.text,
        weightTags: o.weightTags.length ? o.weightTags.map((w) => ({ tag: w.tag, value: w.value })) : [{ tag: "", value: 1 }],
      })),
      isActive: row.isActive ?? true,
    });
    setError("");
    setModal(true);
  }

  function updateOption(idx, field, value) {
    const opts = [...form.options];
    opts[idx] = { ...opts[idx], [field]: value };
    setForm({ ...form, options: opts });
  }

  function updateWeightTag(optIdx, tagIdx, field, value) {
    const opts = [...form.options];
    const tags = [...opts[optIdx].weightTags];
    tags[tagIdx] = { ...tags[tagIdx], [field]: field === "value" ? Number(value) : value };
    opts[optIdx] = { ...opts[optIdx], weightTags: tags };
    setForm({ ...form, options: opts });
  }

  function addOption() {
    setForm({ ...form, options: [...form.options, { text: "", weightTags: [{ tag: "", value: 1 }] }] });
  }

  function removeOption(idx) {
    if (form.options.length <= 2) return;
    setForm({ ...form, options: form.options.filter((_, i) => i !== idx) });
  }

  function addWeightTag(optIdx) {
    const opts = [...form.options];
    opts[optIdx] = { ...opts[optIdx], weightTags: [...opts[optIdx].weightTags, { tag: "", value: 1 }] };
    setForm({ ...form, options: opts });
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const body = {
      questionText: form.questionText,
      stream: form.stream,
      category: form.category,
      order: Number(form.order),
      isActive: form.isActive,
      options: form.options.map((o) => ({
        text: o.text,
        weightTags: o.weightTags.filter((w) => w.tag.trim()),
      })),
    };
    try {
      if (editing) {
        await adminApi.put(`/quizzes/questions/${editing}`, body);
      } else {
        await adminApi.post("/quizzes/questions", body);
      }
      setModal(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Save failed");
    }
    setSaving(false);
  }

  async function handleDelete(id) {
    if (!confirm("Deactivate this question?")) return;
    await adminApi.delete(`/quizzes/questions/${id}`);
    fetchData();
  }

  const columns = [
    { key: "order", label: "#" },
    { key: "questionText", label: "Question", render: (r) => r.questionText?.substring(0, 60) + (r.questionText?.length > 60 ? "..." : "") },
    { key: "stream", label: "Stream" },
    { key: "options", label: "Options", render: (r) => r.options?.length || 0 },
    { key: "isActive", label: "Active", render: (r) => r.isActive ? "Yes" : "No" },
    { key: "actions", label: "Actions", render: (r) => (
      <div style={{ display: "flex", gap: 6 }}>
        <button className="btn secondary" onClick={() => openEdit(r)}>Edit</button>
        <button className="btn secondary" style={{ color: "#dc2626" }} onClick={() => handleDelete(r._id)}>Delete</button>
      </div>
    )},
  ];

  const filterUI = (
    <select className="input" style={{ width: 130 }} value={stream}
      onChange={(e) => { setStream(e.target.value); setPage(1); }}>
      <option value="">All Streams</option>
      {streams.map((s) => <option key={s} value={s}>{s}</option>)}
    </select>
  );

  return (
    <div className="admin-layout">
      <Sidebar />
      <main className="admin-main">
        <h1 style={{ margin: "0 0 20px" }}>Manage Quiz Questions</h1>
        <DataTable
          columns={columns}
          rows={rows}
          loading={loading}
          pagination={meta}
          onPageChange={setPage}
          onSearch={setSearch}
          filters={filterUI}
          actions={<button className="btn" onClick={openCreate}>+ Add Question</button>}
        />

        {modal && (
          <div className="admin-modal-overlay" onClick={() => setModal(false)}>
            <div className="admin-modal card" style={{ maxWidth: 680 }} onClick={(e) => e.stopPropagation()}>
              <h2 style={{ margin: "0 0 16px" }}>{editing ? "Edit Question" : "Add Question"}</h2>
              <form onSubmit={handleSave} className="admin-form">
                <div className="form-group">
                  <label className="small" style={{ fontWeight: 600 }}>Question Text</label>
                  <textarea className="input" rows={2} value={form.questionText}
                    onChange={(e) => setForm({ ...form, questionText: e.target.value })} required />
                </div>
                <div className="form-grid" style={{ marginTop: 10 }}>
                  <div className="form-group">
                    <label className="small" style={{ fontWeight: 600 }}>Stream</label>
                    <select className="input" value={form.stream} onChange={(e) => setForm({ ...form, stream: e.target.value })}>
                      {streams.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="small" style={{ fontWeight: 600 }}>Order</label>
                    <input className="input" type="number" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label className="small" style={{ fontWeight: 600 }}>Category</label>
                    <input className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
                  </div>
                </div>

                <div style={{ marginTop: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <strong className="small">Options</strong>
                    <button type="button" className="btn secondary" onClick={addOption}>+ Option</button>
                  </div>
                  {form.options.map((opt, oi) => (
                    <div key={oi} style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: 12, marginBottom: 8 }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <input className="input" placeholder={`Option ${oi + 1} text`} value={opt.text}
                          onChange={(e) => updateOption(oi, "text", e.target.value)} required style={{ flex: 1 }} />
                        {form.options.length > 2 && (
                          <button type="button" className="btn secondary" style={{ color: "#dc2626", padding: "6px 10px" }}
                            onClick={() => removeOption(oi)}>X</button>
                        )}
                      </div>
                      <div style={{ marginTop: 6 }}>
                        <span style={{ fontSize: 11, color: "#888" }}>Weight Tags:</span>
                        {opt.weightTags.map((wt, wi) => (
                          <div key={wi} style={{ display: "flex", gap: 6, marginTop: 4 }}>
                            <input className="input" placeholder="tag" value={wt.tag}
                              onChange={(e) => updateWeightTag(oi, wi, "tag", e.target.value)} style={{ flex: 1 }} />
                            <input className="input" type="number" placeholder="value" value={wt.value}
                              onChange={(e) => updateWeightTag(oi, wi, "value", e.target.value)} style={{ width: 70 }} />
                          </div>
                        ))}
                        <button type="button" className="btn secondary" style={{ marginTop: 4, fontSize: 11, padding: "4px 8px" }}
                          onClick={() => addWeightTag(oi)}>+ Tag</button>
                      </div>
                    </div>
                  ))}
                </div>

                {error && <p className="error">{error}</p>}
                <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
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
