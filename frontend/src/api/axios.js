import axios from "axios";

const rawBaseUrl = import.meta.env.VITE_API_URL || "https://tech-electronics-backend.onrender.com/api";
const baseURL = rawBaseUrl.replace(/\/+$/, "");

const API = axios.create({
  baseURL,
  timeout: 30000,
});


// Attach JWT token automatically — no console logging of secrets
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token && token !== "undefined" && token !== "null") {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Global response error handler — auto-logout on 401
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.dispatchEvent(new Event("loginStatusChanged"));
    }
    return Promise.reject(error);
  }
);

export default API;