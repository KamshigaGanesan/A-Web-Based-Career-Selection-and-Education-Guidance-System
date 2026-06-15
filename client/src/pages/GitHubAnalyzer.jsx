import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { api, API_URL } from "../lib/api.js";
import { useAuth } from "../state/auth.jsx";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Filler,
  Legend
} from 'chart.js';
import { Line, Pie, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

const RepoSparkline = ({ activity }) => {
  const dates = Object.keys(activity || {}).sort();
  if (!dates.length) return <div style={{ height: "30px", opacity: 0.3, fontSize: "0.6rem", display: "flex", alignItems: "center", justifyContent: "flex-end" }}>No recent activity</div>;

  const data = {
    labels: dates,
    datasets: [{
      data: dates.map(d => activity[d]),
      borderColor: "var(--primary-color)",
      borderWidth: 2,
      pointRadius: 0,
      tension: 0.4,
      fill: true,
      backgroundColor: "rgba(59, 130, 246, 0.1)"
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { enabled: false } },
    scales: { x: { display: false }, y: { display: false, beginAtZero: true } },
  };

  return <div style={{ height: "30px", width: "80px" }}><Line data={data} options={options} /></div>;
};

export default function GitHubAnalyzer() {
  const { user, token } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [analyzingRepo, setAnalyzingRepo] = useState(null);
  const [repoDetails, setRepoDetails] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async (force = false) => {
    try {
      (force ? setRefreshing(true) : setLoading(true));
      const res = await api.get(`/api/github/analyzer${force ? "?refresh=true" : ""}`, { headers: { Authorization: `Bearer ${token}` } });
      setData(res.data);
      setError("");
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError("Failed to load GitHub data. Please try again later.");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="page-header" style={{ textAlign: "center", marginTop: "10vh" }}>
        <h2 className="gradient-text" style={{ fontSize: "2.5rem" }}>Analyzing Your Digital DNA...</h2>
        <p>Decoding repositories, mapping activity, and consulting Gemini AI.</p>
        <div style={{ marginTop: "3rem" }}>
           <div className="loading-spinner" style={{ width: "60px", height: "60px", margin: "0 auto", border: "4px solid var(--primary-color)", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
        </div>
      </div>
    );
  }

  const handleSaveToken = async (e) => {
    e.preventDefault();
    const tokenInput = e.target.elements.pat.value.trim();
    if (!tokenInput) return;
    try {
      setLoading(true);
      await api.post("/api/github/token", { token: tokenInput }, { headers: { Authorization: `Bearer ${token}` } });
      window.location.reload();
    } catch (err) {
      alert("Failed to save token");
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="page-header" style={{ textAlign: "center", marginTop: "10vh" }}>
        <h2>GitHub Analyzer</h2>
        <div className="card" style={{ maxWidth: "550px", margin: "2rem auto", textAlign: "left" }}>
          <p style={{ color: "var(--danger-color)", marginBottom: "1.5rem", textAlign: "center" }}>{error}</p>
          
          <div style={{ marginBottom: "2rem", padding: "1.5rem", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", background: "rgba(0,0,0,0.2)" }}>
            <h3 style={{ marginBottom: "0.5rem" }}>Option 1: Paste Access Token (Fastest)</h3>
            <p className="small" style={{ marginBottom: "1rem" }}>
              GitHub no longer allows raw passwords. Go to GitHub &rarr; Settings &rarr; Developer Settings &rarr; Personal access tokens (classic), generate one, and paste it below.
            </p>
            <form onSubmit={handleSaveToken} style={{ display: "flex", gap: "0.5rem" }}>
              <input type="password" name="pat" placeholder="ghp_..." className="form-input" style={{ flexGrow: 1 }} required />
              <button type="submit" className="btn btn-primary">Connect</button>
            </form>
          </div>

          <div style={{ textAlign: "center" }}>
             <p className="small" style={{ opacity: 0.6, marginBottom: "1rem" }}>Or use the official OAuth flow:</p>
             <a href={`${API_URL}/auth/github?mode=login`} className="btn btn-glow" style={{ width: "100%" }}>
                Option 2: Connect via GitHub OAuth
             </a>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const pieData = {
    labels: (data?.languageStats || []).slice(0, 5).map(l => l.name),
    datasets: [{
      data: (data?.languageStats || []).slice(0, 5).map(l => l.count),
      backgroundColor: [
        'rgba(59, 130, 246, 0.7)',
        'rgba(16, 185, 129, 0.7)',
        'rgba(245, 158, 11, 0.7)',
        'rgba(239, 68, 68, 0.7)',
        'rgba(139, 92, 246, 0.7)',
      ],
      borderColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: 1,
    }]
  };



  const startDeepAnalysis = async (owner, name) => {
    try {
      setAnalyzingRepo(name);
      const res = await api.get(`/api/github/repo/${owner}/${name}`, { headers: { Authorization: `Bearer ${token}` } });
      setRepoDetails(res.data);
    } catch (err) {
      alert("Failed to analyze repository");
    } finally {
      setAnalyzingRepo(null);
    }
  };

  return (
    <div className="github-analyzer-page">
      {/* Deep Analysis Modal */}
      <AnimatePresence>
        {repoDetails && (
          <div className="modal-overlay" style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
             <motion.div 
               initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
               className="card" style={{ maxWidth: "700px", width: "100%", maxHeight: "90vh", overflowY: "auto" }}
             >
                 <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
                    <h2 className="gradient-text">{repoDetails.repoData.name} Deep Analysis</h2>
                    <button onClick={() => setRepoDetails(null)} className="btn btn-outline">Close</button>
                 </div>

                 {repoDetails.repoInsights.summary && (
                   <div style={{ padding: "1.25rem", background: "rgba(59, 130, 246, 0.1)", borderRadius: "12px", border: "1px solid rgba(59, 130, 246, 0.2)", marginBottom: "1.5rem" }}>
                     <h4 style={{ margin: "0 0 0.5rem 0", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--primary-color)" }}>AI Project Summary</h4>
                     <p style={{ fontSize: "1rem", margin: 0, fontStyle: "italic", lineHeight: "1.6" }}>
                       "{repoDetails.repoInsights.summary}"
                     </p>
                   </div>
                 )}
                 
                 <div className="dashboard-grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
                   <div style={{ padding: "1rem", background: "rgba(0,0,0,0.2)", borderRadius: "10px" }}>
                      <span className="small">README Quality</span>
                      <div style={{ fontSize: "1.2rem", fontWeight: "bold", color: "var(--primary-color)" }}>{repoDetails.repoInsights.readmeQuality}</div>
                   </div>
                   <div style={{ padding: "1rem", background: "rgba(0,0,0,0.2)", borderRadius: "10px" }}>
                      <span className="small">Complexity Score</span>
                      <div style={{ fontSize: "1.2rem", fontWeight: "bold", color: "var(--accent-color)" }}>{repoDetails.repoInsights.complexityScore}/100</div>
                   </div>
                </div>

                 <div style={{ marginBottom: "1.5rem" }}>
                    <h3>✨ Code & Structure Suggestions</h3>
                    
                    {repoDetails.repoInsights.suggestionsSummary && (
                      <div style={{ marginTop: "1rem", marginBottom: "1rem", padding: "1rem", background: "rgba(6, 182, 212, 0.05)", borderLeft: "3px solid var(--accent-color)", borderRadius: "0 8px 8px 0" }}>
                        <p style={{ margin: 0, fontSize: "0.95rem", opacity: 0.9, lineHeight: "1.6" }}>
                          {repoDetails.repoInsights.suggestionsSummary}
                        </p>
                      </div>
                    )}
                    
                    <ul style={{ paddingLeft: "1.5rem", marginTop: "1rem" }}>
                       {repoDetails.repoInsights.suggestions.map((s, i) => <li key={i} style={{ marginBottom: "0.5rem" }}>{s}</li>)}
                    </ul>
                 </div>

                <div style={{ padding: "1rem", border: "1px solid rgba(16, 185, 129, 0.3)", borderRadius: "10px", background: "rgba(16, 185, 129, 0.05)", marginBottom: "1.5rem" }}>
                   <strong>🧪 Test Detection:</strong> {repoDetails.repoInsights.testDetection}
                </div>

                {repoDetails.generatedReadme && (
                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "1.5rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                      <h3>📄 AI Generated README.md</h3>
                      <button 
                        className="btn btn-sm btn-primary"
                        onClick={() => {
                          navigator.clipboard.writeText(repoDetails.generatedReadme);
                          alert("README copied to clipboard!");
                        }}
                      >
                        Copy Markdown
                      </button>
                    </div>
                    <div style={{ 
                      background: "rgba(0,0,0,0.3)", 
                      padding: "1rem", 
                      borderRadius: "8px", 
                      fontFamily: "monospace", 
                      fontSize: "0.85rem", 
                      maxHeight: "300px", 
                      overflowY: "auto",
                      whiteSpace: "pre-wrap",
                      border: "1px solid rgba(255,255,255,0.05)"
                    }}>
                      {repoDetails.generatedReadme}
                    </div>
                  </div>
                )}

             </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <Link to="/dashboard" className="btn btn-outline" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          &larr; Dashboard
        </Link>
        <div style={{ display: "flex", gap: "1rem" }}>
           {data.isCached && (
             <div style={{ padding: "0.5rem 1rem", background: "rgba(255,255,255,0.05)", borderRadius: "10px", fontSize: "0.8rem", display: "flex", alignItems: "center", border: "1px solid rgba(255,255,255,0.1)" }}>
               🕒 Cached ({Math.round((Date.now() - new Date(data.createdAt).getTime()) / 60000)}m ago)
             </div>
           )}
           <button className="btn btn-outline" onClick={() => fetchData(true)} disabled={refreshing}>
              {refreshing ? "Refreshing..." : "Refresh Analysis"}
           </button>
           <button className="btn btn-outline" onClick={async () => {
              try {
                await api.post("/api/github/save", data, { headers: { Authorization: `Bearer ${token}` } });
                alert("Analysis saved to your history!");
              } catch (err) {
                alert("Failed to save analysis.");
              }
           }}>Save Analysis</button>
           <Link to="/github/history" className="btn btn-outline">View History</Link>
           <Link to="/github/notifications" className="btn btn-outline">⏰ Notifications</Link>
        </div>
      </div>

      {/* Header Profile Info */}
      <div className="page-header" style={{ marginBottom: "3rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "2rem", flexWrap: "wrap" }}>
          <motion.img 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            src={data?.profile?.avatar_url} 
            alt="Avatar" 
            style={{ width: "120px", height: "120px", borderRadius: "24px", border: "4px solid var(--primary-color)", boxShadow: "0 0 20px rgba(59, 130, 246, 0.3)" }} 
          />
          <div style={{ flex: 1 }}>
            <motion.h1 initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="gradient-text" style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>
              {data?.profile?.login}
            </motion.h1>
            <p style={{ fontSize: "1.2rem", opacity: 0.8 }}>{data?.profile?.bio || "No bio set on GitHub"}</p>
            <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
              <span className="status-badge active" style={{ fontSize: "0.9rem" }}>🔥 {data.aiInsights?.developerPersonality || "Code Explorer"}</span>
              <span className="status-badge info" style={{ fontSize: "0.9rem" }}>🎯 {data.aiInsights?.careerPath || "Developer"}</span>
              {data.aiInsights?.isAiQuotaExceeded && (
                <span className="status-badge danger" style={{ fontSize: "0.8rem", animation: "pulse 2s infinite" }}>⚠️ AI Daily Limit Reached</span>
              )}
            </div>
          </div>
          
          {/* Quick Stats Grid */}
          <div className="dashboard-grid" style={{ gridTemplateColumns: "repeat(2, 1fr)", gap: "1rem", width: "300px" }}>
            <div className="card" style={{ padding: "1rem", textAlign: "center" }}>
               <h2 style={{ margin: 0, color: "var(--primary-color)" }}>{data?.profile?.public_repos || 0}</h2>
               <div className="small">Repos</div>
            </div>
            <div className="card" style={{ padding: "1rem", textAlign: "center" }}>
               <h2 style={{ margin: 0, color: "var(--accent-color)" }}>{data?.profile?.followers || 0}</h2>
               <div className="small">Followers</div>
            </div>
            <div className="card" style={{ padding: "1rem", textAlign: "center" }}>
               <h2 style={{ margin: 0, color: "#10b981" }}>{data?.stats?.totalCommits || 0}</h2>
               <div className="small">Commits</div>
            </div>
            <div className="card" style={{ padding: "1rem", textAlign: "center" }}>
               <h2 style={{ margin: 0, color: "#f59e0b" }}>{data?.stats?.currentStreak || 0}</h2>
               <div className="small">Streak</div>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "2rem", marginBottom: "2rem" }}>
        
        {/* Core Analysis Chart */}
        <motion.div 
          className="card" 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          style={{ gridColumn: "span 2" }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
            <h3>Coding Activity Timeline</h3>
            <div className="small" style={{ color: "var(--text-off)" }}>Recent Push Events</div>
          </div>
          <div style={{ height: "350px" }}>
            {data?.chartData?.labels?.length > 0 ? (
              <Line 
                data={data.chartData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                     y: { beginAtZero: true, grid: { color: "rgba(255, 255, 255, 0.05)" } },
                     x: { grid: { display: false } }
                  },
                  plugins: {
                     legend: { display: false },
                     tooltip: { backgroundColor: "rgba(10, 10, 15, 0.9)", borderColor: "var(--primary-color)", borderWidth: 1 }
                  }
                }} 
              />
            ) : (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", opacity: 0.5 }}>
                No recent activity found. Keep coding!
              </div>
            )}
          </div>
        </motion.div>

        {/* AI Insight 1: Personality & Readiness */}
        <motion.div className="card" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
             <h3>Hiring Readiness</h3>
             <div style={{ position: "relative", width: "160px", height: "160px", margin: "1.5rem auto" }}>
                <svg viewBox="0 0 36 36" style={{ width: "100%", height: "100%" }}>
                   <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
                   <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--primary-color)" strokeWidth="3" strokeDasharray={`${data?.aiInsights?.hiringReadinessScore || 0}, 100`} />
                   <text x="18" y="20.35" className="percentage" dominantBaseline="middle" textAnchor="middle" style={{ fill: "white", fontSize: "0.5rem", fontWeight: "bold" }}>{data?.aiInsights?.hiringReadinessScore || 0}%</text>
                </svg>
             </div>
             <p className="small">Your profile is more complete than {data.aiInsights.hiringReadinessScore}% of junior developers.</p>
          </div>
          
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {data?.aiInsights?.resumeSkills?.map(skill => (
              <span key={skill} className="status-badge" style={{ background: "rgba(59, 130, 246, 0.1)", border: "1px solid rgba(59, 130, 246, 0.3)" }}>
                {skill}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Language Pie Chart */}
        <motion.div className="card" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
           <h3>Language Distribution</h3>
           <p className="small" style={{ marginBottom: "1.5rem" }}>Based on primary language per repository.</p>
           <div style={{ height: "250px", display: "flex", justifyContent: "center" }}>
              <Pie 
                data={pieData} 
                options={{ 
                  responsive: true, 
                  plugins: { 
                    legend: { position: 'bottom', labels: { color: 'white', padding: 20 } } 
                  } 
                }} 
              />
           </div>
        </motion.div>

      </div>

      <div className="dashboard-grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "2rem", marginBottom: "3rem" }}>
        
        {/* Improvement Suggestions */}
        <motion.div className="card" style={{ borderLeft: "4px solid var(--accent-color)" }} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h3 style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>🚀 Improvement Suggestions</h3>
          <div style={{ marginTop: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
            {data?.aiInsights?.improvementSuggestions?.length > 0 ? (
              data.aiInsights.improvementSuggestions.map((item, idx) => (
                <div key={idx} style={{ padding: "1rem", background: "rgba(0,0,0,0.2)", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <strong style={{ color: "var(--primary-color)", fontSize: "0.8rem", textTransform: "uppercase" }}>{item.category}</strong>
                  <p style={{ margin: "5px 0 0 0" }}>{item.text}</p>
                </div>
              ))
            ) : (
              <p className="small" style={{ opacity: 0.6, fontStyle: "italic" }}>
                Improvement suggestions are currently unavailable. This usually happens when the AI is reaching its daily limit. Please try again later!
              </p>
            )}
          </div>
        </motion.div>

        {/* Learning Roadmap */}
        <motion.div className="card" style={{ borderLeft: "4px solid #10b981" }} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <h3>🎯 Personalized Learning Roadmap</h3>
          <div style={{ marginTop: "1.5rem" }}>
            {data?.aiInsights?.learningRoadmap?.length > 0 ? (
              data.aiInsights.learningRoadmap.map((item, idx) => (
                <div key={idx} style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}>
                  <div style={{ width: "30px", height: "30px", borderRadius: "50%", background: "#10b981", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{idx + 1}</div>
                  <div>
                    <strong>{item.skill}</strong>
                    <p className="small" style={{ opacity: 0.7 }}>{item.reason}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="small" style={{ opacity: 0.6, fontStyle: "italic" }}>
                Roadmap data is currently being generated. Check back in a few minutes!
              </p>
            )}
          </div>
        </motion.div>

      </div>

      {/* Repo Quality Checker */}
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "1.5rem" }}>
           <div>
              <h2>Repository Quality Rankings</h2>
              <p className="small">Analysis of your top projects based on structure and engagement.</p>
           </div>
           <div style={{ padding: "0.8rem 1.5rem", background: "rgba(59, 130, 246, 0.1)", borderRadius: "12px", border: "1px solid rgba(59, 130, 246, 0.3)" }}>
              <span className="small">Global Profile Strength</span>
              <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "var(--primary-color)" }}>{data?.stats?.profileStrength || 0}/100</div>
           </div>
        </div>

        <div className="dashboard-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))" }}>
          {data.repoQuality.map((repo, idx) => (
             <motion.div 
               whileHover={{ y: -5 }}
               key={repo.id} 
               className="card" 
               style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
             >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <h3 style={{ margin: 0, fontSize: "1.1rem" }}>
                    <a href={repo.url} target="_blank" rel="noreferrer" style={{ color: "var(--text-color)", textDecoration: "none" }}>{repo.name}</a>
                  </h3>
                  <div className={`status-badge ${repo.score > 75 ? 'active' : repo.score > 45 ? 'warning' : 'danger'}`} style={{ fontWeight: "bold" }}>
                    {repo.score}
                  </div>
                </div>
                
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginBottom: "0.5rem" }}>
                   {repo.errors && repo.errors.map((err, i) => (
                     <span key={i} className="status-badge danger" style={{ fontSize: "0.65rem", padding: "2px 6px" }}>
                       {err}
                     </span>
                   ))}
                </div>

                <p className="small" style={{ flexGrow: 1, opacity: 0.7 }}>
                  {repo.description || "No description provided."}
                </p>


                <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", gap: "1rem", fontSize: "0.8rem", alignItems: "center" }}>
                    <span>⭐ {repo.stars}</span>
                    <span>🔄 {repo.forks}</span>
                    <RepoSparkline activity={repo.recentActivity} />
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    {repo.language && (
                      <span className="status-badge" style={{ background: "rgba(255,255,255,0.05)", fontSize: "0.7rem" }}>
                        {repo.language}
                      </span>
                    )}
                    <button 
                      className="btn btn-sm" 
                      style={{ padding: "4px 8px", fontSize: "0.7rem" }}
                      onClick={() => startDeepAnalysis(data.profile.login, repo.name)}
                      disabled={analyzingRepo === repo.name}
                    >
                      {analyzingRepo === repo.name ? "..." : "Deep Analyze AI"}
                    </button>
                  </div>
                </div>
             </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Footer Suggestions */}
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
        style={{ marginTop: "4rem", textAlign: "center", padding: "3rem", background: "linear-gradient(rgba(59, 130, 246, 0.05), transparent)", borderRadius: "20px" }}
      >
         <h3>Ready to take the next step?</h3>
         <p style={{ marginBottom: "2rem" }}>Based on your {data.aiInsights.careerPath} profile, we recommend checking these careers:</p>
         <div style={{ display: "flex", justifyContent: "center", gap: "1rem" }}>
            <Link to="/careers" className="btn btn-glow">Browse Careers</Link>
            <Link to="/jobs" className="btn btn-outline">Find Jobs</Link>
         </div>
      </motion.div>
    </div>
  );
}
