import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, Link, useLocation, NavLink } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Home from "./pages/Home.jsx";
import Register from "./pages/Register.jsx";
import Login from "./pages/Login.jsx";
import OAuthSuccess from "./pages/OAuthSuccess.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Courses from "./pages/Courses.jsx";
import CourseDetail from "./pages/CourseDetail.jsx";
import AddCourse from "./pages/AddCourse.jsx";
import Quiz from "./pages/Quiz.jsx";
import QuizResult from "./pages/QuizResult.jsx";
import QuizReview from "./pages/QuizReview.jsx";
import QuizHistory from "./pages/QuizHistory.jsx";
import AlternativePaths from "./pages/AlternativePaths.jsx";
import PathDetails from "./pages/PathDetails.jsx";
import PathComparison from "./pages/PathComparison.jsx";
import Recommendations from "./pages/Recommendations.jsx";
import StudentForm from "./pages/StudentForm.jsx";
import EligibilityCheckPage from "./pages/EligibilityCheck.jsx";
import EligibilityHistory from "./pages/EligibilityHistory.jsx";
import CareersList from "./pages/CareersList.jsx";
import CareerDetails from "./pages/CareerDetails.jsx";
import CareerComparison from "./pages/CareerComparison.jsx";
import SavedCareers from "./pages/SavedCareers.jsx";
import GitHubAnalyzer from "./pages/GitHubAnalyzer.jsx";
import GitHubHistory from "./pages/GitHubHistory.jsx";
import GitHubNotifications from "./pages/GitHubNotifications.jsx";
import Jobs from "./pages/Jobs.jsx";
import JobDetail from "./pages/JobDetail.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import AdminLogin from "./pages/admin/AdminLogin.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import ManageCareers from "./pages/admin/ManageCareers.jsx";
import ManageCourses from "./pages/admin/ManageCourses.jsx";
import ManageZScore from "./pages/admin/ManageZScore.jsx";
import ManageQuizzes from "./pages/admin/ManageQuizzes.jsx";
import ManageJobs from "./pages/admin/ManageJobs.jsx";
import ManageUniversities from "./pages/admin/ManageUniversities.jsx";
import ManageUsers from "./pages/admin/ManageUsers.jsx";
import AdminProtectedRoute from "./components/admin/ProtectedRoute.jsx";
import { useAuth } from "./state/auth.jsx";
import { setAuthToken } from "./lib/api.js";

const NAV_LINKS = [
  { to: "/careers", label: "Careers", icon: "🎯" },
  { to: "/courses", label: "Courses", icon: "📚" },
  { to: "/jobs", label: "Jobs", icon: "💼" },
  { to: "/alternatives", label: "Pathways", icon: "🗺️" },
  { to: "/quiz", label: "Quiz", icon: "✍️" },
  { to: "/eligibility", label: "Eligibility", icon: "✅" },
];

