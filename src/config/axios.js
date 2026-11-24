import axios from "axios";

const clientesAxios = axios.create({
  baseURL: import.meta.env.VITE_URL_LOCAL || "http://localhost:3000/api",
});

const tokenEstaExpirado = (token) => {
  try {
    const partes = token.split(".");
    if (partes.length !== 3) return true;
    const base64 = partes[1].replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(base64));
    return Boolean(payload.exp && payload.exp * 1000 < Date.now());
  } catch {
    return true;
  }
};

clientesAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    if (tokenEstaExpirado(token)) {
      localStorage.removeItem("token");
    } else {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

clientesAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || "";

    if (status === 401 && !url.includes("/auth")) {
      localStorage.removeItem("token");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default clientesAxios;