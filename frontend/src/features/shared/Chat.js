
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

import { useTheme } from "../../theme/ThemeContext";
import { mensajeService } from "../../service/mensajeService";
import { mensajeDeError } from "../../service/api";

export default function Chat({ compraId, usuario, onBack }) {
  const { C } = useTheme();

  const [mensajes, setMensajes] = useState([]);
  const [texto, setTexto] = useState("");
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  const scrollRef = useRef(null);

  const cargarMensajes = useCallback(async (silencioso = false) => {
    try {
      if (!silencioso) {
        setCargando(true);
        setError("");
      }

      const respuesta = await mensajeService.obtenerPorCompra(compraId);

      setMensajes(Array.isArray(respuesta) ? respuesta : []);
    } catch (e) {
      if (!silencioso) {
        setError(mensajeDeError(e));
      }
    } finally {
      if (!silencioso) {
        setCargando(false);
      }
    }
  }, [compraId]);

  useEffect(() => {
    if (!compraId) return;

    cargarMensajes();

    const intervalo = setInterval(() => {
      cargarMensajes(true);
    }, 5000);

    return () => clearInterval(intervalo);
  }, [compraId, cargarMensajes]);

  useEffect(() => {
    if (mensajes.length > 0) {
      setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [mensajes]);

  const enviarMensaje = async () => {
    const mensajeTexto = texto.trim();

    if (!mensajeTexto || enviando) return;

    try {
      setEnviando(true);
      setError("");

      const nuevoMensaje = await mensajeService.enviar(
        compraId,
        mensajeTexto
      );

      setMensajes((prev) => {
        if (prev.some((m) => m.id === nuevoMensaje.id)) {
          return prev;
        }

        return [...prev, nuevoMensaje].sort(
          (a, b) => new Date(a.enviado) - new Date(b.enviado)
        );
      });

      setTexto("");
    } catch (e) {
      setError(mensajeDeError(e));
    } finally {
      setEnviando(false);
    }
  };

  const esMio = (mensaje) =>
    Number(mensaje.emisorId) === Number(usuario?.id);

  const formatearHora = (fecha) => {
    if (!fecha) return "";

    const date = new Date(fecha);

    if (isNaN(date.getTime())) return "";

    return date.toLocaleString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const nombreUsuario = (mensaje) => {
    if (esMio(mensaje)) return "Vos";

    return mensaje.nombreEmisor
      || mensaje.nombre
      || "Usuario";
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: C.bg }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Encabezado */}
      <View style={[styles.header, { borderBottomColor: C.border }]}>
        {onBack && (
          <Pressable onPress={onBack} style={styles.backButton}>
            <Text style={{ color: C.primary, fontSize: 22 }}>
              ‹
            </Text>
          </Pressable>
        )}

        <View style={styles.headerInfo}>
          <Text style={[styles.title, { color: C.text }]}>
            Mensajes
          </Text>

          <Text style={[styles.subtitle, { color: C.muted }]}>
            Compra #{compraId}
          </Text>
        </View>
      </View>

      {/* Conversación */}
      {cargando ? (
        <View style={styles.center}>
          <ActivityIndicator color={C.primary} size="large" />
          <Text style={{ color: C.muted, marginTop: 10 }}>
            Cargando conversación...
          </Text>
        </View>
      ) : (
        <ScrollView
          ref={scrollRef}
          style={styles.conversation}
          contentContainerStyle={styles.messagesContainer}
          keyboardShouldPersistTaps="handled"
        >
          {mensajes.length === 0 ? (
            <View style={styles.empty}>
              <Text style={{ color: C.muted, textAlign: "center" }}>
                Todavía no hay mensajes.

                {"\n\n"}

                ¡Podés iniciar la conversación!
              </Text>
            </View>
          ) : (
            mensajes.map((mensaje) => {
              const propio = esMio(mensaje);

              return (
                <View
                  key={mensaje.id}
                  style={[
                    styles.messageRow,
                    propio
                      ? styles.myRow
                      : styles.otherRow,
                  ]}
                >
                  <View
                    style={[
                      styles.bubble,
                      {
                        backgroundColor: propio
                          ? C.primary
                          : C.card,
                        borderColor: propio
                          ? C.primary
                          : C.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.author,
                        {
                          color: propio
                            ? "#FFFFFF"
                            : C.primary,
                        },
                      ]}
                    >
                      {nombreUsuario(mensaje)}
                    </Text>

                    <Text
                      style={[
                        styles.messageText,
                        {
                          color: propio
                            ? "#FFFFFF"
                            : C.text,
                        },
                      ]}
                    >
                      {mensaje.mensaje}
                    </Text>

                    <Text
                      style={[
                        styles.time,
                        {
                          color: propio
                            ? "#E5E5E5"
                            : C.muted,
                        },
                      ]}
                    >
                      {formatearHora(mensaje.enviado)}
                    </Text>
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      )}

      {/* Errores */}
      {!!error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>

          <Pressable onPress={() => cargarMensajes()}>
            <Text style={{ color: C.primary, fontWeight: "700" }}>
              Reintentar
            </Text>
          </Pressable>
        </View>
      )}

      {/* Caja de envío */}
      <View
        style={[
          styles.inputContainer,
          {
            borderTopColor: C.border,
            backgroundColor: C.bg,
          },
        ]}
      >
        <TextInput
          value={texto}
          onChangeText={setTexto}
          placeholder="Escribí un mensaje..."
          placeholderTextColor={C.muted}
          multiline
          maxLength={2000}
          editable={!enviando}
          style={[
            styles.input,
            {
              color: C.text,
              backgroundColor: C.card,
              borderColor: C.border,
            },
          ]}
        />

        <Pressable
          onPress={enviarMensaje}
          disabled={!texto.trim() || enviando}
          style={[
            styles.sendButton,
            {
              backgroundColor: C.primary,
              opacity: !texto.trim() || enviando ? 0.5 : 1,
            },
          ]}
        >
          {enviando ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.sendText}>Enviar</Text>
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    marginRight: 12,
    paddingHorizontal: 5,
  },
  headerInfo: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
  },
  subtitle: {
    fontSize: 12,
    marginTop: 4,
  },
  conversation: {
    flex: 1,
  },
  messagesContainer: {
    padding: 16,
    paddingBottom: 24,
    flexGrow: 1,
  },
  messageRow: {
    width: "100%",
    marginBottom: 12,
    flexDirection: "row",
  },
  myRow: {
    justifyContent: "flex-end",
  },
  otherRow: {
    justifyContent: "flex-start",
  },
  bubble: {
    maxWidth: "85%",
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  author: {
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 6,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 21,
  },
  time: {
    fontSize: 10,
    marginTop: 6,
    textAlign: "right",
  },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    padding: 10,
    alignItems: "center",
    gap: 8,
  },
  errorText: {
    color: "#D9534F",
    textAlign: "center",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 12,
    borderTopWidth: 1,
    gap: 10,
  },
  input: {
    flex: 1,
    minHeight: 45,
    maxHeight: 120,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
  },
  sendButton: {
    paddingHorizontal: 18,
    minHeight: 45,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 14,
  },
  sendText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
});
