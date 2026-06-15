import React, { useState } from "react";

const STREAMS = ["Maths", "Bio", "Commerce", "Arts", "Tech"];
const DEMANDS = ["High", "Medium", "Low"];

export default function FilterSidebar({ filters, onFilterChange, onClose }) {
  const [local, setLocal] = useState({ ...filters });

  const update = (key, val) => {
    const next = { ...local, [key]: val };
    setLocal(next);
  };

  const apply = () => {
    onFilterChange(local);
    onClose?.();
  };

  const reset = () => {
    const cleared = { stream: "", minSalary: "", maxSalary: "", demand: "", sort: "" };
    setLocal(cleared);
    onFilterChange(cleared);
    onClose?.();
  };

  return (
    <div className="career-filter-sidebar">
      <div className="career-filter-header">
        <h3 style={{ margin: 0 }}>Filters</h3>
        {onClose && (
          <button className="career-filter-close" onClick={onClose}>✕</button>
        )}
      </div>

      <div className="career-filter-group">
        <label className="career-filter-label">Stream</label>
        <select
          className="input"
          value={local.stream}
          onChange={(e) => update("stream", e.target.value)}
        >
          <option value="">All Streams</option>
          {STREAMS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="career-filter-group">
        <label className="career-filter-label">Salary Range (LKR)</label>
        <div className="career-filter-salary-row">
          <input
            type="number"
            className="input"
            placeholder="Min"
            value={local.minSalary}
            onChange={(e) => update("minSalary", e.target.value)}
          />
          <span style={{ color: "#999" }}>–</span>
          <input
            type="number"
            className="input"
            placeholder="Max"
            value={local.maxSalary}
            onChange={(e) => update("maxSalary", e.target.value)}
          />
        </div>
      </div>

      <div className="career-filter-group">
        <label className="career-filter-label">Demand Level</label>
        <div className="career-demand-toggles">
          {DEMANDS.map((d) => (
            <button
              key={d}
              className={`career-demand-chip ${local.demand === d ? "active" : ""} demand-${d.toLowerCase()}`}
              onClick={() => update("demand", local.demand === d ? "" : d)}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <div className="career-filter-group">
        <label className="career-filter-label">Sort By</label>
        <select
          className="input"
          value={local.sort}
          onChange={(e) => update("sort", e.target.value)}
        >
          <option value="">Default</option>
          <option value="salaryAsc">Salary: Low to High</option>
          <option value="salaryDesc">Salary: High to Low</option>
          <option value="demand">Demand Level</option>
          <option value="title">Title A-Z</option>
        </select>
      </div>

      <div className="career-filter-actions">
        <button className="btn" onClick={apply}>Apply Filters</button>
        <button className="btn secondary" onClick={reset}>Reset</button>
      </div>
    </div>
  );
}
