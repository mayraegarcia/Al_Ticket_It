
import React, { useState } from "react";
import {
  ScrollView,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from "react-native";

import { useTheme } from "../../theme/ThemeContext";
import Ticketito from "../../components/mascot/Ticketito";
import { authService } from "../../service/authService";
import { mensajeDeError, TOKEN_KEY, USER_KEY } from "../../service/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ROLES = {
  COMPRADOR: "COMPRADOR",
  ORGANIZADOR: "ORGANIZADOR",
};

export default function AuthScreen({ onAuthenticated }) {
    const { C } = useTheme();

    const [modo, setModo] = useState("login");
    const [rol, setRol] = useState(ROLES.COMPRADOR);

    const [nombre, setNombre] = useState("");
    const [apellido, setApellido] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [mostrarPassword, setMostrarPassword] = useState(false);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState("");

    const esRegistro = modo === "registro";

    function cambiarModo(nuevoModo) {
        setModo(nuevoModo);
        setError("");
        setPassword("");
    }

    async function guardarSesion(resultado) {
        const token = resultado?.token;
        const usuario =
        resultado?.usuario ||
        resultado?.user ||
        resultado?.usuarioAutenticado;

        if (!token || !usuario) {
        throw new Error(
            "El servidor no devolvió los datos necesarios para iniciar sesión."
        );
        }

        await AsyncStorage.multiSet([
        [TOKEN_KEY, token],
        [USER_KEY, JSON.stringify(usuario)],
        ]);

        onAuthenticated?.({ token, usuario });
    }

    async function enviarFormulario() {
        try {
        setError("");

        if (!email.trim() || !password.trim()) {
            setError("Completá el email y la contraseña.");
            return;
        }

        if (esRegistro && (!nombre.trim() || !apellido.trim())) {
            setError("Ingresá tu nombre y apellido.");
            return;
        }

        if (esRegistro && password.length < 6) {
            setError("La contraseña debe tener al menos 6 caracteres.");
            return;
        }

        setCargando(true);

        let resultado;

        if (esRegistro) {
        resultado = await authService.registrar({
            nombre: nombre.trim(),
            apellido: apellido.trim(),
            email: email.trim().toLowerCase(),
            password,
            rol,
        });
        } else {
            resultado = await authService.login({
            email: email.trim().toLowerCase(),
            password,
            rol,
            });
        }

        await guardarSesion(resultado);
        } catch (err) {
        setError(
            mensajeDeError(err) ||
            err.message ||
            "No se pudo completar la operación."
        );
        } finally {
        setCargando(false);
        }
    }

    const estilosInput = [
        s.input,
        {
        backgroundColor: C.surface2,
        borderColor: C.border,
        color: C.text,
        },
    ];

    return (
        <ScrollView
        contentContainerStyle={[
            s.container,
            { backgroundColor: C.bg },
        ]}
        keyboardShouldPersistTaps="handled"
        >
        {/* Marca */}
        <View style={s.marca}>
            <Ticketito size={100} />

            <Text style={[s.logo, { color: C.text }]}>
            Al Ticket It
            </Text>

            <Text style={[s.descripcion, { color: C.muted }]}>
            Encontrá tu próxima experiencia.
            </Text>
        </View>

        {/* Tarjeta */}
        <View
            style={[
            s.card,
            {
                backgroundColor: C.surface,
                borderColor: C.border,
            },
            ]}
        >
            {/* Tabs */}
            <View
            style={[
                s.tabs,
                { backgroundColor: C.surface2 },
            ]}
            >
            <Pressable
                onPress={() => cambiarModo("login")}
                style={[
                s.tab,
                modo === "login" && {
                    backgroundColor: C.primary,
                },
                ]}
            >
                <Text
                style={{
                    color: modo === "login" ? C.primaryText : C.text,
                    fontWeight: "800",
                }}
                >
                Ingresar
                </Text>
            </Pressable>

            <Pressable
                onPress={() => cambiarModo("registro")}
                style={[
                s.tab,
                modo === "registro" && {
                    backgroundColor: C.primary,
                },
                ]}
            >
                <Text
                style={{
                    color: modo === "registro" ? C.primaryText : C.text,
                    fontWeight: "800",
                }}
                >
                Crear cuenta
                </Text>
            </Pressable>
            </View>

            <Text style={[s.titulo, { color: C.text }]}>
            {esRegistro
                ? "Sumate a Ticketito"
                : "¡Qué bueno verte!"}
            </Text>

            <Text style={[s.subtitulo, { color: C.muted }]}>
            {esRegistro
                ? "Creá tu cuenta y empezá a vivir experiencias."
                : "Ingresá a tu cuenta para continuar."}
            </Text>

            {/* Tipo de usuario */}
            <Text style={[s.label, { color: C.text }]}>
            {esRegistro
                ? "¿Cómo querés usar Ticketito?"
                : "Ingresar como"}
            </Text>

            <View style={s.roles}>
            <Pressable
                onPress={() => setRol(ROLES.COMPRADOR)}
                style={[
                s.rolCard,
                {
                    backgroundColor:
                    rol === ROLES.COMPRADOR
                        ? C.surface2
                        : C.surface,
                    borderColor:
                    rol === ROLES.COMPRADOR
                        ? C.primary
                        : C.border,
                },
                ]}
            >
                <Text style={s.rolIcon}>◉</Text>

                <Text style={[s.rolTitulo, { color: C.text }]}>
                Comprador
                </Text>

                <Text style={[s.rolDescripcion, { color: C.muted }]}>
                Descubrí y disfrutá eventos
                </Text>
            </Pressable>

            <Pressable
                onPress={() => setRol(ROLES.ORGANIZADOR)}
                style={[
                s.rolCard,
                {
                    backgroundColor:
                    rol === ROLES.ORGANIZADOR
                        ? C.surface2
                        : C.surface,
                    borderColor:
                    rol === ROLES.ORGANIZADOR
                        ? C.primary
                        : C.border,
                },
                ]}
            >
                <Text style={s.rolIcon}>✦</Text>

                <Text style={[s.rolTitulo, { color: C.text }]}>
                Organizador
                </Text>

                <Text style={[s.rolDescripcion, { color: C.muted }]}>
                Creá y gestioná eventos
                </Text>
            </Pressable>
            </View>

            {/* Nombre */}
            {esRegistro && (
            <>
                <Text style={[s.label, { color: C.text }]}>
                Nombre
                </Text>

                <TextInput
                value={nombre}
                onChangeText={setNombre}
                placeholder="Tu nombre"
                placeholderTextColor={C.muted}
                style={estilosInput}
                autoCapitalize="words"
                />
            </>
            )}

            {/* Apellido */}
            {esRegistro && (
            <>
                <Text style={[s.label, { color: C.text }]}>
                Apellido
                </Text>

                <TextInput
                value={apellido}
                onChangeText={setApellido}
                placeholder="Tu apellido"
                placeholderTextColor={C.muted}
                style={estilosInput}
                autoCapitalize="words"
                />
            </>
            )}

            {/* Email */}
            <Text style={[s.label, { color: C.text }]}>
            Email
            </Text>

            <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="tu@email.com"
            placeholderTextColor={C.muted}
            style={estilosInput}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            />

            {/* Contraseña */}
            <Text style={[s.label, { color: C.text }]}>
            Contraseña
            </Text>

            <View style={s.passwordContainer}>
            <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Tu contraseña"
                placeholderTextColor={C.muted}
                style={[
                estilosInput,
                { flex: 1 },
                ]}
                secureTextEntry={!mostrarPassword}
                autoCapitalize="none"
            />

            <Pressable
                onPress={() => setMostrarPassword(!mostrarPassword)}
                style={s.verPassword}
            >
                <Text style={{ color: C.primary, fontWeight: "700" }}>
                {mostrarPassword ? "Ocultar" : "Ver"}
                </Text>
            </Pressable>
            </View>

            {/* Error */}
            {error ? (
            <Text style={s.error}>
                {error}
            </Text>
            ) : null}

            {/* Botón */}
            <Pressable
            onPress={enviarFormulario}
            disabled={cargando}
            style={[
                s.boton,
                { backgroundColor: C.primary },
            ]}
            >
            {cargando ? (
                <ActivityIndicator color={C.primaryText} />
            ) : (
                <Text
                style={[
                    s.botonTexto,
                    { color: C.primaryText },
                ]}
                >
                {esRegistro
                    ? "Crear mi cuenta"
                    : "Ingresar"}
                </Text>
            )}
            </Pressable>

            {/* Cambio de modo */}
            <Pressable
            onPress={() =>
                cambiarModo(esRegistro ? "login" : "registro")
            }
            style={s.cambiarModo}
            >
            <Text style={{ color: C.muted, textAlign: "center" }}>
                {esRegistro
                ? "¿Ya tenés cuenta? "
                : "¿Todavía no tenés cuenta? "}
            </Text>

            <Text
                style={{
                color: C.primary,
                fontWeight: "800",
                textAlign: "center",
                }}
            >
                {esRegistro
                ? "Ingresá"
                : "Registrate"}
            </Text>
            </Pressable>
        </View>

        <Text style={[s.pie, { color: C.muted }]}>
            Ticketito · Encontrá, comprá y compartí
        </Text>
        </ScrollView>
    );
}

