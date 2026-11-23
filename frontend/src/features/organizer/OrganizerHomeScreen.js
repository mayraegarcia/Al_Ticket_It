
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

export default function OrganizerHomeScreen({ onNavigate }) {
  const { C } = useTheme();

  const [eventos, setEventos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    cargarEventos();
  }, []);

  async function cargarEventos() {
    try {
      setCargando(true);
      setError("");

      const respuesta = await eventoService.obtenerMisEventos();

      const lista = Array.isArray(respuesta)
        ? respuesta
        : respuesta?.eventos || [];

      setEventos(lista);
    } catch (err) {
      setError(mensajeDeError(err));
    } finally {
      setCargando(false);
    }
  }

  // ==============================
  // ESTADÍSTICAS
  // ==============================

  const ahora = new Date();

  const eventosPublicados = eventos.filter(
    (evento) => evento.estado === "PUBLICADO"
  );

  const proximosEventos = eventosPublicados
    .filter((evento) => new Date(evento.fecha) > ahora)
    .sort(
      (a, b) => new Date(a.fecha) - new Date(b.fecha)
    );

  const entradasVendidas = eventos.reduce((total, evento) => {
    const tipos = evento.tiposEntrada || [];

    const vendidasEvento = tipos.reduce((subtotal, tipo) => {
      const totalTipo = Number(tipo.cupoTotal) || 0;
      const disponible = Number(tipo.cupoDisponible) || 0;

      return subtotal + Math.max(0, totalTipo - disponible);
    }, 0);

    return total + vendidasEvento;
  }, 0);

  const estadisticas = [
    {
      titulo: "Eventos creados",
      valor: eventos.length,
      icono: "▣",
    },
    {
      titulo: "Publicados",
      valor: eventosPublicados.length,
      icono: "✓",
    },
    {
      titulo: "Próximos eventos",
      valor: proximosEventos.length,
      icono: "◷",
    },
    {
      titulo: "Entradas vendidas",
      valor: entradasVendidas,
      icono: "⌑",
    },
  ];

  // ==============================
  // FORMATO DE FECHA
  // ==============================

  function formatearFecha(fecha) {
    if (!fecha) return "Fecha no disponible";

    const fechaEvento = new Date(fecha);

    if (Number.isNaN(fechaEvento.getTime())) {
      return "Fecha no disponible";
    }

    return fechaEvento.toLocaleDateString("es-AR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  function obtenerVentas(evento) {
    return (evento.tiposEntrada || []).reduce((total, tipo) => {
      const vendidas =
        (Number(tipo.cupoTotal) || 0) -
        (Number(tipo.cupoDisponible) || 0);

      return total + Math.max(0, vendidas);
    }, 0);
  }

  function obtenerCapacidad(evento) {
    return (evento.tiposEntrada || []).reduce(
      (total, tipo) => total + (Number(tipo.cupoTotal) || 0),
      0
    );
  }

  // ==============================
  // RENDER
  // ==============================

  if (cargando) {
    return (
      <View style={[styles.center, { backgroundColor: C.bg }]}>
        <ActivityIndicator size="large" color={C.primary} />
        <Text style={{ color: C.muted, marginTop: 12 }}>
          Cargando tu actividad...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.center, { backgroundColor: C.bg }]}>
        <Text style={[styles.errorTitle, { color: C.text }]}>
          No pudimos cargar tu inicio
        </Text>

        <Text style={[styles.subtitle, { color: C.muted }]}>
          {error}
        </Text>

        <Pressable
          style={[styles.primaryButton, { backgroundColor: C.primary }]}
          onPress={cargarEventos}
        >
          <Text style={styles.primaryButtonText}>
            Reintentar
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: C.bg }}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* ENCABEZADO */}

      <View style={styles.heading}>
        <View>
          <Text style={[styles.title, { color: C.text }]}>
            Inicio
          </Text>

          <Text style={[styles.subtitle, { color: C.muted }]}>
            Resumen de tu actividad como organizador.
          </Text>
        </View>

        <Pressable onPress={cargarEventos}>
          <Text style={[styles.refresh, { color: C.primary }]}>
            ↻ Actualizar
          </Text>
        </Pressable>
      </View>

      {/* ESTADÍSTICAS */}

      <Text style={[styles.sectionTitle, { color: C.text }]}>
        Tu actividad
      </Text>

      <View style={styles.statsContainer}>
        {estadisticas.map((item) => (
          <View
            key={item.titulo}
            style={[
              styles.statCard,
              { backgroundColor: C.surface, borderColor: C.border },
            ]}
          >
            <Text style={[styles.statIcon, { color: C.primary }]}>
              {item.icono}
            </Text>

            <Text style={[styles.statValue, { color: C.text }]}>
              {item.valor}
            </Text>

            <Text style={[styles.statTitle, { color: C.muted }]}>
              {item.titulo}
            </Text>
          </View>
        ))}
      </View>

      {/* ACCIONES RÁPIDAS */}

      <Text style={[styles.sectionTitle, { color: C.text }]}>
        Accesos rápidos
      </Text>

      <View style={styles.quickActions}>
        <Pressable
          style={[styles.quickButton, { backgroundColor: C.primary }]}
          onPress={() => onNavigate?.("Crear")}
        >
          <Text style={styles.quickIcon}>＋</Text>
          <Text style={styles.quickText}>
            Crear evento
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.quickButton,
            { backgroundColor: C.surface, borderColor: C.border, borderWidth: 1 },
          ]}
          onPress={() => onNavigate?.("Mis eventos")}
        >
          <Text style={[styles.quickIcon, { color: C.primary }]}>
            ▣
          </Text>
          <Text style={[styles.quickText, { color: C.text }]}>
            Mis eventos
          </Text>
        </Pressable>
      </View>

      {/* PRÓXIMOS EVENTOS */}

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: C.text }]}>
          Próximos eventos
        </Text>

        <Pressable onPress={() => onNavigate?.("Mis eventos")}>
          <Text style={{ color: C.primary, fontWeight: "700" }}>
            Ver todos
          </Text>
        </Pressable>
      </View>

      {proximosEventos.length === 0 ? (
        <View
          style={[
            styles.emptyCard,
            { backgroundColor: C.surface, borderColor: C.border },
          ]}
        >
          <Text style={[styles.emptyTitle, { color: C.text }]}>
            Todavía no tenés próximos eventos
          </Text>

          <Text style={[styles.subtitle, { color: C.muted }]}>
            Creá un evento y publicalo para que aparezca en esta sección.
          </Text>

          <Pressable
            style={[styles.primaryButton, { backgroundColor: C.primary }]}
            onPress={() => onNavigate?.("Crear")}
          >
            <Text style={styles.primaryButtonText}>
              Crear mi primer evento
            </Text>
          </Pressable>
        </View>
      ) : (
        proximosEventos.slice(0, 3).map((evento) => {
          const vendidas = obtenerVentas(evento);
          const capacidad = obtenerCapacidad(evento);

          const porcentaje =
            capacidad > 0
              ? Math.min(100, (vendidas / capacidad) * 100)
              : 0;

          return (
            <View
              key={evento.id}
              style={[
                styles.eventCard,
                { backgroundColor: C.surface, borderColor: C.border },
              ]}
            >
              <Text style={[styles.eventTitle, { color: C.text }]}>
                {evento.nombre}
              </Text>

              <Text style={[styles.eventDate, { color: C.muted }]}>
                ◷ {formatearFecha(evento.fecha)}
              </Text>

              <View style={styles.salesHeader}>
                <Text style={{ color: C.muted, fontSize: 12 }}>
                  Entradas vendidas
                </Text>

                <Text style={{ color: C.text, fontWeight: "700" }}>
                  {vendidas} / {capacidad}
                </Text>
              </View>

              <View
                style={[
                  styles.progressBackground,
                  { backgroundColor: C.surface2 },
                ]}
              >
                <View
                  style={[
                    styles.progress,
                    {
                      width: `${porcentaje}%`,
                      backgroundColor: C.primary,
                    },
                  ]}
                />
              </View>
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 35,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 25,
  },
  heading: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
    gap: 10,
  },
  title: {
    fontSize: 27,
    fontWeight: "800",
  },
  subtitle: {
    fontSize: 13,
    marginTop: 5,
    lineHeight: 19,
  },
  refresh: {
    fontSize: 12,
    fontWeight: "700",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 14,
  },
  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 28,
  },
  statCard: {
    width: "48%",
    flexGrow: 1,
    borderWidth: 1,
    borderRadius: 14,
    padding: 15,
  },
  statIcon: {
    fontSize: 20,
    marginBottom: 9,
  },
  statValue: {
    fontSize: 25,
    fontWeight: "800",
  },
  statTitle: {
    fontSize: 12,
    marginTop: 4,
  },
  quickActions: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 28,
  },
  quickButton: {
    flex: 1,
    minHeight: 85,
    borderRadius: 13,
    padding: 14,
    justifyContent: "center",
    gap: 5,
  },
  quickIcon: {
    color: "#FFFFFF",
    fontSize: 23,
    fontWeight: "700",
  },
  quickText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  eventCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  eventTitle: {
    fontSize: 17,
    fontWeight: "800",
  },
  eventDate: {
    fontSize: 12,
    marginTop: 7,
    marginBottom: 16,
  },
  salesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  progressBackground: {
    height: 7,
    borderRadius: 10,
    overflow: "hidden",
  },
  progress: {
    height: 7,
    borderRadius: 10,
  },
  emptyCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 18,
    alignItems: "flex-start",
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  primaryButton: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 15,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
  },
});
