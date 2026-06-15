import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { api } from "../lib/api.js";

function formatDate(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function daysUntil(dateStr) {
  if (!dateStr) return null;
  return Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));
}

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    
    setLoading(true);
    api.get(`/api/jobs/${id}`)
      .then(({ data }) => setJob(data.data))
      .catch((err) => setError(err.response?.data?.message || "Job not found"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="page-loading">
        <div className="quiz-spinner" />
        <p className="small">Loading job details...</p>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="empty-state card">
        <span className="empty-icon">❌</span>
        <h3>{error || "Job not found"}</h3>
        <p className="small">This job listing may have been removed or is no longer available.</p>
        <Link to="/jobs" className="btn secondary" style={{ marginTop: 12 }}>
          ← Back to Jobs
        </Link>
      </div>
    );
  }

  const days = daysUntil(job.deadline);
  const isExpired = days !== null && days < 0;
  const isExpiring = days !== null && days >= 0 && days <= 7;

  return (
    <motion.div
      className="job-detail-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <button className="btn secondary btn-sm" onClick={() => navigate("/jobs")} style={{ marginBottom: 16 }}>
        ← Back to Jobs
      </button>

      <div className="job-detail-card card">
        <div className="job-detail-top">
          <div className="job-detail-badges">
            <span className={`job-type-badge ${job.type === "job" ? "job-type-job" : "job-type-intern"}`}>
              {job.type === "job" ? "💼 Full-time Job" : "🎓 Internship"}
            </span>
            <span className={`job-mode-badge job-mode-${job.workMode}`}>
              {job.workMode === "remote" ? "🏠" : job.workMode === "hybrid" ? "🔄" : "🏢"} {job.workMode}
            </span>
            {isExpired && <span className="job-deadline-badge expired">Expired</span>}
            {isExpiring && <span className="job-deadline-badge expiring">Expires soon</span>}
          </div>
        </div>

        <h1 className="job-detail-title">{job.title}</h1>

        <div className="job-detail-company">
          <span className="job-detail-company-icon">🏢</span>
          <span>{job.company}</span>
        </div>

        <div className="job-detail-info-grid">
          {job.location && (
            <div className="job-detail-info-item">
              <span className="job-info-icon">📍</span>
              <div>
                <span className="job-info-label">Location</span>
                <strong>{job.location}</strong>
              </div>
            </div>
          )}
          {job.salary && (
            <div className="job-detail-info-item">
              <span className="job-info-icon">💰</span>
              <div>
                <span className="job-info-label">Salary</span>
                <strong>{job.salary}</strong>
              </div>
            </div>
          )}
          {job.workMode && (
            <div className="job-detail-info-item">
              <span className="job-info-icon">{job.workMode === "remote" ? "🏠" : job.workMode === "hybrid" ? "🔄" : "🏢"}</span>
              <div>
                <span className="job-info-label">Work Mode</span>
                <strong style={{ textTransform: "capitalize" }}>{job.workMode}</strong>
              </div>
            </div>
          )}
          {job.deadline && (
            <div className="job-detail-info-item">
              <span className="job-info-icon">📅</span>
              <div>
                <span className="job-info-label">Deadline</span>
                <strong>{formatDate(job.deadline)}</strong>
              </div>
            </div>
          )}
          <div className="job-detail-info-item">
            <span className="job-info-icon">🕐</span>
            <div>
              <span className="job-info-label">Posted</span>
              <strong>{formatDate(job.createdAt)}</strong>
            </div>
          </div>
        </div>

        <div className="job-detail-section">
          <h2>Description</h2>
          <div className="job-detail-description">
            {job.description.split("\n").map((line, i) => (
              <p key={i}>{line || <br />}</p>
            ))}
          </div>
        </div>

        <div className="job-detail-actions">
          {job.applyLink && !isExpired ? (
            <motion.a
              href={job.applyLink}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-apply"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              Apply Now →
            </motion.a>
          ) : isExpired ? (
            <button className="btn" disabled>Application Closed</button>
          ) : null}
          <button className="btn secondary" onClick={() => navigate("/jobs")}>
            Browse More Jobs
          </button>
        </div>
      </div>
    </motion.div>
  );
}
