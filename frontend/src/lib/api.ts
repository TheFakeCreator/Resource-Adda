import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to automatically attach the auth token
api.interceptors.request.use(
  (config) => {
    // Only access localStorage if we are running in the browser
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token && config.headers) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor for global error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized (token expired or invalid)
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        // Optionally redirect to login, but avoid loops
        if (!window.location.pathname.includes("/login")) {
          window.location.href = `/login?redirect=${window.location.pathname}`;
        }
      }
    }
    return Promise.reject(error);
  },
);

export default api;
