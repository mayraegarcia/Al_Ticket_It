
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";

import { useTheme } from "../../../theme/ThemeContext";
import Ticketito from "../../../components/mascot/Ticketito";
import { compraService } from "../../../service/compraService";
import { eventoService } from "../../../service/eventoService";
import TicketDigital from "../../../components/events/TicketDigital";
import CalificarEventoScreen from "../../shared/CalificarEventScreen";

import Chat from "../../shared/Chat";
import ConfirmacionModal from "../../../components/ui/ConfirmacionModal";

export default function MyTicketsScreen({usuario}) {
    const { C } = useTheme();

    const [compras, setCompras] = useState([]);
    const [eventos, setEventos] = useState({});
    const [cargando, setCargando] = useState(true);
    const [cancelandoId, setCancelandoId] = useState(null);
    const [error, setError] = useState("");
    const [filtro, setFiltro] = useState("PROXIMAS");

    const [modalCancelarVisible, setModalCancelarVisible] = useState(false);
    const [compraSeleccionada, setCompraSeleccionada] = useState(null);

    const [ticketVisible, setTicketVisible] = useState(false);
    const [ticketSeleccionado, setTicketSeleccionado] = useState(null);

    const [chatCompra, setChatCompra] = useState(null);

    const [eventoParaCalificar, setEventoParaCalificar] = useState(null);
    const [resenasHechas, setResenasHechas] = useState([]);


    const [modalPagoVisible, setModalPagoVisible] = useState(false);
    const [modalPagoExitosoVisible, setModalPagoExitosoVisible] = useState(false);
    const [compraParaPagar, setCompraParaPagar] = useState(null);

  useEffect(() => {
    cargarCompras();
  }, []);

  // ==============================
  // CARGAR COMPRAS
  // ==============================

  async function cargarCompras() {
    try {
      setCargando(true);
      setError("");

      const comprasData = await compraService.obtenerMisCompras();

      const lista = Array.isArray(comprasData)
        ? comprasData
        : comprasData?.compras || [];

      setCompras(lista);

      // Buscamos los datos de cada evento asociado a una compra.
      const eventosData = {};

      await Promise.all(
        lista.map(async (compra) => {
          try {
            const evento = await eventoService.obtenerPorId(
              compra.eventoId
            );

            eventosData[compra.eventoId] = evento?.evento || evento;
          } catch (err) {
            console.log(
              `No se pudo cargar el evento ${compra.eventoId}`,
              err.message
            );
          }
        })
      );

      setEventos(eventosData);
    } catch (err) {
      setError(err.message || "No se pudieron cargar tus compras.");
    } finally {
      setCargando(false);
    }
  }

  // ==============================
  // CANCELAR COMPRA
  // ==============================


  function confirmarCancelacion(compra) {
    setCompraSeleccionada(compra);
    setModalCancelarVisible(true);
    }

  async function cancelarCompra(id) {
    try {
      setCancelandoId(id);
      setError("");

      await compraService.cancelar(id);

      await cargarCompras();
    } catch (err) {
      setError(err.message || "No se pudo cancelar la compra.");
    } finally {
      setCancelandoId(null);
    }
  }

  const pagarCompra = async (compra) => {
    try {
      setCancelandoId(compra.id);
      setError("");

      await compraService.confirmarPago(compra.id);

      await cargarCompras();

      setModalPagoExitosoVisible(true);

    } catch (error) {
      console.error("Error al confirmar el pago:", error);
      setError("No se pudo confirmar el pago");
    } finally {
      setCancelandoId(null);
    }
  };

  function confirmarPago(compra) {
    setCompraParaPagar(compra);
    setModalPagoVisible(true);
  }

  // ==============================
  // HELPERS
  // ==============================

  function formatoFecha(fecha) {
    if (!fecha) return "Fecha a confirmar";

    return new Date(fecha).toLocaleDateString("es-AR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  function formatoPrecio(precio) {
    return Number(precio || 0).toLocaleString("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    });
  }

  function colorEstado(estado) {
    switch (estado) {
      case "CONFIRMADA":
        return "#27865C";
      case "UTILIZADA":
        return "#64748B";
      case "REEMBOLSADA":
      case "CANCELADA":
        return "#D65A55";
      case "PENDIENTE DE PAGO":
        return "#D97706";
      default:
        return C.primary;
    }
  }

  function puedeCancelar(compra, evento) {
    return (
      compra.estado === "CONFIRMADA" &&
      evento?.fecha &&
      new Date(evento.fecha) > new Date()
    );
  }

  function clasificarCompra(compra) {
    const evento = eventos[compra.eventoId];
    const fechaEvento = evento?.fecha || evento?.fechaEvento;

    const eventoPasado = fechaEvento
      ? new Date(fechaEvento) < new Date()
      : false;

    // Pendiente de pago, independientemente de la fecha
    if (compra.estado === "PENDIENTE DE PAGO") {
      return "PENDIENTES";
    }

    // Compras canceladas o reembolsadas
    if (
      compra.estado === "CANCELADA" ||
      compra.estado === "REEMBOLSADA"
    ) {
      return "CANCELADAS";
    }

    // Entradas utilizadas o eventos que ya pasaron
    if (compra.estado === "UTILIZADA" || eventoPasado) {
      return "PASADAS";
    }

    // Compras confirmadas que aún no pasaron
    if (compra.estado === "CONFIRMADA") {
      return "PROXIMAS";
    }

    return "PROXIMAS";
  }

    const cantidadProximas = compras.filter(
    (compra) => clasificarCompra(compra) === "PROXIMAS"
    ).length;

    const cantidadPasadas = compras.filter(
    (compra) => clasificarCompra(compra) === "PASADAS"
    ).length;

    const cantidadCanceladas = compras.filter(
    (compra) => clasificarCompra(compra) === "CANCELADAS"
    ).length;

    const cantidadPendientes = compras.filter(
      (compra) => clasificarCompra(compra) === "PENDIENTES"
    ).length;

    const comprasFiltradas = compras.filter(
    (compra) => clasificarCompra(compra) === filtro
    );

    function abrirTicket(compra) {
        setTicketSeleccionado(compra);
        setTicketVisible(true);
    }

    function cerrarTicket() {
        setTicketVisible(false);
        setTicketSeleccionado(null);
    }

  // ==============================
  // LOADING
  // ==============================
    if (eventoParaCalificar) {
      return (
        <CalificarEventoScreen
          evento={eventoParaCalificar}
          onBack={() => setEventoParaCalificar(null)}
          onCreated={() => {
            setResenasHechas((prev) => [
              ...prev,
              eventoParaCalificar.id,
            ]);

            setEventoParaCalificar(null);
          }}
        />
      );
    }
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
      <View style={styles.centrado}>
        <ActivityIndicator size="large" color={C.primary} />

        <Text style={{ color: C.muted, marginTop: 15 }}>
          Cargando tus entradas...
        </Text>
      </View>
    );
  }

  // ==============================
  // PANTALLA
  // ==============================

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.encabezado}>
        <Text style={[styles.titulo, { color: C.text }]}>
            Mis entradas
        </Text>

        <Text style={[styles.subtitulo, { color: C.muted }]}>
            Todo lo que reservaste, en un solo lugar.
        </Text>

        <View style={styles.contadores}>
            <View style={[styles.contador, { backgroundColor: C.surface2 }]}>
            <Text style={[styles.contadorNumero, { color: C.primary }]}>
                {cantidadProximas}
            </Text>
            <Text style={[styles.contadorLabel, { color: C.muted }]}>
                Próximas
            </Text>
            </View>

            <View style={[styles.contador, { backgroundColor: C.surface2 }]}>
              <Text style={[styles.contadorNumero, { color: "#D97706" }]}>
                {cantidadPendientes}
              </Text>

              <Text style={[styles.contadorLabel, { color: C.muted }]}>
                Pendientes
              </Text>
            </View>

            <View style={[styles.contador, { backgroundColor: C.surface2 }]}>
            <Text style={[styles.contadorNumero, { color: C.text }]}>
                {cantidadPasadas}
            </Text>
            <Text style={[styles.contadorLabel, { color: C.muted }]}>
                Pasadas
            </Text>
            </View>

            <View style={[styles.contador, { backgroundColor: C.surface2 }]}>
            <Text style={[styles.contadorNumero, { color: C.text }]}>
                {cantidadCanceladas}
            </Text>
            <Text style={[styles.contadorLabel, { color: C.muted }]}>
                Canceladas
            </Text>
            </View>
        </View>
        </View>

      {error ? (
        <Text style={styles.error}>
          {error}
        </Text>
      ) : null}

      <View style={styles.filtros}>
        {[
            { id: "PROXIMAS", label: "Próximas" },
            { id: "PENDIENTES", label: "Pendientes" },
            { id: "PASADAS", label: "Pasadas" },
            { id: "CANCELADAS", label: "Canceladas" },
          ].map((opcion) => {
            const activo = filtro === opcion.id;

            return (
            <Pressable
                key={opcion.id}
                onPress={() => setFiltro(opcion.id)}
                style={[
                styles.filtroButton,
                {
                    backgroundColor: activo ? C.primary : C.surface2,
                },
                ]}
            >
                <Text
                style={{
                    color: activo ? C.primaryText : C.text,
                    fontWeight: "800",
                }}
                >
                {opcion.label}
                </Text>
            </Pressable>
            );
        })}
        </View>

      {comprasFiltradas.length === 0 ? (
        <View
          style={[
            styles.vacio,
            { backgroundColor: C.surface2 },
          ]}
        >
          <Ticketito size={120} />
          <Text style={[styles.vacioTitulo, { color: C.text }]}>
            {compras.length === 0
                ? "Todavía no tenés entradas"
                : filtro === "PROXIMAS"
                ? "No tenés eventos próximos"
                : filtro === "PENDIENTES"
                ? "No tenés compras pendientes de pago"
                : filtro === "PASADAS"
                ? "Todavía no asististe a ningún evento"
                : "No tenés compras canceladas"}
            </Text>

            <Text style={{ color: C.muted, textAlign: "center" }}>
            {compras.length === 0
                ? "Cuando compres entradas, vas a poder verlas acá."
                : "No hay compras para mostrar en esta categoría."}
            </Text>
        </View>
      ) : (
        comprasFiltradas.map((compra) => {
          const evento = eventos[compra.eventoId];

          const tituloEvento =
            evento?.titulo ||
            evento?.nombre ||
            `Evento #${compra.eventoId}`;

          const fechaEvento = evento?.fecha || evento?.fechaEvento;

          const lugar =
            evento?.lugar ||
            evento?.ubicacion ||
            evento?.espacio ||
            "Lugar a confirmar";

          const detalles = compra.detalles || [];

          return (
            <View
              key={compra.id}
              style={[
                styles.card,
                {
                  backgroundColor: C.surface,
                  borderColor: C.border,
                },
              ]}
            >
              {/* CABECERA */}

              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.eventoTitulo, { color: C.text }]}>
                    {tituloEvento}
                  </Text>

                  <Text style={{ color: C.muted, marginTop: 6 }}>
                    {formatoFecha(fechaEvento)}
                  </Text>

                  <Text style={{ color: C.muted, marginTop: 4 }}>
                    {lugar}
                  </Text>
                </View>

                <View
                  style={[
                    styles.estado,
                    {
                      backgroundColor: colorEstado(compra.estado),
                    },
                  ]}
                >
                  <Text style={styles.estadoTexto}>
                    {compra.estado}
                  </Text>
                </View>
              </View>

              {/* DÍAS FALTANTES */}

              {compra.estado === "CONFIRMADA" &&
              compra.diasFaltantes != null ? (
                <View
                  style={[
                    styles.dias,
                    { backgroundColor: C.surface2 },
                  ]}
                >
                  <Text style={[styles.diasTexto, { color: C.primary }]}>
                    {compra.diasFaltantes > 0
                      ? `Faltan ${compra.diasFaltantes} días`
                      : compra.diasFaltantes === 0
                      ? "¡El evento es hoy!"
                      : "El evento ya pasó"}
                  </Text>
                </View>
              ) : null}

              {/* DETALLE */}

              <View style={styles.detalles}>
                <Text style={[styles.detalleTitulo, { color: C.text }]}>
                  Entradas
                </Text>

                {detalles.map((detalle, index) => {
                  const tipo = evento?.tiposEntrada?.find(
                    (t) => t.id === detalle.tipoEntradaId
                  );

                  const nombreTipo =
                    tipo?.nombre || `Entrada #${detalle.tipoEntradaId}`;

                  return (
                    <View
                      key={detalle.tipoEntradaId || index}
                      style={styles.lineaDetalle}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: C.text }}>
                          {nombreTipo} x {detalle.cantidad}
                        </Text>

                        <Text style={{ color: C.muted, marginTop: 3 }}>
                          {formatoPrecio(detalle.precioUnitario)} c/u
                        </Text>
                      </View>

                      <Text style={[styles.subtotal, { color: C.text }]}>
                        {formatoPrecio(detalle.subtotal)}
                      </Text>
                    </View>
                  );
                })}
              </View>

              {/* TOTAL */}

              <View
                style={[
                  styles.totalContainer,
                  { borderTopColor: C.border },
                ]}
              >
                <Text style={[styles.totalLabel, { color: C.text }]}>
                  {compra.estado === "PENDIENTE DE PAGO"
                    ? "Total a pagar"
                    : compra.estado === "REEMBOLSADA"
                    ? "Total reembolsado"
                    : compra.estado === "CANCELADA"
                    ? "Total de compra"
                    : "Total pagado"}
                </Text>

                <Text style={[styles.total, { color: C.primary }]}>
                  {formatoPrecio(compra.total)}
                </Text>
              </View>

              {clasificarCompra(compra) === "PROXIMAS" && (
                <Pressable
                    onPress={() => abrirTicket(compra)}
                    style={[
                    styles.botonTicket,
                    { backgroundColor: C.primary },
                    ]}
                >
                    <Text style={{ color: C.primaryText, fontWeight: "900" }}>
                    🎟️ Ver ticket
                    </Text>
                </Pressable>
                )}

                {/* Pagar */}
                {compra.estado === "PENDIENTE DE PAGO" && (
                  <Pressable
                    disabled={cancelandoId === compra.id}
                    onPress={() => confirmarPago(compra)}
                    style={{
                      backgroundColor: "#D97706",
                      opacity: cancelandoId === compra.id ? 0.5 : 1,
                      padding: 12,
                      borderRadius: 10,
                      marginTop: 10,
                    }}
                  >
                    <Text
                      style={{
                        color: "#FFFFFF",
                        fontWeight: "bold",
                        textAlign: "center",
                      }}
                    >
                      {cancelandoId === compra.id ? "Procesando..." : "Pagar"}
                    </Text>
                  </Pressable>
                )}


                {/* MENSAJES */}

                <Pressable
                  onPress={() => setChatCompra(compra)}
                  style={[
                    styles.botonMensajes,
                    {
                      backgroundColor: C.surface2,
                      borderColor: C.primary,
                    },
                  ]}
                >
                  <Text style={{ color: C.primary, fontWeight: "800" }}>
                    💬 Mensajes con el organizador
                  </Text>
                </Pressable>

                {compra.estado === "UTILIZADA" &&
                  !resenasHechas.includes(Number(compra.eventoId)) && (
                    <Pressable
                      onPress={() => {
                        const evento = eventos[compra.eventoId];

                        setEventoParaCalificar({
                          ...evento,
                          id: Number(compra.eventoId),
                          nombre:
                            evento?.nombre ||
                            evento?.titulo ||
                            `Evento #${compra.eventoId}`,
                        });
                      }}
                      style={[
                        styles.botonResena,
                        { backgroundColor: C.primary },
                      ]}
                    >
                      <Text style={styles.botonResenaTexto}>
                        ★ Calificar evento
                      </Text>
                    </Pressable>
                  )}


              {/* CANCELAR */}

              {puedeCancelar(compra, evento) ? (
                <Pressable
                  onPress={() => confirmarCancelacion(compra)}
                  disabled={cancelandoId === compra.id}
                  style={[
                    styles.cancelarButton,
                    { borderColor: "#D65A55" },
                  ]}
                >
                  {cancelandoId === compra.id ? (
                    <ActivityIndicator color="#D65A55" />
                  ) : (
                    <Text style={styles.cancelarTexto}>
                      Cancelar compra
                    </Text>
                  )}
                </Pressable>
              ) : null}
            </View>
          );
        })
      )}

      <Pressable
        onPress={cargarCompras}
        style={[
          styles.actualizarButton,
          { backgroundColor: C.primary },
        ]}
      >
        <Text style={{ color: C.primaryText, fontWeight: "800" }}>
          Actualizar entradas
        </Text>
      </Pressable>

      <ConfirmacionModal
        visible={modalCancelarVisible}
        titulo="Cancelar compra"
        mensaje="¿Estás segura de que querés cancelar esta compra? Esta acción no se puede deshacer."
        tipo="warning"
        textoBoton="Sí, cancelar"
        textoCancelar="Volver"
        mostrarCancelar={true}
        onCancelar={() => {
            setModalCancelarVisible(false);
            setCompraSeleccionada(null);
        }}
        onAceptar={() => {
            setModalCancelarVisible(false);

            if (compraSeleccionada) {
            cancelarCompra(compraSeleccionada.id);
            }

            setCompraSeleccionada(null);
        }}
        />

        <ConfirmacionModal
          visible={modalPagoVisible}
          titulo="Confirmar pago"
          mensaje="¿Estás seguro de que querés realizar el pago de esta compra?"
          tipo="warning"
          textoBoton="Sí, pagar"
          textoCancelar="Cancelar"
          mostrarCancelar={true}
          onCancelar={() => {
            setModalPagoVisible(false);
            setCompraParaPagar(null);
          }}
          onAceptar={() => {
            setModalPagoVisible(false);

            if (compraParaPagar) {
              pagarCompra(compraParaPagar);
            }

            setCompraParaPagar(null);
          }}
        />

        <ConfirmacionModal
          visible={modalPagoExitosoVisible}
          titulo="¡Pago exitoso!"
          mensaje="Tu compra fue confirmada correctamente. Ya podés consultar tu entrada en Mis entradas."
          tipo="success"
          textoBoton="¡Genial!"
          onAceptar={() => setModalPagoExitosoVisible(false)}
        />

        <TicketDigital
            visible={ticketVisible}
            compra={ticketSeleccionado}
            evento={
                ticketSeleccionado
                ? eventos[ticketSeleccionado.eventoId]
                : null
            }
            onCerrar={cerrarTicket}
        />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
  },

  centrado: {
    flex: 1,
    minHeight: 300,
    alignItems: "center",
    justifyContent: "center",
  },

  encabezado: {
    marginBottom: 25,
  },

  titulo: {
    fontSize: 28,
    fontWeight: "900",
  },

  subtitulo: {
    fontSize: 15,
    marginTop: 8,
  },

  card: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 18,
    marginBottom: 20,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },

  eventoTitulo: {
    fontSize: 20,
    fontWeight: "800",
  },

  estado: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },

  estadoTexto: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
  },

  dias: {
    padding: 12,
    borderRadius: 12,
    marginTop: 15,
  },

  diasTexto: {
    fontWeight: "800",
  },

  detalles: {
    marginTop: 20,
  },

  detalleTitulo: {
    fontWeight: "800",
    fontSize: 16,
    marginBottom: 12,
  },

  lineaDetalle: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 10,
  },

  subtotal: {
    fontWeight: "700",
  },

  totalContainer: {
    borderTopWidth: 1,
    marginTop: 15,
    paddingTop: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  totalLabel: {
    fontWeight: "700",
  },

  total: {
    fontSize: 21,
    fontWeight: "900",
  },

  cancelarButton: {
    borderWidth: 1,
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 20,
  },

  cancelarTexto: {
    color: "#D65A55",
    fontWeight: "800",
  },

  vacio: {
    borderRadius: 24,
    padding: 30,
    alignItems: "center",
    gap: 12,
  },

  vacioTitulo: {
    fontSize: 22,
    fontWeight: "900",
    textAlign: "center",
  },

  error: {
    color: "#D93025",
    marginBottom: 15,
  },

  actualizarButton: {
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 5,
  },
  contadores: {
  flexDirection: "row",
  gap: 10,
  marginTop: 20,
},

contador: {
  flex: 1,
  padding: 15,
  borderRadius: 18,
  alignItems: "center",
},

contadorNumero: {
  fontSize: 25,
  fontWeight: "900",
},

contadorLabel: {
  fontSize: 12,
  fontWeight: "700",
  marginTop: 5,
  textAlign: "center",
},

filtros: {
  flexDirection: "row",
  gap: 8,
  marginBottom: 20,
},

filtroButton: {
  flex: 1,
  paddingVertical: 12,
  paddingHorizontal: 5,
  borderRadius: 14,
  alignItems: "center",
  justifyContent: "center",
},
botonTicket: {
  paddingVertical: 14,
  paddingHorizontal: 16,
  borderRadius: 16,
  alignItems: "center",
  justifyContent: "center",
  marginTop: 12,
},

botonMensajes: {
  padding: 14,
  borderRadius: 12,
  borderWidth: 1,
  alignItems: "center",
  marginTop: 12,
},
botonResena: {
  padding: 14,
  borderRadius: 12,
  alignItems: "center",
  marginTop: 12,
},

botonResenaTexto: {
  color: "#fff",
  fontWeight: "900",
},
});
