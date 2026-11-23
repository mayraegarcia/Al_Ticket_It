import api from "./api";

export const authService = {
  registrar: async (datos) => {
    return await api.post("/auth/registro", datos);
  },

  login: async (credenciales) => {
    return await api.post("/auth/login", credenciales);
  },

  obtenerUsuarioActual: async () => {
    return await api.get("/auth/me");
  },
};