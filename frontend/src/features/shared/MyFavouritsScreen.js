
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";

import { useTheme } from "../../theme/ThemeContext";
import { favoritoService } from "../../service/favoritosService";

export default function MisFavoritosScreen({
  onBack,
  onVerEvento,
}) {
  const { C } = useTheme();

  const [favoritos, setFavoritos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [eliminandoId, setEliminandoId] = useState(null);

  const cargarFavoritos = async () => {
    try {
      setCargando(true);
      setError("");

      const respuesta = await favoritoService.obtenerMisFavoritos();

      setFavoritos(Array.isArray(respuesta) ? respuesta : []);
    } catch (err) {
      console.error("Error al cargar favoritos:", err);
      setError("No se pudieron cargar tus favoritos.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarFavoritos();
  }, []);

  const eliminarFavorito = async (eventoId) => {
    try {
      setEliminandoId(eventoId);

      await favoritoService.eliminar(eventoId);

      setFavoritos((previos) =>
        previos.filter((favorito) => {
          const evento = favorito.evento || favorito;
          return Number(evento.id) !== Number(eventoId);
        })
      );
    } catch (err) {
      console.error("Error al eliminar favorito:", err);
      setError("No se pudo eliminar el favorito.");
    } finally {
      setEliminandoId(null);
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return "Fecha no disponible";

    const fechaObj = new Date(fecha);

    if (isNaN(fechaObj.getTime())) return fecha;

    return fechaObj.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const obtenerPrecio = (evento) => {
    const tipos = evento?.tiposEntrada || [];

    if (tipos.length === 0) return null;

    const precios = tipos
      .map((tipo) => Number(tipo.precio))
      .filter((precio) => !isNaN(precio));

    if (precios.length === 0) return null;

    const minimo = Math.min(...precios);

    return minimo === 0
      ? "Gratis"
      : `Desde $${minimo.toLocaleString("es-AR")}`;
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: C.bg }]}
      contentContainerStyle={styles.contenido}
    >
      <Pressable onPress={onBack} style={styles.volver}>
        <Text style={[styles.volverTexto, { color: C.primary }]}>
          ‹ Volver
        </Text>
      </Pressable>

      <Text style={[styles.titulo, { color: C.text }]}>
        Mis favoritos
      </Text>

      <Text style={[styles.subtitulo, { color: C.muted }]}>
        Los eventos que guardaste para no perderte ninguno.
      </Text>

      {cargando ? (
        <View style={styles.estado}>
          <ActivityIndicator size="large" color={C.primary} />
          <Text style={[styles.estadoTexto, { color: C.muted }]}>
            Cargando favoritos...
          </Text>
        </View>
      ) : error ? (
        <View style={styles.estado}>
          <Text style={[styles.error, { color: C.text }]}>
            {error}
          </Text>

          <Pressable
            onPress={cargarFavoritos}
            style={[styles.botonReintentar, { backgroundColor: C.primary }]}
          >
            <Text style={[styles.botonReintentarTexto, { color: C.primaryText }]}>
              Reintentar
            </Text>
          </Pressable>
        </View>
      ) : favoritos.length === 0 ? (
        <View style={[styles.vacio, { backgroundColor: C.card, borderColor: C.border }]}>
          <Text style={styles.corazonVacio}>♡</Text>

          <Text style={[styles.vacioTitulo, { color: C.text }]}>
            Todavía no guardaste eventos
          </Text>

          <Text style={[styles.vacioTexto, { color: C.muted }]}>
            Cuando encuentres un evento que te interese, guardalo con el
            corazón para tenerlo acá.
          </Text>
        </View>
      ) : (
        favoritos.map((favorito) => {
          const evento = favorito.evento || favorito;
          const eventoId = evento.id;

          return (
            <View
              key={favorito.id || eventoId}
              style={[
                styles.tarjeta,
                { backgroundColor: C.card, borderColor: C.border },
              ]}
            >
              <Pressable
                onPress={() => onVerEvento?.(evento)}
                style={styles.tarjetaContenido}
              >
                <View style={styles.encabezadoTarjeta}>
                  <Text style={styles.corazon}>♥</Text>

                  <Text
                    style={[styles.eventoTitulo, { color: C.text }]}
                    numberOfLines={2}
                  >
                    {evento.titulo || evento.nombre || "Evento"}
                  </Text>
                </View>

                <Text style={[styles.detalle, { color: C.muted }]}>
                  📅 {formatearFecha(evento.fecha)}
                </Text>

                {(evento.lugar || evento.ubicacion) && (
                  <Text style={[styles.detalle, { color: C.muted }]}>
                    📍 {evento.lugar || evento.ubicacion}
                  </Text>
                )}

                {obtenerPrecio(evento) && (
                  <Text style={[styles.precio, { color: C.primary }]}>
                    {obtenerPrecio(evento)}
                  </Text>
                )}
              </Pressable>

              <Pressable
                onPress={() => eliminarFavorito(eventoId)}
                disabled={eliminandoId === eventoId}
                style={[styles.eliminar, { borderColor: C.border }]}
              >
                <Text style={[styles.eliminarTexto, { color: C.text }]}>
                  {eliminandoId === eventoId
                    ? "Eliminando..."
                    : "♥  Quitar de favoritos"}
                </Text>
              </Pressable>
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contenido: {
    padding: 20,
    paddingBottom: 40,
  },
  volver: {
    marginBottom: 20,
    alignSelf: "flex-start",
  },
  volverTexto: {
    fontSize: 16,
    fontWeight: "600",
  },
  titulo: {
    fontSize: 26,
    fontWeight: "800",
  },
  subtitulo: {
    fontSize: 14,
    marginTop: 8,
    marginBottom: 24,
    lineHeight: 21,
  },
  estado: {
    paddingVertical: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  estadoTexto: {
    marginTop: 12,
    fontSize: 14,
  },
  error: {
    textAlign: "center",
    fontSize: 15,
    marginBottom: 16,
  },
  botonReintentar: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  botonReintentarTexto: {
    fontWeight: "700",
  },
  vacio: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 24,
    alignItems: "center",
    marginTop: 8,
  },
  corazonVacio: {
    fontSize: 52,
    color: "#E5484D",
    marginBottom: 12,
  },
  vacioTitulo: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  vacioTexto: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
    marginTop: 10,
  },
  tarjeta: {
    borderWidth: 1,
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
  },
  tarjetaContenido: {
    padding: 16,
  },
  encabezadoTarjeta: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    gap: 10,
  },
  corazon: {
    color: "#E5484D",
    fontSize: 23,
  },
  eventoTitulo: {
    fontSize: 17,
    fontWeight: "700",
    flex: 1,
  },
  detalle: {
    fontSize: 14,
    marginTop: 8,
  },
  precio: {
    fontWeight: "700",
    fontSize: 15,
    marginTop: 12,
  },
  eliminar: {
    borderTopWidth: 1,
    padding: 14,
    alignItems: "center",
  },
  eliminarTexto: {
    fontSize: 14,
    fontWeight: "600",
  },
});
