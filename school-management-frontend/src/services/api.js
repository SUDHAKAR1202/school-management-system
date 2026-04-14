import axios from "axios";

const api = axios.create({ 
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api"
});

// Backend middleware reads req.header("Authorization") — raw token, no Bearer prefix
api.interceptors.request.use((cfg) => {
  const t = localStorage.getItem("token");
  if (t) cfg.headers["Authorization"] = t;
  return cfg;
});

export const authAPI     = { login: (d) => api.post("/auth/login", d) };
export const studentsAPI = {
  getAll:  ()      => api.get("/students"),
  create:  (d)     => api.post("/students", d),
  update:  (id, d) => api.put(`/students/${id}`, d),
  remove:  (id)    => api.delete(`/students/${id}`),
};
export const tasksAPI = {
  getAll:  ()      => api.get("/tasks"),
  create:  (d)     => api.post("/tasks", d),
  update:  (id, d) => api.put(`/tasks/${id}`, d),
};