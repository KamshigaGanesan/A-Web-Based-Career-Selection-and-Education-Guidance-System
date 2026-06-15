import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../lib/api.js";
import { useAuth } from "../state/auth.jsx";

export default function OAuthSuccess() {
  const [params] = useSearchParams();
  const nav = useNavigate();
  const { setToken, setUser } = useAuth();

  useEffect(() => {
    const token = params.get("token");
    if (!token) {
      nav("/login", { replace: true });
      return;
    }

    async function finalize() {
      setToken(token);
      try {
        const res = await api.get("/auth/me", { headers: { Authorization: `Bearer ${token}` } });
        setUser({ name: res.data.name, email: res.data.email, id: res.data.id });
      } catch {
        // if /me fails, still keep token; user can retry
      }
      const provider = params.get("provider");
      if (provider === "github") {
        nav("/github-analyzer", { replace: true });
      } else {
        nav("/dashboard", { replace: true });
      }
    }

    finalize();
  }, [params, nav, setToken, setUser]);

  return (
    <div className="card">
      <h2>Signing you in…</h2>
      <p className="small">Finishing Google authentication.</p>
    </div>
  );
}
