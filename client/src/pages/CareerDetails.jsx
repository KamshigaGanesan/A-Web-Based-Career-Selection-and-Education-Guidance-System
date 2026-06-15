import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api } from "../lib/api.js";
import { useAuth } from "../state/auth.jsx";
import SkillBadge from "../components/SkillBadge.jsx";
import RelatedCareers from "../components/RelatedCareers.jsx";

const DEMAND_COLORS = {
  High: "demand-high",
  Medium: "demand-medium",
  Low: "demand-low",
};

function formatSalary(n) {
  return n?.toLocaleString() || "0";
}

export default function CareerDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [career, setCareer] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [compareIds, setCompareIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem("compareCareerIds") || "[]"); }
    catch { return []; }
  });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [careerRes, relatedRes] = await Promise.all([
          api.get(`/api/careers/${id}`),
          api.get(`/api/careers/${id}/related`),
        ]);
        setCareer(careerRes.data);
        setRelated(relatedRes.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load career");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  useEffect(() => {
    if (user?._id) {
      api.get(`/api/careers/saved/${user._id}`)
        .then(({ data }) => setIsSaved(data.some((c) => c._id === id)))
        .catch(() => {});
    }
  }, [user, id]);

  useEffect(() => {
    localStorage.setItem("compareCareerIds", JSON.stringify(compareIds));
  }, [compareIds]);

  const toggleSave = async () => {
    if (!user?._id) return navigate("/login");
    try {
      if (isSaved) {
        await api.delete(`/api/careers/${id}/save?userId=${user._id}`);
        setIsSaved(false);
      } else {
        await api.post(`/api/careers/${id}/save`, { userId: user._id });
        setIsSaved(true);
      }
    } catch {}
  };

  const toggleCompare = () => {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  };

  if (loading) {
    return (
      <div className="careers-page" style={{ animation: "fadeIn 0.3s ease" }}>
        <div className="career-detail-skeleton card" style={{ height: 400 }} />
      </div>
    );
  }

  if (error || !career) {
    return (
      <div className="careers-page">
        <div className="elig-error-banner">{error || "Career not found"}</div>
        <Link to="/careers" className="btn secondary">← Back to Careers</Link>
      </div>
    );
  }

  const isCompared = compareIds.includes(id);

  return (
    <div className="careers-page" style={{ animation: "fadeIn 0.4s ease" }}>
      <Link to="/careers" className="btn secondary" style={{ alignSelf: "flex-start", marginBottom: 12 }}>
        ← Back to Careers
      </Link>

      <div className="career-detail-card card">
        {career.imageUrl && (
          <img src={career.imageUrl} alt={career.title} className="career-detail-img" />
        )}

        <div className="career-detail-header">
          <div>
            <h1 style={{ margin: "0 0 8px", fontSize: "1.8rem" }}>{career.title}</h1>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <span className={`career-demand-badge ${DEMAND_COLORS[career.demandLevel] || ""}`}>
                {career.demandLevel} Demand
              </span>
              {career.streamTags?.map((t) => (
                <span key={t} className="career-stream-tag">{t}</span>
              ))}
            </div>
          </div>
          <div className="career-detail-actions">
            <button className={`btn ${isSaved ? "" : "secondary"}`} onClick={toggleSave}>
              {isSaved ? "♥ Saved" : "♡ Save"}
            </button>
            <button
              className={`btn secondary ${isCompared ? "compare-active" : ""}`}
              onClick={toggleCompare}
              disabled={!isCompared && compareIds.length >= 3}
            >
              {isCompared ? "✓ In Compare" : "⚖ Compare"}
            </button>
            {compareIds.length > 0 && (
              <button className="btn" onClick={() => navigate("/careers/compare")}>
                View Compare ({compareIds.length})
              </button>
            )}
          </div>
        </div>

        <div className="career-detail-salary">
          <div className="career-detail-salary-item">
            <span className="small">Minimum Salary</span>
            <strong>LKR {formatSalary(career.salaryMinLKR)}</strong>
          </div>
          <div className="career-detail-salary-item">
            <span className="small">Maximum Salary</span>
            <strong>LKR {formatSalary(career.salaryMaxLKR)}</strong>
          </div>
        </div>

        <div className="career-detail-section">
          <h3>Description</h3>
          <p style={{ lineHeight: 1.7, color: "#374151" }}>{career.description}</p>
        </div>

        {career.workEnvironment && (
          <div className="career-detail-section">
            <h3>Work Environment</h3>
            <p style={{ color: "#374151" }}>{career.workEnvironment}</p>
          </div>
        )}

        {career.educationPaths?.length > 0 && (
          <div className="career-detail-section">
            <h3>Education Paths</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {career.educationPaths.map((p) => (
                <span key={p} className="pill">{p}</span>
              ))}
            </div>
          </div>
        )}

        {career.requiredSkills?.length > 0 && (
          <div className="career-detail-section">
            <h3>Required Skills</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {career.requiredSkills.map((s) => (
                <SkillBadge key={s} skill={s} />
              ))}
            </div>
          </div>
        )}
      </div>

      <RelatedCareers careers={related} />
    </div>
  );
}
