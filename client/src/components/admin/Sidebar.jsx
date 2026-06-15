import React from "react";
import { NavLink, useNavigate } from "react-router-dom";

const links = [
  { to: "/admin/dashboard", label: "Dashboard", icon: "📊" },
  { to: "/admin/careers", label: "Careers", icon: "💼" },
  { to: "/admin/courses", label: "Courses", icon: "📚" },
  { to: "/admin/zscore", label: "Z-Score", icon: "📈" },
  { to: "/admin/quizzes", label: "Quizzes", icon: "❓" },
  { to: "/admin/jobs", label: "Jobs", icon: "🏢" },
  { to: "/admin/universities", label: "Universities", icon: "🎓" },
  { to: "/admin/users", label: "Users", icon: "👥" },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const adminUser = JSON.parse(localStorage.getItem("adminUser") || "{}");

  function handleLogout() {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    navigate("/admin/login");
  }

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-brand">
        <span className="admin-logo">M</span>
        <div>
          <strong>Moosika</strong>
          <span className="admin-sidebar-sub">Admin Panel</span>
        </div>
      </div>

      <nav className="admin-sidebar-nav">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            className={({ isActive }) =>
              `admin-nav-link${isActive ? " active" : ""}`
            }
          >
            <span className="admin-nav-icon">{l.icon}</span>
            {l.label}
          </NavLink>
        ))}
      </nav>

      <div className="admin-sidebar-footer">
        <div className="admin-sidebar-user">
          <span className="admin-avatar">{adminUser.name?.[0] || "A"}</span>
          <div>
            <strong>{adminUser.name || "Admin"}</strong>
            <span className="admin-sidebar-sub">{adminUser.role || "editor"}</span>
          </div>
        </div>
        <button className="btn secondary" style={{ width: "100%" }} onClick={handleLogout}>
          Logout
        </button>
      </div>
    </aside>
  );
}
