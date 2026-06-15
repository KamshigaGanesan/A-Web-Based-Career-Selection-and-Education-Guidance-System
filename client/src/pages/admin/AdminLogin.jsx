import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import adminApi from "../../services/adminApi.js";

const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
    <line x1="2" y1="2" x2="22" y2="22" />
  </svg>
);

export default function AdminLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function onChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!form.email || !form.password) {
      return setError("Email and password are required");
    }
    if (!/\S+@\S+\.\S+/.test(form.email)) {
      return setError("Enter a valid email address");
    }

    setLoading(true);
    try {
      const { data } = await adminApi.post("/login", form);
      localStorage.setItem("adminToken", data.data.token);
      localStorage.setItem("adminUser", JSON.stringify(data.data.admin));
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-login-page">
      <div className="admin-login-card card">
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <span className="admin-logo" style={{ fontSize: 40, width: 64, height: 64, lineHeight: "64px" }}>M</span>
          <h2 style={{ margin: "12px 0 4px" }}>Moosika Admin</h2>
          <p className="small">Sign in to the admin panel</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="form-group">
            <label className="small" style={{ fontWeight: 600 }}>Email</label>
            <input
              className="input"
              name="email"
              type="email"
              placeholder="admin@moosika.com"
              value={form.email}
              onChange={onChange}
            />
          </div>

          <div className="form-group">
            <label className="small" style={{ fontWeight: 600 }}>Password</label>
            <div style={{ position: "relative" }}>
              <input
                className="input"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                value={form.password}
                onChange={onChange}
                style={{ paddingRight: "40px" }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  color: "#6b7280",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>

          {error && <p className="error">{error}</p>}

          <button className="btn" type="submit" disabled={loading} style={{ marginTop: 4 }}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