const s = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 22,
    paddingBottom: 35,
    justifyContent: "center",
  },

  marca: {
    alignItems: "center",
    marginBottom: 25,
  },

  logo: {
    fontSize: 35,
    fontWeight: "900",
    letterSpacing: -1.5,
  },

  descripcion: {
    marginTop: 6,
    fontSize: 15,
  },

  card: {
    borderWidth: 1,
    borderRadius: 28,
    padding: 22,
  },

  tabs: {
    flexDirection: "row",
    borderRadius: 16,
    padding: 4,
    marginBottom: 25,
  },

  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    paddingVertical: 12,
  },

  titulo: {
    fontSize: 25,
    fontWeight: "900",
  },

  subtitulo: {
    marginTop: 8,
    marginBottom: 24,
    lineHeight: 21,
  },

  label: {
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 9,
    marginTop: 16,
  },

  roles: {
    flexDirection: "row",
    gap: 12,
  },

  rolCard: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: 18,
    padding: 14,
  },

  rolIcon: {
    fontSize: 23,
    marginBottom: 9,
  },

  rolTitulo: {
    fontWeight: "800",
    fontSize: 14,
  },

  rolDescripcion: {
    fontSize: 11,
    marginTop: 6,
    lineHeight: 16,
  },

  input: {
    borderWidth: 1,
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 14,
    fontSize: 15,
  },

  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  verPassword: {
    position: "absolute",
    right: 15,
  },

  error: {
    color: "#D93025",
    marginTop: 15,
    lineHeight: 20,
  },

  boton: {
    marginTop: 25,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 54,
  },

  botonTexto: {
    fontSize: 16,
    fontWeight: "900",
  },

  cambiarModo: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    marginTop: 22,
  },

  pie: {
    textAlign: "center",
    fontSize: 12,
    marginTop: 25,
  },
});
