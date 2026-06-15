import React from "react";
import { Link } from "react-router-dom";

const DEMAND_COLORS = {
  High: "demand-high",
  Medium: "demand-medium",
  Low: "demand-low",
};

function formatSalary(n) {
  return n?.toLocaleString() || "0";
}

export default function RelatedCareers({ careers }) {
  if (!careers?.length) return null;

  return (
    <div className="related-careers">
      <h3 className="section-title" style={{ marginBottom: 16 }}>Related Careers</h3>
      <div className="related-careers-grid">
        {careers.map((c) => (
          <Link to={`/careers/${c._id}`} key={c._id} className="related-career-card card">
            {c.imageUrl ? (
              <img src={c.imageUrl} alt={c.title} className="related-career-img" loading="lazy" />
            ) : (
              <div className="related-career-img-placeholder">No Image</div>
            )}
            <div className="related-career-body">
              <h4 className="related-career-title">{c.title}</h4>
              <span className={`career-demand-badge small ${DEMAND_COLORS[c.demandLevel] || ""}`}>
                {c.demandLevel}
              </span>
              <p className="small" style={{ margin: 0, color: "#666" }}>
                LKR {formatSalary(c.salaryMinLKR)} – {formatSalary(c.salaryMaxLKR)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
