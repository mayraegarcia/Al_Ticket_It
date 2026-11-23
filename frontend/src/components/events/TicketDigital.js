
import React from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
} from "react-native";
import { useTheme } from "../../theme/ThemeContext";

// QR visual simulado. No es escaneable todavía.
function QrSimulado({ semilla = "ticketito" }) {
  const tamaño = 21;

  function celdaActiva(fila, columna) {
    const valor = (fila * 17 + columna * 31 + semilla.length * 13) % 7;

    // Reservamos 3 sectores de esquina para simular los marcadores de QR.
    const enEsquina =
      (fila < 7 && columna < 7) ||
      (fila < 7 && columna >= tamaño - 7) ||
      (fila >= tamaño - 7 && columna < 7);

    if (enEsquina) {
      const origenFila = fila < 7 ? 0 : tamaño - 7;
      const origenCol = columna < 7 ? 0 : tamaño - 7;

      const localFila = fila - origenFila;
      const localCol = columna - origenCol;

      return (
        localFila === 0 ||
        localFila === 6 ||
        localCol === 0 ||
        localCol === 6 ||
        (localFila >= 2 &&
          localFila <= 4 &&
          localCol >= 2 &&
          localCol <= 4)
      );
    }

    return valor < 3;
  }

  return (
    <View style={styles.qr}>
      {Array.from({ length: tamaño }, (_, fila) => (
        <View key={fila} style={styles.qrFila}>
          {Array.from({ length: tamaño }, (_, columna) => (
            <View
              key={columna}
              style={[
                styles.qrCelda,
                {
                  backgroundColor: celdaActiva(fila, columna)
                    ? "#252A38"
                    : "#FFFFFF",
                },
              ]}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

export default function TicketDigital({
  visible,
  compra,
  evento,
  onCerrar,
}) {
  const { C } = useTheme();

  if (!compra) return null;

  const fecha = evento?.fecha || evento?.fechaEvento;

  function formatoFecha(valor) {
    if (!valor) return "Fecha no disponible";

    return new Date(valor).toLocaleDateString("es-AR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }

  function formatoHora(valor) {
    if (!valor) return "";

    return new Date(valor).toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function formatoPrecio(valor) {
    return Number(valor || 0).toLocaleString("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    });
  }

  const detalles = compra.detalles || compra.items || [];

  const ticketValido =
    compra.estado === "CONFIRMADA" &&
    fecha &&
    new Date(fecha) > new Date();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onCerrar}
    >
      <View style={styles.overlay}>
        <ScrollView
          contentContainerStyle={styles.scrollModal}
          showsVerticalScrollIndicator={false}
        >
          <View
            style={[
              styles.ticket,
              { backgroundColor: C.surface },
            ]}
          >
            {/* CABECERA */}
            <View
              style={[
                styles.cabecera,
                { backgroundColor: C.primary },
              ]}
            >
              <Text style={styles.logo}>ticketito.</Text>

              <Text style={styles.entradaLabel}>
                ENTRADA DIGITAL
              </Text>

              <Text style={styles.eventoTitulo}>
                {evento?.titulo || evento?.nombre || "Evento"}
              </Text>

              <Text style={styles.eventoFecha}>
                {formatoFecha(fecha)}
              </Text>

              {fecha && (
                <Text style={styles.eventoFecha}>
                  {formatoHora(fecha)}
                </Text>
              )}
            </View>

            {/* DETALLE */}
            <View style={styles.detalle}>
              <View style={styles.dato}>
                <Text style={[styles.label, { color: C.muted }]}>
                  N° DE COMPRA
                </Text>
                <Text style={[styles.valor, { color: C.text }]}>
                  #{compra.id}
                </Text>
              </View>

              <View style={styles.dato}>
                <Text style={[styles.label, { color: C.muted }]}>
                  UBICACIÓN
                </Text>
                <Text style={[styles.valor, { color: C.text }]}>
                  {evento?.ubicacion ||
                    evento?.lugar ||
                    evento?.direccion ||
                    "A confirmar"}
                </Text>
              </View>

              <View style={styles.divisor} />

              {detalles.map((item, index) => (
                <View key={index} style={styles.itemEntrada}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.valor, { color: C.text }]}>
                      {item.tipoEntrada?.nombre ||
                        item.tipoEntrada?.titulo ||
                        item.nombre ||
                        item.tipoEntradaNombre ||
                        "Entrada"}
                    </Text>

                    <Text style={[styles.label, { color: C.muted }]}>
                      Cantidad: {item.cantidad}
                    </Text>
                  </View>

                  <Text style={[styles.valor, { color: C.text }]}>
                    {formatoPrecio(
                      item.subtotal ??
                        item.precioTotal ??
                        (item.precio || 0) * (item.cantidad || 0)
                    )}
                  </Text>
                </View>
              ))}

              <View style={styles.divisor} />

              <View style={styles.total}>
                <Text style={[styles.totalLabel, { color: C.text }]}>
                  TOTAL
                </Text>

                <Text style={[styles.totalPrecio, { color: C.primary }]}>
                  {formatoPrecio(compra.total)}
                </Text>
              </View>
            </View>

            {/* QR */}
            {/* QR O ESTADO DEL TICKET */}
            <View style={styles.seccionQR}>
            {ticketValido ? (
                <>
                <QrSimulado semilla={String(compra.id)} />

                <Text style={[styles.qrTitulo, { color: C.text }]}>
                    Tu entrada
                </Text>

                <Text style={[styles.qrTexto, { color: C.muted }]}>
                    Presentá este ticket al ingresar al evento.
                </Text>

                <Text style={[styles.codigo, { color: C.text }]}>
                    TKT-{compra.id}
                </Text>

                <Text style={styles.avisoQR}>
                    Código ilustrativo de demostración
                </Text>
                </>
            ) : (
                <>
                <View style={styles.ticketInvalido}>
                    <Text style={styles.ticketInvalidoIcono}>
                    {compra.estado === "CANCELADA" ||
                    compra.estado === "REEMBOLSADA"
                        ? "✕"
                        : compra.estado === "UTILIZADA"
                        ? "✓"
                        : "⌛"}
                    </Text>

                    <Text style={styles.ticketInvalidoTitulo}>
                    {compra.estado === "CANCELADA"
                        ? "Compra cancelada"
                        : compra.estado === "REEMBOLSADA"
                        ? "Compra reembolsada"
                        : compra.estado === "UTILIZADA"
                        ? "Entrada utilizada"
                        : "Evento finalizado"}
                    </Text>

                    <Text style={[styles.ticketInvalidoTexto, { color: C.muted }]}>
                    {compra.estado === "CANCELADA" ||
                    compra.estado === "REEMBOLSADA"
                        ? "Esta entrada ya no es válida para ingresar al evento."
                        : compra.estado === "UTILIZADA"
                        ? "Esta entrada ya fue utilizada."
                        : "El evento ya pasó. Esta entrada ya no está disponible para ingresar."}
                    </Text>
                </View>
                </>
            )}
            </View>

            {/* PIE */}
            <View style={styles.pie}>
              <Text style={[styles.pieTexto, { color: C.muted }]}>
                Gracias por elegir ticketito.
              </Text>
            </View>

            <Pressable
              onPress={onCerrar}
              style={[
                styles.botonCerrar,
                { backgroundColor: C.primary },
              ]}
            >
              <Text style={[styles.botonCerrarTexto, { color: C.primaryText }]}>
                Cerrar ticket
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "center",
    padding: 16,
  },
  scrollModal: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: 20,
  },
  ticket: {
    borderRadius: 28,
    overflow: "hidden",
  },
  cabecera: {
    padding: 24,
    alignItems: "center",
  },
  logo: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "900",
  },
  entradaLabel: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 3,
    marginTop: 18,
  },
  eventoTitulo: {
    color: "#FFFFFF",
    fontSize: 23,
    fontWeight: "900",
    textAlign: "center",
    marginTop: 12,
  },
  eventoFecha: {
    color: "#FFFFFF",
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
  },
  detalle: {
    padding: 24,
  },
  dato: {
    marginBottom: 18,
  },
  label: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
    marginBottom: 5,
  },
  valor: {
    fontSize: 15,
    fontWeight: "700",
  },
  divisor: {
    borderBottomWidth: 1,
    borderBottomColor: "#D9D9D9",
    borderStyle: "dashed",
    marginVertical: 16,
  },
  itemEntrada: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginVertical: 8,
  },
  total: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontWeight: "900",
    fontSize: 14,
  },
  totalPrecio: {
    fontWeight: "900",
    fontSize: 22,
  },
  seccionQR: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  qr: {
    width: 210,
    height: 210,
    padding: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
  },
  qrFila: {
    flex: 1,
    flexDirection: "row",
  },
  qrCelda: {
    flex: 1,
    margin: 0.5,
  },
  qrTitulo: {
    fontSize: 18,
    fontWeight: "900",
    marginTop: 18,
  },
  qrTexto: {
    textAlign: "center",
    marginTop: 8,
    fontSize: 13,
  },
  codigo: {
    fontSize: 18,
    fontWeight: "900",
    marginTop: 16,
  },
  avisoQR: {
    color: "#E97862",
    fontWeight: "800",
    fontSize: 11,
    marginTop: 10,
    textAlign: "center",
  },
  pie: {
    borderTopWidth: 1,
    borderTopColor: "#D9D9D9",
    borderStyle: "dashed",
    padding: 20,
    alignItems: "center",
  },
  pieTexto: {
    fontSize: 13,
    fontWeight: "600",
  },
  botonCerrar: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
  },
  botonCerrarTexto: {
    fontWeight: "900",
    fontSize: 15,
  },
  ticketInvalido: {
  width: "100%",
  alignItems: "center",
  paddingVertical: 25,
  paddingHorizontal: 20,
  borderRadius: 20,
  backgroundColor: "#F1D8D2",
},

ticketInvalidoIcono: {
  fontSize: 48,
  color: "#B7443B",
  fontWeight: "900",
},

ticketInvalidoTitulo: {
  fontSize: 20,
  fontWeight: "900",
  color: "#B7443B",
  textAlign: "center",
  marginTop: 12,
},

ticketInvalidoTexto: {
  textAlign: "center",
  fontSize: 14,
  marginTop: 10,
  lineHeight: 21,
},
});
