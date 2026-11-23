
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_KEY = "ticketito_auth_token";
const USER_KEY = "ticketito_current_user";

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Permite que el contexto de autenticación gestione
// la sesión cuando el servidor devuelve un 401.
let manejadorSesionExpirada = null;

export const configurarSesionExpirada = (callback) => {
  manejadorSesionExpirada = callback;
};

// Interceptor de solicitudes
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem(TOKEN_KEY);

    console.log("========== SOLICITUD API ==========");
    console.log("URL BASE:", api.defaults.baseURL);
    console.log("URL:", config.url);
    console.log("MÉTODO:", config.method);
    console.log("==================================");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    console.log("ERROR AL PREPARAR SOLICITUD:", error);
    return Promise.reject(error);
  }
);

// Interceptor de respuestas
api.interceptors.response.use(
  (response) => {
    console.log("========== RESPUESTA API ==========");
    console.log("STATUS:", response.status);
    console.log("URL:", response.config.url);
    console.log("==================================");

    return response.data;
  },
  async (error) => {
    console.log("========== ERROR API ==============");
    console.log("MENSAJE:", error.message);
    console.log("CÓDIGO:", error.code);
    console.log("URL BASE:", error.config?.baseURL);
    console.log("URL:", error.config?.url);
    console.log("STATUS:", error.response?.status);
    console.log("RESPUESTA:", error.response?.data);
    console.log("==================================");

    const status = error.response?.status;
    const url = error.config?.url || "";

    if (
      status === 401 &&
      !url.includes("/auth/login") &&
      !url.includes("/auth/registro")
    ) {
      await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
      manejadorSesionExpirada?.();
    }

    return Promise.reject(error);
  }
);

// Mensajes de error centralizados
export const mensajeDeError = (error) => {
  const data = error?.response?.data;

  if (typeof data?.message === "string" && data.message.trim()) {
    return data.message;
  }

  if (Array.isArray(data?.detalles) && data.detalles.length > 0) {
    return data.detalles
      .map((detalle) => detalle.mensaje || detalle.message)
      .filter(Boolean)
      .join(". ");
  }

  if (typeof data?.error === "string" && data.error.trim()) {
    return data.error;
  }

  if (error?.response?.status >= 500) {
    return "Ocurrió un error en el servidor. Intentá nuevamente.";
  }

  if (error.code === "ECONNABORTED") {
    return "La solicitud tardó demasiado. Intentá nuevamente.";
  }

  if (error.response) {
    return "Ocurrió un error al procesar la solicitud.";
  }

  return "No pudimos conectarnos con el servidor.";
};

export { TOKEN_KEY, USER_KEY };

export default api;
