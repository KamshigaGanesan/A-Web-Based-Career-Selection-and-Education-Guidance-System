import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import adminApi from "../../services/adminApi.js";
import Sidebar from "../../components/admin/Sidebar.jsx";

const statCards = [
  { key: "totalUsers", label: "Users", icon: "👥", color: "#6366f1", link: "/admin/users" },
  { key: "totalCareers", label: "Careers", icon: "💼", color: "#f59e0b", link: "/admin/careers" },
  { key: "totalUniversities", label: "Universities", icon: "🎓", color: "#10b981", link: "/admin/universities" },
  { key: "totalPrograms", label: "Programs", icon: "📚", color: "#8b5cf6", link: "/admin/universities" },
  { key: "totalQuizQuestions", label: "Quiz Q's", icon: "❓", color: "#ec4899", link: "/admin/quizzes" },
  { key: "totalJobs", label: "Jobs", icon: "🏢", color: "#14b8a6", link: "/admin/jobs" },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.get("/stats").then(({ data }) => {
      setStats(data.data.stats);
      setRecent(data.data.recentActivity);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <div className="admin-layout">
      <Sidebar />
      <main className="admin-main">
        <h1 style={{ margin: "0 0 24px" }}>Dashboard</h1>

        <div className="admin-stats-grid">
          {statCards.map((s) => (
            <Link key={s.key} to={s.link} className="admin-stat-card card">
              <span style={{ fontSize: 32 }}>{s.icon}</span>
              <span className="admin-stat-number" style={{ color: s.color }}>
                {loading ? "—" : stats?.[s.key] ?? 0}
              </span>
              <span className="small">{s.label}</span>
            </Link>
          ))}
        </div>

        {recent && (
          <div className="row" style={{ marginTop: 28 }}>
            <div className="col card" style={{ padding: 20 }}>
              <h3 style={{ margin: "0 0 12px" }}>Recent Users</h3>
              {recent.recentUsers?.length ? (
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                  {recent.recentUsers.map((u) => (
                    <li key={u._id} className="admin-recent-item">
                      <strong>{u.name}</strong>
                      <span className="small">{u.email}</span>
                    </li>
                  ))}
                </ul>
              ) : <p className="small">No users yet</p>}
            </div>

            <div className="col card" style={{ padding: 20 }}>
              <h3 style={{ margin: "0 0 12px" }}>Recent Jobs</h3>
              {recent.recentJobs?.length ? (
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                  {recent.recentJobs.map((j) => (
                    <li key={j._id} className="admin-recent-item">
                      <strong>{j.title}</strong>
                      <span className="small">{j.company} — {j.type}</span>
                    </li>
                  ))}
                </ul>
              ) : <p className="small">No jobs yet</p>}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
