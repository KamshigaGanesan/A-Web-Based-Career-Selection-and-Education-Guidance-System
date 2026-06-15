import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

const adminApi = axios.create({
  baseURL: `${API_URL}/api/admin`,
});

adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("adminToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

adminApi.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      const isLoginReq = err.config?.url?.includes("/login");
      if (!isLoginReq) {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminUser");
        if (!window.location.pathname.includes("/admin/login")) {
          window.location.href = "/admin/login";
        }
      }
    }
    return Promise.reject(err);
  }
);

export default adminApi;
