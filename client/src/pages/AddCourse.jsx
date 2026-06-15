import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api.js";
import { CATEGORIES } from "../lib/categories.js";

export default function AddCourse() {
  const nav = useNavigate();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [fees, setFees] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function onImageChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");

    if (!name || !description || !duration || !fees || !category) {
      return setError("All fields are required");
    }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("name", name);
      fd.append("description", description);
      fd.append("duration", duration);
      fd.append("fees", fees);
      fd.append("category", category);
      if (image) fd.append("image", image);

      await api.post("/courses", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      nav("/courses");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to add course");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <h2>Add New Course</h2>
      <p className="small">Fill in the details below to add a new course.</p>

      <form onSubmit={onSubmit} style={{ marginTop: 16 }}>
        <div className="form-grid">
          <div className="form-group">
            <label className="small">Course Name</label>
            <input
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Computer Science Engineering"
            />
          </div>

          <div className="form-group">
            <label className="small">Category / Career Path</label>
            <select
              className="input"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Select a category...</option>
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.icon} {cat.value}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="small">Duration</label>
            <input
              className="input"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="e.g. 4 years"
            />
          </div>

          <div className="form-group">
            <label className="small">Fees</label>
            <input
              className="input"
              value={fees}
              onChange={(e) => setFees(e.target.value)}
              placeholder="e.g. Rs. 2,00,000"
            />
          </div>

          <div className="form-group full-width">
            <label className="small">Description</label>
            <textarea
              className="input"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed description of the course..."
            />
          </div>

          <div className="form-group full-width">
            <label className="small">Course Image</label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={onImageChange}
              className="input"
            />
            {preview && (
              <img
                src={preview}
                alt="Preview"
                className="image-preview"
              />
            )}
          </div>
        </div>

        {error && <div className="error">{error}</div>}

        <div style={{ marginTop: 16 }}>
          <button className="btn" disabled={loading}>
            {loading ? "Adding..." : "Add Course"}
          </button>
        </div>
      </form>
    </div>
  );
}
