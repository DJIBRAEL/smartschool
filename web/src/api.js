import axios from "axios";

export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || "http://localhost:3001/api/v1" });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("smartschool_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (e) => {
    if (e.response?.status === 401) {
      localStorage.removeItem("smartschool_token");
      window.location = "/login";
    }
    return Promise.reject(e);
  }
);

export async function login(email, password) {
  const { data } = await api.post("/auth/login", { email, password });
  localStorage.setItem("smartschool_token", data.token);
  localStorage.setItem("smartschool_user", JSON.stringify({ ...data.user, role: data.role }));
  return data;
}

export async function me() {
  return (await api.get("/auth/me")).data;
}

export async function stats() {
  return (await api.get("/stats")).data;
}

export async function list(resource) {
  return (await api.get(`/${resource}`)).data;
}

export async function listUsers() {
  return (await api.get("/users")).data;
}

export async function create(resource, payload) {
  return (await api.post(`/${resource}`, payload)).data;
}

export async function update(resource, id, payload) {
  return (await api.patch(`/${resource}/${id}`, payload)).data;
}

export async function remove(resource, id) {
  await api.delete(`/${resource}/${id}`);
}

// ─── Données personnelles (STUDENT) ─────────────────────────────────────────
export async function myGrades() {
  return (await api.get("/me/grades")).data;
}

export async function myAttendances() {
  return (await api.get("/me/attendances")).data;
}

export async function myHomeworks() {
  return (await api.get("/me/homeworks")).data;
}

export async function myTimetable() {
  return (await api.get("/me/timetable")).data;
}

// ─── Données personnelles (TEACHER) ─────────────────────────────────────────
export async function myTimetableTeacher() {
  return (await api.get("/me/timetable-teacher")).data;
}
