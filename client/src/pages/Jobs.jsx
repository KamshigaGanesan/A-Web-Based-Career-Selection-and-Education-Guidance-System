import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { api } from "../lib/api.js";

const WORK_MODES = [
  { value: "", label: "All Modes" },
  { value: "onsite", label: "🏢 Onsite" },
  { value: "remote", label: "🏠 Remote" },
  { value: "hybrid", label: "🔄 Hybrid" },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};
const cardItem = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

function formatDate(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const diff = Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));
  return diff;
}

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [meta, setMeta] = useState({ page: 1, total: 0, pages: 0 });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [workModeFilter, setWorkModeFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchJobs = useCallback(async (p = 1) => {
    setLoading(true);
    setError("");
    try {
      const params = { page: p, limit: 12 };
      if (search.trim()) params.search = search.trim();
      if (typeFilter) params.type = typeFilter;
      if (workModeFilter) params.workMode = workModeFilter;

      const { data } = await api.get("/api/jobs", { params });
      setJobs(data.data);
      setMeta(data.meta);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load jobs");
    } finally {
      setLoading(false);
    }
  }, [search, typeFilter, workModeFilter]);

  useEffect(() => {
    fetchJobs(page);
  }, [page, fetchJobs]);

  useEffect(() => {
    setPage(1);
    fetchJobs(1);
  }, [typeFilter, workModeFilter, fetchJobs]);

  function handleSearch(e) {
    e?.preventDefault();
    setPage(1);
    fetchJobs(1);
  }

  return (
    <div className="jobs-page">
      <motion.div
        className="jobs-hero"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="jobs-hero-content">
          <h1 className="page-title" style={{ color: "#fff", backgroundClip: "unset", WebkitBackgroundClip: "unset", WebkitTextFillColor: "unset", background: "none" }}>
            Jobs & Internships
          </h1>
          <p className="jobs-hero-sub">
            Discover the latest opportunities to kickstart or advance your career
          </p>
        </div>
        <div className="jobs-hero-shapes">
          <div className="jobs-hero-shape jobs-shape-1" />
          <div className="jobs-hero-shape jobs-shape-2" />
        </div>
      </motion.div>

      <motion.form
        className="search-bar"
        onSubmit={handleSearch}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
      >
        <span className="search-icon">🔍</span>
        <input
          className="search-input"
          placeholder="Search jobs by title, company, or keyword..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button type="button" className="search-clear" onClick={() => { setSearch(""); setPage(1); }}>✕</button>
        )}
      </motion.form>

      <motion.div
        className="jobs-filters"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4 }}
      >
        <div className="filter-bar">
          <button
            className={`filter-chip ${typeFilter === "" ? "filter-chip-active" : ""}`}
            onClick={() => setTypeFilter("")}
          >
            All Types
          </button>
          <button
            className={`filter-chip ${typeFilter === "job" ? "filter-chip-active" : ""}`}
            onClick={() => setTypeFilter("job")}
          >
            💼 Jobs
          </button>
          <button
            className={`filter-chip ${typeFilter === "internship" ? "filter-chip-active" : ""}`}
            onClick={() => setTypeFilter("internship")}
          >
            🎓 Internships
          </button>

          <span className="filter-divider" />

          {WORK_MODES.map((m) => (
            <button
              key={m.value}
              className={`filter-chip ${workModeFilter === m.value ? "filter-chip-active" : ""}`}
              onClick={() => setWorkModeFilter(m.value)}
            >
              {m.label}
            </button>
          ))}
        </div>
      </motion.div>

      {(search || typeFilter || workModeFilter) && (
        <p className="small results-info">
          Showing {jobs.length} of {meta.total || 0} results
          {typeFilter && <> &middot; <strong>{typeFilter}s</strong></>}
          {workModeFilter && <> &middot; <strong>{workModeFilter}</strong></>}
          {search && <> &middot; matching "<strong>{search}</strong>"</>}
        </p>
      )}

      {error && <div className="elig-error-banner">{error}</div>}

      {loading ? (
        <div className="jobs-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="job-skeleton card" />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="empty-state card">
          <span className="empty-icon">💼</span>
          <h3>No jobs found</h3>
          <p className="small">Try adjusting your filters or check back later for new opportunities.</p>
          {(search || typeFilter || workModeFilter) && (
            <button
              className="btn secondary"
              style={{ marginTop: 12 }}
              onClick={() => { setSearch(""); setTypeFilter(""); setWorkModeFilter(""); setPage(1); }}
            >
              Clear All Filters
            </button>
          )}
        </div>
      ) : (
        <motion.div
          className="jobs-grid"
          variants={container}
          initial="hidden"
          animate="show"
          key={`${page}-${typeFilter}-${workModeFilter}`}
        >
          {jobs.map((job) => {
            const days = daysUntil(job.deadline);
            const isExpiring = days !== null && days >= 0 && days <= 7;
            const isExpired = days !== null && days < 0;

            return (
              <motion.div key={job._id} variants={cardItem}>
                <Link to={`/jobs/${job._id}`} className="job-card card">
                  <div className="job-card-header">
                    <div className="job-card-badges">
                      <span className={`job-type-badge ${job.type === "job" ? "job-type-job" : "job-type-intern"}`}>
                        {job.type === "job" ? "💼 Job" : "🎓 Internship"}
                      </span>
                      <span className={`job-mode-badge job-mode-${job.workMode}`}>
                        {job.workMode === "remote" ? "🏠" : job.workMode === "hybrid" ? "🔄" : "🏢"} {job.workMode}
                      </span>
                    </div>
                    {job.deadline && (
                      <span className={`job-deadline-badge ${isExpired ? "expired" : isExpiring ? "expiring" : ""}`}>
                        {isExpired ? "Expired" : `${formatDate(job.deadline)}`}
                      </span>
                    )}
                  </div>

                  <h3 className="job-card-title">{job.title}</h3>
                  <p className="job-card-company">
                    <span className="job-company-icon">🏢</span> {job.company}
                  </p>

                  <div className="job-card-meta">
                    {job.location && (
                      <span className="job-meta-item">
                        📍 {job.location}
                      </span>
                    )}
                    {job.salary && (
                      <span className="job-meta-item">
                        💰 {job.salary}
                      </span>
                    )}
                  </div>

                  <p className="job-card-desc">
                    {job.description?.length > 120
                      ? job.description.slice(0, 120) + "..."
                      : job.description}
                  </p>

                  <div className="job-card-footer">
                    <span className="job-card-date">
                      Posted {formatDate(job.createdAt)}
                    </span>
                    <span className="job-card-arrow">View Details →</span>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {meta.pages > 1 && (
        <div className="pagination">
          <button
            className="btn secondary"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            ← Previous
          </button>
          <span className="small">
            Page {meta.page} of {meta.pages}
          </span>
          <button
            className="btn secondary"
            disabled={page >= meta.pages}
            onClick={() => setPage(page + 1)}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
