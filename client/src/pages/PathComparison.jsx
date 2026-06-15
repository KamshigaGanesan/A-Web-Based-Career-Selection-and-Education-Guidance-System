import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api.js";

const TYPE_COLORS = {
  private: { bg: "#eef2ff", color: "#4f46e5", label: "Private" },
  diploma: { bg: "#f0fdf4", color: "#16a34a", label: "Diploma" },
  vocational: { bg: "#fffbeb", color: "#d97706", label: "Vocational" },
  foreign: { bg: "#fdf2f8", color: "#db2777", label: "Foreign" },
  foundation: { bg: "#f0f9ff", color: "#0284c7", label: "Foundation" },
};

export default function PathComparison() {
  const [paths, setPaths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [compareIds, setCompareIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem("comparePaths")) || []; }
    catch { return []; }
  });

  useEffect(() => {
    if (compareIds.length === 0) {
      setLoading(false);
      return;
    }
    loadComparedPaths();
  }, []);

  async function loadComparedPaths() {
    setLoading(true);
    try {
      const results = await Promise.all(
        compareIds.map((id) => api.get(`/api/alternatives/${id}`).then((r) => r.data).catch(() => null))
      );
      setPaths(results.filter(Boolean));
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }

  function removePath(id) {
    const updated = compareIds.filter((x) => x !== id);
    setCompareIds(updated);
    localStorage.setItem("comparePaths", JSON.stringify(updated));
    setPaths((prev) => prev.filter((p) => p._id !== id));
  }

  function clearAll() {
    setCompareIds([]);
    setPaths([]);
    localStorage.setItem("comparePaths", JSON.stringify([]));
  }

  if (loading) return <div className="card"><p>Loading comparison...</p></div>;

  if (paths.length === 0) {
    return (
      <div style={{ animation: "fadeIn 0.4s ease" }}>
        <h2>Compare Pathways</h2>
        <div className="card" style={{ textAlign: "center", padding: 40 }}>
          <p style={{ fontSize: 40, margin: "0 0 8px" }}>⚖️</p>
          <h3 style={{ margin: "0 0 6px" }}>No paths selected for comparison</h3>
          <p className="small">Go to Alternative Pathways and click "Compare" on up to 3 paths.</p>
          <Link to="/alternatives" className="btn" style={{ display: "inline-block", marginTop: 16 }}>
            Browse Pathways
          </Link>
        </div>
      </div>
    );
  }

  const rows = [
    { label: "Provider", render: (p) => p.provider },
    { label: "Type", render: (p) => {
      const tc = TYPE_COLORS[p.type] || TYPE_COLORS.private;
      return <span className="path-type-badge" style={{ background: tc.bg, color: tc.color }}>{tc.label}</span>;
    }},
    { label: "Duration", render: (p) => `${p.durationMonths} months` },
    { label: "Fees (LKR)", render: (p) => `LKR ${p.feesLKR.toLocaleString()}` },
    { label: "Rating", render: (p) => p.ratingAvg > 0 ? `${p.ratingAvg.toFixed(1)}/5 (${p.ratingCount})` : "—" },
    { label: "Streams", render: (p) => (
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
        {p.streamTags?.map((t) => <span key={t} className="path-tag" style={{ fontSize: 11 }}>{t}</span>)}
      </div>
    )},
    { label: "Career Tags", render: (p) => (
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
        {p.careerTags?.map((t) => <span key={t} className="path-tag career" style={{ fontSize: 11 }}>{t}</span>)}
      </div>
    )},
    { label: "Districts", render: (p) => p.districtAvailability?.join(", ") || "—" },
    { label: "Requirements", render: (p) => p.entryRequirements || "—" },
    { label: "Pros", render: (p) => p.pros?.length > 0 ? (
      <ul style={{ margin: 0, paddingLeft: 16, fontSize: 13 }}>
        {p.pros.map((x, i) => <li key={i}>{x}</li>)}
      </ul>
    ) : "—"},
    { label: "Cons", render: (p) => p.cons?.length > 0 ? (
      <ul style={{ margin: 0, paddingLeft: 16, fontSize: 13 }}>
        {p.cons.map((x, i) => <li key={i}>{x}</li>)}
      </ul>
    ) : "—"},
  ];

  return (
    <div style={{ animation: "fadeIn 0.4s ease" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
        <h2 style={{ margin: 0 }}>Compare Pathways ({paths.length})</h2>
        <div style={{ display: "flex", gap: 10 }}>
          <Link to="/alternatives" className="btn secondary">← Back</Link>
          <button className="btn secondary" onClick={clearAll}>Clear All</button>
        </div>
      </div>

      <div className="compare-table-wrapper">
        <table className="compare-table">
          <thead>
            <tr>
              <th style={{ minWidth: 130 }}>Feature</th>
              {paths.map((p) => (
                <th key={p._id}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <Link to={`/alternatives/${p._id}`} style={{ fontWeight: 600, color: "#4f46e5" }}>{p.title}</Link>
                    <button className="btn secondary" style={{ padding: "4px 10px", fontSize: 12 }} onClick={() => removePath(p._id)}>
                      Remove
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label}>
                <td style={{ fontWeight: 600, color: "#374151", fontSize: 13 }}>{row.label}</td>
                {paths.map((p) => (
                  <td key={p._id}>{row.render(p)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
