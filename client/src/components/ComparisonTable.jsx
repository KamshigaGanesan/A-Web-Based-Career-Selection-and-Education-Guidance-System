import React from "react";
import SkillBadge from "./SkillBadge.jsx";

const DEMAND_COLORS = {
  High: "demand-high",
  Medium: "demand-medium",
  Low: "demand-low",
};

function formatSalary(n) {
  return n?.toLocaleString() || "0";
}

const ROWS = [
  {
    label: "Salary Range",
    render: (c) => `LKR ${formatSalary(c.salaryMinLKR)} – ${formatSalary(c.salaryMaxLKR)}`,
  },
  {
    label: "Demand",
    render: (c) => (
      <span className={`career-demand-badge ${DEMAND_COLORS[c.demandLevel] || ""}`}>
        {c.demandLevel}
      </span>
    ),
  },
  {
    label: "Streams",
    render: (c) => (
      <div className="career-card-tags" style={{ gap: 4 }}>
        {c.streamTags?.map((t) => <span key={t} className="career-stream-tag">{t}</span>)}
      </div>
    ),
  },
  {
    label: "Required Skills",
    render: (c) => (
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
        {c.requiredSkills?.map((s) => <SkillBadge key={s} skill={s} />)}
      </div>
    ),
  },
  {
    label: "Education Paths",
    render: (c) => (
      <ul style={{ margin: 0, paddingLeft: 16, fontSize: 13 }}>
        {c.educationPaths?.map((p) => <li key={p}>{p}</li>)}
      </ul>
    ),
  },
  {
    label: "Work Environment",
    render: (c) => c.workEnvironment || "—",
  },
];

export default function ComparisonTable({ careers, onRemove, onClearAll }) {
  if (!careers?.length) return null;

  return (
    <div className="career-comparison">
      <div className="career-comparison-header">
        <h2 style={{ margin: 0 }}>Career Comparison</h2>
        <button className="btn secondary" onClick={onClearAll}>Clear All</button>
      </div>
      <div className="compare-table-wrapper" style={{ marginTop: 16 }}>
        <table className="compare-table">
          <thead>
            <tr>
              <th style={{ minWidth: 140 }}>Attribute</th>
              {careers.map((c) => (
                <th key={c._id}>
                  <div className="compare-col-header">
                    <span>{c.title}</span>
                    <button
                      className="compare-remove-btn"
                      onClick={() => onRemove(c._id)}
                      title="Remove"
                    >
                      ✕
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr key={row.label}>
                <td style={{ fontWeight: 600, color: "#374151" }}>{row.label}</td>
                {careers.map((c) => (
                  <td key={c._id}>{row.render(c)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
