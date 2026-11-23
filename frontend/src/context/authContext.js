import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  TOKEN_KEY,
  USER_KEY,
  configurarSesionExpirada,
} from "../service/api";

import { authService } from "../service/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(null);
  const [cargando, setCargando] = useState(true);

  // ==============================
  // RESTAURAR SESIÓN
  // ==============================

  useEffect(() => {
    restaurarSesion();
  }, []);

  async function restaurarSesion() {
    try {
      const datosGuardados = await AsyncStorage.multiGet([
        TOKEN_KEY,
        USER_KEY,
      ]);

      const tokenActual = datosGuardados[0]?.[1];
      const usuarioJson = datosGuardados[1]?.[1];

      if (!tokenActual || !usuarioJson) {
        setUsuario(null);
        setToken(null);
        return;
      }

      // Si hay un token, verificamos la sesión con el backend.
      const respuesta = await authService.obtenerUsuarioActual();

      const usuarioActual =
        respuesta?.usuario || respuesta?.user || respuesta;

      setToken(tokenActual);
      setUsuario(usuarioActual);

      await AsyncStorage.setItem(
        USER_KEY,
        JSON.stringify(usuarioActual)
      );
    } catch (error) {
      console.log("No se pudo restaurar la sesión:", error.message);

      await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);

      setUsuario(null);
      setToken(null);
    } finally {
      setCargando(false);
    }
  }

  // ==============================
  // ESTABLECER SESIÓN
  // ==============================

  async function establecerSesion(datos) {
    const nuevoToken = datos?.token;
    const nuevoUsuario = datos?.usuario;

    if (!nuevoToken || !nuevoUsuario) {
      throw new Error("Datos de sesión incompletos.");
    }

    // Guardar la sesión en el dispositivo
    await AsyncStorage.multiSet([
      [TOKEN_KEY, nuevoToken],
      [USER_KEY, JSON.stringify(nuevoUsuario)],
    ]);

    // Actualizar el estado
    setToken(nuevoToken);
    setUsuario(nuevoUsuario);
  }

  // ==============================
  // CERRAR SESIÓN
  // ==============================

  async function cerrarSesion() {
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);

    setToken(null);
    setUsuario(null);
  }

  // ==============================
  // SESIÓN EXPIRADA
  // ==============================

  useEffect(() => {
    configurarSesionExpirada(() => {
      setToken(null);
      setUsuario(null);
    });

    return () => {
      configurarSesionExpirada(null);
    };
  }, []);

  const autenticado = Boolean(token && usuario);

  return (
    <AuthContext.Provider
      value={{
        usuario,
        token,
        autenticado,
        cargando,
        establecerSesion,
        cerrarSesion,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ==============================
// HOOK
// ==============================

export function useAuth() {
  const contexto = useContext(AuthContext);

  if (!contexto) {
    throw new Error(
      "useAuth debe utilizarse dentro de AuthProvider."
    );
  }

  return contexto;
}