function Layout({ children }) {
  const { user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <motion.nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled 
            ? "bg-white/80 backdrop-blur-lg shadow-sm border-b border-slate-200 py-2" 
            : "bg-transparent py-4"
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group transition-transform hover:scale-105">
            <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-indigo-600 to-indigo-400 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 group-hover:rotate-[-6deg] transition-transform">
              CG
            </div>
            <span className="text-slate-900 font-extrabold text-lg tracking-tight hidden sm:block">
              Career Guidance
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                    isActive
                      ? "bg-indigo-50 text-indigo-600"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`
                }
              >
                <span className="text-base">{link.icon}</span>
                {link.label}
              </NavLink>
            ))}

            <div className="h-6 w-px bg-slate-200 mx-2" />

            {user ? (
              <div className="flex items-center gap-3">
                <Link 
                  to="/dashboard" 
                  className="flex items-center gap-2 pl-1 pr-3 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 rounded-full transition-colors group"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-400 text-white flex items-center justify-center text-xs font-bold ring-2 ring-white">
                    {user.name?.[0]?.toUpperCase() || "U"}
                  </div>
                  <span className="text-sm font-semibold pr-1">{user.name?.split(" ")[0]}</span>
                </Link>
                <button 
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-rose-600 transition-colors"
                  onClick={logout}
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link 
                  to="/login" 
                  className="px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="btn-glow px-5 py-2 text-sm font-semibold rounded-xl"
                >
                  Join Free
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            className="md:hidden p-2 rounded-xl bg-slate-100 text-slate-600 focus:outline-none"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
            )}
          </button>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-b border-slate-200 overflow-hidden"
            >
              <div className="px-4 pt-2 pb-6 space-y-1">
                {NAV_LINKS.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold transition-colors ${
                        isActive ? "bg-indigo-50 text-indigo-600" : "text-slate-600 hover:bg-slate-50"
                      }`
                    }
                  >
                    <span>{link.icon}</span>
                    {link.label}
                  </NavLink>
                ))}
                <div className="pt-4 flex flex-col gap-2">
                  {user ? (
                    <>
                      <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-xl">
                        <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">
                          {user.name?.[0]?.toUpperCase()}
                        </div>
                        <div className="font-semibold">{user.name}</div>
                      </Link>
                      <button onClick={logout} className="w-full text-left px-4 py-3 text-rose-600 font-semibold">Logout</button>
                    </>
                  ) : (
                    <>
                      <Link to="/login" className="w-full text-center py-3 font-semibold text-slate-700 bg-slate-50 rounded-xl">Login</Link>
                      <Link to="/register" className="w-full text-center py-3 font-semibold text-white bg-indigo-600 rounded-xl shadow-lg shadow-indigo-100">Sign Up</Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      <main className="flex-grow pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>

      <footer className="bg-slate-900 text-slate-300 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            <div className="space-y-6">
              <Link to="/" className="flex items-center gap-2 group">
                <div className="w-10 h-10 flex items-center justify-center bg-indigo-500 text-white font-bold rounded-xl">CG</div>
                <span className="text-white font-bold text-xl">Career Guidance</span>
              </Link>
              <p className="text-slate-400 text-sm leading-relaxed">
                Empowering students with smart assessments, personalized roadmaps, and data-driven insights to navigate their future with confidence.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-6">Explore</h4>
              <ul className="space-y-4 text-sm">
                <li><Link to="/careers" className="hover:text-indigo-400 transition-colors">Career Database</Link></li>
                <li><Link to="/courses" className="hover:text-indigo-400 transition-colors">Course Finder</Link></li>
                <li><Link to="/jobs" className="hover:text-indigo-400 transition-colors">Job Portal</Link></li>
                <li><Link to="/alternatives" className="hover:text-indigo-400 transition-colors">Educational Pathways</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-6">Tools</h4>
              <ul className="space-y-4 text-sm">
                <li><Link to="/quiz" className="hover:text-indigo-400 transition-colors">Personalized Quiz</Link></li>
                <li><Link to="/eligibility" className="hover:text-indigo-400 transition-colors">Z-Score Eligibility</Link></li>
                <li><Link to="/recommendations" className="hover:text-indigo-400 transition-colors">AI Recommendations</Link></li>
                <li><Link to="/github-analyzer" className="hover:text-indigo-400 transition-colors">GitHub Skill Analyzer</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-6">Stay Connected</h4>
              <p className="text-sm mb-4">Start your journey today and get the guidance you deserve.</p>
              <Link to="/register" className="inline-block px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-all">Get Started</Link>
            </div>
          </div>
          
          <div className="pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
            <p>&copy; {new Date().getFullYear()} Career Guidance Platform. Built with passion for students.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function PrivateRoute({ children }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" replace />;
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/oauth-success" element={<OAuthSuccess />} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/:id" element={<CourseDetail />} />
          <Route path="/add-course" element={<PrivateRoute><AddCourse /></PrivateRoute>} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/quiz/result/:id" element={<QuizResult />} />
          <Route path="/quiz/review/:id" element={<QuizReview />} />
          <Route path="/quiz/history/:userId" element={<QuizHistory />} />
          <Route path="/alternatives" element={<AlternativePaths />} />
          <Route path="/alternatives/compare" element={<PathComparison />} />
          <Route path="/alternatives/:id" element={<PathDetails />} />
          <Route path="/recommendations" element={<Recommendations />} />
          <Route path="/eligibility" element={<StudentForm />} />
          <Route path="/eligibility/check" element={<EligibilityCheckPage />} />
          <Route path="/eligibility/history" element={<EligibilityHistory />} />
          <Route path="/careers" element={<CareersList />} />
          <Route path="/careers/compare" element={<CareerComparison />} />
          <Route path="/careers/saved" element={<PrivateRoute><SavedCareers /></PrivateRoute>} />
          <Route path="/github-analyzer" element={<PrivateRoute><GitHubAnalyzer /></PrivateRoute>} />
          <Route path="/github/history" element={<PrivateRoute><GitHubHistory /></PrivateRoute>} />
          <Route path="/github/notifications" element={<PrivateRoute><GitHubNotifications /></PrivateRoute>} />
          <Route path="/careers/:id" element={<CareerDetails />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/jobs/:id" element={<JobDetail />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  const { token } = useAuth();
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");
  useEffect(() => setAuthToken(token), [token]);

  if (isAdmin) {
    return (
      <Routes>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
        <Route path="/admin/careers" element={<AdminProtectedRoute><ManageCareers /></AdminProtectedRoute>} />
        <Route path="/admin/courses" element={<AdminProtectedRoute><ManageCourses /></AdminProtectedRoute>} />
        <Route path="/admin/zscore" element={<AdminProtectedRoute><ManageZScore /></AdminProtectedRoute>} />
        <Route path="/admin/quizzes" element={<AdminProtectedRoute><ManageQuizzes /></AdminProtectedRoute>} />
        <Route path="/admin/jobs" element={<AdminProtectedRoute><ManageJobs /></AdminProtectedRoute>} />
        <Route path="/admin/universities" element={<AdminProtectedRoute><ManageUniversities /></AdminProtectedRoute>} />
        <Route path="/admin/users" element={<AdminProtectedRoute><ManageUsers /></AdminProtectedRoute>} />
        <Route path="*" element={<Navigate to="/admin/login" replace />} />
      </Routes>
    );
  }

  return (
    <Layout>
      <AnimatedRoutes />
    </Layout>
  );
}
