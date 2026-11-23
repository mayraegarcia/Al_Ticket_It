
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from "react-native";

import { useTheme } from "../../theme/ThemeContext";
import { eventoService } from "../../service/eventoService";
import { mensajeDeError } from "../../service/api";

export default function MyEventsScreen() {
  const { C } = useTheme();

  const [eventos, setEventos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const cargarEventos = async () => {
    try {
      setCargando(true);
      setError("");

      const respuesta = await eventoService.obtenerMisEventos();

      // El controlador devuelve directamente un array.
      setEventos(Array.isArray(respuesta) ? respuesta : []);
    } catch (err) {
      setError(mensajeDeError(err));
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarEventos();
  }, []);

  const formatearFecha = (fecha) => {
    if (!fecha) return "Fecha no disponible";

    const fechaObjeto = new Date(fecha);

    if (Number.isNaN(fechaObjeto.getTime())) {
      return "Fecha no disponible";
    }

    return fechaObjeto.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const obtenerColorEstado = (estado) => {
    switch (estado) {
      case "PUBLICADO":
        return "#16A34A";
      case "BORRADOR":
        return "#D97706";
      case "CANCELADO":
        return "#DC2626";
      case "FINALIZADO":
        return C.muted;
      default:
        return C.muted;
    }
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: C.bg }}
      contentContainerStyle={styles.container}
    >
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: C.text }]}>
            Mis eventos
          </Text>

          <Text style={[styles.subtitle, { color: C.muted }]}>
            Administrá los eventos que organizaste.
          </Text>
        </View>

        <Pressable
          onPress={cargarEventos}
          style={[styles.refreshButton, { borderColor: C.primary }]}
        >
          <Text style={{ color: C.primary, fontWeight: "700" }}>
            Actualizar
          </Text>
        </Pressable>
      </View>

      {cargando ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={C.primary} />
          <Text style={[styles.message, { color: C.muted }]}>
            Cargando tus eventos...
          </Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={[styles.message, { color: C.text }]}>
            {error}
          </Text>

          <Pressable
            onPress={cargarEventos}
            style={[styles.retryButton, { backgroundColor: C.primary }]}
          >
            <Text style={styles.retryText}>Reintentar</Text>
          </Pressable>
        </View>
      ) : eventos.length === 0 ? (
        <View style={styles.center}>
          <Text style={[styles.emptyTitle, { color: C.text }]}>
            Todavía no creaste eventos
          </Text>

          <Text style={[styles.message, { color: C.muted }]}>
            Cuando crees un evento, aparecerá en esta sección.
          </Text>
        </View>
      ) : (
        <>
          <Text style={[styles.counter, { color: C.muted }]}>
            {eventos.length} {eventos.length === 1 ? "evento creado" : "eventos creados"}
          </Text>

          {eventos.map((evento) => (
            <View
              key={evento.id}
              style={[styles.card, { backgroundColor: C.card }]}
            >
              <View style={styles.cardHeader}>
                <Text style={[styles.eventTitle, { color: C.text }]}>
                  {evento.nombre}
                </Text>

                <Text
                  style={[
                    styles.status,
                    { color: obtenerColorEstado(evento.estado) },
                  ]}
                >
                  {evento.estado}
                </Text>
              </View>

              <Text style={[styles.info, { color: C.muted }]}>
                Fecha: {formatearFecha(evento.fecha)}
              </Text>

              <Text style={[styles.description, { color: C.muted }]}>
                {evento.descripcion}
              </Text>

              <Text style={[styles.info, { color: C.muted }]}>
                Tipos de entrada: {evento.tiposEntrada?.length ?? 0}
              </Text>
            </View>
          ))}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 35,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 22,
  },
  title: {
    fontSize: 25,
    fontWeight: "800",
  },
  subtitle: {
    fontSize: 14,
    marginTop: 6,
  },
  refreshButton: {
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 9,
  },
  counter: {
    fontSize: 13,
    marginBottom: 12,
  },
  card: {
    padding: 16,
    borderRadius: 14,
    marginBottom: 14,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 12,
  },
  eventTitle: {
    fontSize: 17,
    fontWeight: "700",
    flex: 1,
  },
  status: {
    fontSize: 10,
    fontWeight: "800",
  },
  info: {
    fontSize: 13,
    marginBottom: 8,
  },
  description: {
    fontSize: 13,
    marginBottom: 10,
    lineHeight: 19,
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 55,
  },
  message: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 12,
    lineHeight: 21,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "700",
    textAlign: "center",
  },
  retryButton: {
    padding: 12,
    borderRadius: 9,
    marginTop: 16,
  },
  retryText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
});
