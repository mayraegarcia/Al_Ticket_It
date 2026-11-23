
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from "react-native";

import { useTheme } from "../../theme/ThemeContext";
import { compraService } from "../../service/compraService";
import { mensajeDeError } from "../../service/api";
import Chat from "../../features/shared/Chat";

export default function EventSalesScreen({ evento, onBack, usuario }) {
  const { C } = useTheme();

  const [compras, setCompras] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [chatCompra, setChatCompra] = useState(null);

  useEffect(() => {
    if (evento?.id) {
      cargarVentas();
    } else {
      setCargando(false);
      setError("No se seleccionó ningún evento.");
    }
  }, [evento?.id]);

  async function cargarVentas() {
    try {
      setCargando(true);
      setError("");

      const respuesta = await compraService.obtenerPorEvento(evento.id);

      setCompras(Array.isArray(respuesta) ? respuesta : []);
    } catch (err) {
      setError(mensajeDeError(err));
    } finally {
      setCargando(false);
    }
  }

  function formatearFecha(fecha) {
    if (!fecha) return "Fecha no disponible";

    const fechaObjeto = new Date(fecha);

    if (Number.isNaN(fechaObjeto.getTime())) {
      return "Fecha no disponible";
    }

    return fechaObjeto.toLocaleString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function formatearPrecio(precio) {
    return `$${(Number(precio) || 0).toLocaleString("es-AR")}`;
  }

  function obtenerColorEstado(estado) {
    switch (estado) {
      case "CONFIRMADA":
        return "#16A34A";
      case "UTILIZADA":
        return "#2563EB";
      case "REEMBOLSADA":
        return "#DC2626";
      case "PENDIENTE":
        return "#D97706";
      default:
        return C.muted;
    }
  }

  const comprasActivas = compras.filter(
    (compra) =>
      compra.estado === "CONFIRMADA" ||
      compra.estado === "UTILIZADA"
  );

  const entradasVendidas = comprasActivas.reduce(
    (total, compra) =>
      total +
      (compra.detalles || []).reduce(
        (subtotal, detalle) =>
          subtotal + (Number(detalle.cantidad) || 0),
        0
      ),
    0
  );

  const recaudacion = comprasActivas.reduce(
    (total, compra) => total + (Number(compra.total) || 0),
    0
  );

  if (chatCompra) {
    return (
        <Chat
        compraId={chatCompra.id}
        usuario={usuario}
        onBack={() => setChatCompra(null)}
        />
    );
    }

  if (cargando) {
    return (
      <View style={[styles.center, { backgroundColor: C.bg }]}>
        <ActivityIndicator size="large" color={C.primary} />
        <Text style={{ color: C.muted, marginTop: 12 }}>
          Cargando ventas...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.center, { backgroundColor: C.bg }]}>
        <Text style={[styles.title, { color: C.text }]}>
          No pudimos cargar las ventas
        </Text>

        <Text style={{ color: C.muted, marginTop: 8, textAlign: "center" }}>
          {error}
        </Text>

        <Pressable
          onPress={cargarVentas}
          style={[styles.button, { backgroundColor: C.primary }]}
        >
          <Text style={styles.buttonText}>Reintentar</Text>
        </Pressable>

        <Pressable onPress={onBack} style={styles.backButton}>
          <Text style={{ color: C.primary, fontWeight: "700" }}>
            Volver a mis eventos
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
      <Pressable onPress={onBack} style={styles.backButton}>
        <Text style={{ color: C.primary, fontWeight: "700" }}>
          ← Volver a mis eventos
        </Text>
      </Pressable>

      <Text style={[styles.title, { color: C.text }]}>
        Ventas del evento
      </Text>

      <Text style={[styles.eventName, { color: C.muted }]}>
        {evento?.nombre}
      </Text>

      {/* RESUMEN */}

      <View style={styles.statsContainer}>
        <View
          style={[
            styles.statCard,
            { backgroundColor: C.card, borderColor: C.border },
          ]}
        >
          <Text style={[styles.statValue, { color: C.text }]}>
            {compras.length}
          </Text>
          <Text style={[styles.statLabel, { color: C.muted }]}>
            Compras
          </Text>
        </View>

        <View
          style={[
            styles.statCard,
            { backgroundColor: C.card, borderColor: C.border },
          ]}
        >
          <Text style={[styles.statValue, { color: C.text }]}>
            {entradasVendidas}
          </Text>
          <Text style={[styles.statLabel, { color: C.muted }]}>
            Entradas vendidas
          </Text>
        </View>

        <View
          style={[
            styles.statCard,
            { backgroundColor: C.card, borderColor: C.border },
          ]}
        >
          <Text style={[styles.statValue, { color: C.primary, fontSize: 18 }]}>
            {formatearPrecio(recaudacion)}
          </Text>
          <Text style={[styles.statLabel, { color: C.muted }]}>
            Recaudación
          </Text>
        </View>
      </View>

      {/* LISTADO */}

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: C.text }]}>
          Compras registradas
        </Text>

        <Pressable onPress={cargarVentas}>
          <Text style={{ color: C.primary, fontWeight: "700" }}>
            Actualizar
          </Text>
        </Pressable>
      </View>

      {compras.length === 0 ? (
        <View
          style={[
            styles.emptyCard,
            { backgroundColor: C.card, borderColor: C.border },
          ]}
        >
          <Text style={[styles.emptyTitle, { color: C.text }]}>
            Todavía no hay ventas
          </Text>

          <Text style={{ color: C.muted, marginTop: 5 }}>
            Cuando alguien compre entradas para este evento, aparecerá acá.
          </Text>
        </View>
      ) : (
        compras.map((compra) => (
          <View
            key={compra.id}
            style={[
              styles.purchaseCard,
              { backgroundColor: C.card, borderColor: C.border },
            ]}
          >
            <View style={styles.purchaseHeader}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.buyerName, { color: C.text }]}>
                  {compra.comprador
                    ? `${compra.comprador.nombre} ${compra.comprador.apellido}`
                    : "Comprador no disponible"}
                </Text>

                <Text style={[styles.info, { color: C.muted }]}>
                  {compra.comprador?.email || ""}
                </Text>
              </View>

              <Text
                style={[
                  styles.status,
                  { color: obtenerColorEstado(compra.estado) },
                ]}
              >
                {compra.estado}
              </Text>
            </View>

            <Text style={[styles.info, { color: C.muted }]}>
              Compra #{compra.id} · {formatearFecha(compra.fecha)}
            </Text>

            <View style={styles.detailContainer}>
              {(compra.detalles || []).map((detalle, index) => (
                <View key={`${compra.id}-${index}`} style={styles.detailRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.detailName, { color: C.text }]}>
                      {detalle.tipoEntrada || "Entrada"}
                    </Text>

                    <Text style={[styles.info, { color: C.muted }]}>
                      {detalle.cantidad} × {formatearPrecio(detalle.precioUnitario)}
                    </Text>
                  </View>

                  <Text style={[styles.detailSubtotal, { color: C.text }]}>
                    {formatearPrecio(detalle.subtotal)}
                  </Text>
                </View>
              ))}
            </View>

            <View style={styles.totalRow}>
              <Text style={{ color: C.muted, fontWeight: "600" }}>
                Total
              </Text>

              <Text style={[styles.total, { color: C.primary }]}>
                {formatearPrecio(compra.total)}
              </Text>
            </View>

            <Pressable
            onPress={() => setChatCompra(compra)}
            style={[
                styles.chatButton,
                {
                backgroundColor: C.primary,
                },
            ]}
            >
            <Text style={{ color: "#FFFFFF", fontWeight: "800" }}>
                💬 Responder mensajes
            </Text>
            </Pressable>

          </View>
        ))
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
  backButton: {
    marginBottom: 18,
    paddingVertical: 8,
    alignSelf: "flex-start",
  },
  title: {
    fontSize: 25,
    fontWeight: "800",
  },
  eventName: {
    fontSize: 14,
    marginTop: 5,
    marginBottom: 22,
  },
  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 9,
    marginBottom: 28,
  },
  statCard: {
    flex: 1,
    minWidth: "28%",
    borderWidth: 1,
    borderRadius: 13,
    padding: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "800",
  },
  statLabel: {
    fontSize: 11,
    marginTop: 5,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
  },
  emptyCard: {
    borderWidth: 1,
    borderRadius: 13,
    padding: 18,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  purchaseCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 15,
    marginBottom: 12,
  },
  purchaseHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 10,
  },
  buyerName: {
    fontSize: 16,
    fontWeight: "800",
  },
  info: {
    fontSize: 12,
    marginTop: 5,
  },
  status: {
    fontSize: 11,
    fontWeight: "800",
  },
  detailContainer: {
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#88888830",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    gap: 10,
  },
  detailName: {
    fontSize: 13,
    fontWeight: "700",
  },
  detailSubtotal: {
    fontSize: 13,
    fontWeight: "700",
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: "#88888830",
    marginTop: 8,
    paddingTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  total: {
    fontSize: 18,
    fontWeight: "800",
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 18,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
    chatButton: {
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 12,
    },
});
