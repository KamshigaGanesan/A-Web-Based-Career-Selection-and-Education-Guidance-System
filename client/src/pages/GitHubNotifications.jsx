import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../lib/api.js";
import { useAuth } from "../state/auth.jsx";

export default function GitHubNotifications() {
  const { user, token } = useAuth();
  const [enabled, setEnabled] = useState(false);
  const [time, setTime] = useState("09:00");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifs, setLoadingNotifs] = useState(true);

  useEffect(() => {
    // Fetch current settings
    api.get("/auth/me", { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        setEnabled(res.data.githubNotificationEnabled || false);
        setTime(res.data.githubNotificationTime || "09:00");
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));

    // Fetch actual notifications
    api.get("/api/github/notifications/list", { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setNotifications(res.data))
      .catch(err => console.error("Failed to fetch notifications", err))
      .finally(() => setLoadingNotifs(false));
  }, [token]);

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.post("/api/github/notifications", { enabled, time }, { headers: { Authorization: `Bearer ${token}` } });
      alert("Notification settings updated!");
    } catch (err) {
      alert("Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="page-header"><h2>Loading Settings...</h2></div>;

  return (
    <div className="github-notifications-page">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <Link to="/github-analyzer" className="btn btn-outline">&larr; Back to Analyzer</Link>
        <h1 className="gradient-text">GitHub Notifications</h1>
      </div>

      <div className="dashboard-grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "2rem", alignItems: "start" }}>
        {/* Settings Card */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
          className="card"
        >
          <div style={{ marginBottom: "2rem" }}>
             <h3>Email Preferences</h3>
             <p className="small">Configure how you receive your daily GitHub reports.</p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem", padding: "1.5rem", background: "rgba(255,255,255,0.05)", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)" }}>
             <input 
               type="checkbox" 
               id="toggle-notifs" 
               checked={enabled} 
               onChange={(e) => setEnabled(e.target.checked)} 
               style={{ width: "24px", height: "24px", cursor: "pointer" }}
             />
             <label htmlFor="toggle-notifs" style={{ cursor: "pointer", fontWeight: "bold" }}>
               Enable Daily Email Notifications
             </label>
          </div>

          <AnimatePresence>
            {enabled && (
               <motion.div 
                 initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                 style={{ overflow: "hidden", marginBottom: "2rem" }}
               >
                  <label className="small" style={{ display: "block", marginBottom: "0.5rem" }}>Preferred Time (Daily)</label>
                  <input 
                    type="time" 
                    className="form-input" 
                    value={time} 
                    onChange={(e) => setTime(e.target.value)} 
                    style={{ width: "100%", fontSize: "1.2rem", padding: "1rem" }}
                  />
                  <p className="small" style={{ marginTop: "1rem", opacity: 0.6 }}>Emails will be sent at exactly {time} in your server's timezone.</p>
               </motion.div>
            )}
          </AnimatePresence>

          <button 
            className="btn btn-glow" 
            onClick={handleSave} 
            disabled={saving}
            style={{ width: "100%", padding: "1.2rem" }}
          >
            {saving ? "Saving Changes..." : "Save Preferences"}
          </button>
        </motion.div>

        {/* Real-time Notifications list */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
          className="card"
        >
           <h3 style={{ marginBottom: "1rem" }}>Recent Repository Activity</h3>
           <p className="small" style={{ marginBottom: "2rem" }}>Latest pushes, pulls, and issues tracked from your GitHub.</p>

           {loadingNotifs ? (
             <div style={{ textAlign: "center", padding: "2rem" }}>Loading activity...</div>
           ) : (
             <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {notifications.length > 0 ? (
                  notifications.map((notif) => (
                    <div key={notif._id} style={{ padding: "1rem", background: "rgba(255,255,255,0.03)", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                       <div>
                          <div style={{ fontWeight: "bold", fontSize: "0.95rem" }}>{notif.message}</div>
                          <div className="small" style={{ opacity: 0.6 }}>in {notif.repoName} by {notif.actor}</div>
                       </div>
                       <div className="small" style={{ opacity: 0.5, fontSize: "0.75rem" }}>
                          {new Date(notif.createdAt).toLocaleDateString()}
                       </div>
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: "center", padding: "2rem", opacity: 0.5 }}>
                     No recent activity found. Changes in your repos will appear here!
                  </div>
                )}
             </div>
           )}
        </motion.div>
      </div>
    </div>
  );
}
