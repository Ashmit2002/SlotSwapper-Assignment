import axios from "axios";

export const api = axios.create({
  baseURL: "https://slotswapper-assignment.onrender.com/api",
});

// Attach token from localStorage if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
