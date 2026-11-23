
import React, { useState } from "react";
import {
  ScrollView,
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from "react-native";

import { useTheme } from "../../../theme/ThemeContext";
import Ticketito from "../../../components/mascot/Ticketito";
import { compraService } from "../../../service/compraService";
import ConfirmacionModal from "../../../components/ui/ConfirmacionModal";

export default function EventDetailScreen({ event, onBack }) {
    const { C } = useTheme();

    const [cantidades, setCantidades] = useState({});

    const [comprando, setComprando] = useState(false);
    const [error, setError] = useState("");

    const [modalConfirmarCompra, setModalConfirmarCompra] = useState(false);
    const [modalCompraVisible, setModalCompraVisible] = useState(false);
    const [compraRealizada, setCompraRealizada] = useState(null);


    if (!event) return null;

    const titulo = event.titulo || event.nombre || "Evento";

    const descripcion =
        event.descripcion || "Todavía no hay una descripción disponible.";

    const fecha = event.fecha || event.fechaEvento;

    const lugar =
        event.lugar || event.ubicacion || event.espacio || "Lugar a confirmar";

    const categoria =
        event.categoria?.nombre ||
        event.categoriaNombre ||
        (typeof event.categoria === "string" ? event.categoria : "Evento");

    const tipos = event.tiposEntrada || event.tiposEntradas || [];

    const fechaTexto = fecha
        ? new Date(fecha).toLocaleDateString("es-AR", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
        })
        : "Fecha a confirmar";

    // ==============================
    // SELECCIONAR CANTIDAD
    // ==============================

    function aumentar(tipo) {
        setError("");

        setCantidades((prev) => {
        const actual = prev[tipo.id] || 0;

        const disponibles = Number(tipo.cupoDisponible ?? Infinity);

        if (actual >= disponibles) return prev;

        return {
            ...prev,
            [tipo.id]: actual + 1,
        };
        });
    }

    function disminuir(tipo) {
        setError("");

        setCantidades((prev) => {
        const actual = prev[tipo.id] || 0;

        if (actual <= 0) return prev;

        return {
            ...prev,
            [tipo.id]: actual - 1,
        };
        });
    }

    // ==============================
    // CALCULAR TOTAL
    // ==============================

    const itemsSeleccionados = tipos
        .filter((tipo) => (cantidades[tipo.id] || 0) > 0)
        .map((tipo) => ({
        tipoEntradaId: tipo.id,
        cantidad: cantidades[tipo.id],
        }));

    const total = tipos.reduce((acumulador, tipo) => {
        const cantidad = cantidades[tipo.id] || 0;

        return acumulador + Number(tipo.precio || 0) * cantidad;
    }, 0);

    const totalEntradas = itemsSeleccionados.reduce(
        (acumulador, item) => acumulador + item.cantidad,
        0
    );

    function solicitarConfirmacionCompra() {
        if (itemsSeleccionados.length === 0) {
            setError("Seleccioná al menos una entrada.");
            return;
        }

        setError("");
        setModalConfirmarCompra(true);
        }

    // ==============================
    // REALIZAR COMPRA
    // ==============================

    async function realizarCompra() {
        if (itemsSeleccionados.length === 0) {
        setError("Seleccioná al menos una entrada.");
        return;
        }

        setError("");
        setComprando(true);

        try {
        const datosCompra = {
            eventoId: event.id,
            items: itemsSeleccionados,
        };

        const resultado = await compraService.crear(datosCompra);

        setCompraRealizada(resultado);
        } catch (err) {
        setError(
            err.message || "No se pudo realizar la compra."
        );
        } finally {
        setComprando(false);
        }
    }

    // ==============================
    // COMPRA CONFIRMADA
    // ==============================

    if (compraRealizada) {
        return (
        <ScrollView contentContainerStyle={styles.container}>
            <View
            style={[
                styles.confirmacion,
                { backgroundColor: C.surface },
            ]}
            >
            <Ticketito size={120} />

            <Text style={[styles.confirmacionTitulo, { color: C.text }]}>
                ¡Compra realizada!
            </Text>

            <Text style={[styles.description, { color: C.muted }]}>
                Tus entradas fueron compradas correctamente.
            </Text>

            <Text style={[styles.sectionTitle, { color: C.text }]}>
                Detalle de la compra
            </Text>

            <Text style={{ color: C.text, marginBottom: 8 }}>
                Evento: {titulo}
            </Text>

            <Text style={{ color: C.text, marginBottom: 8 }}>
                Número de compra: {compraRealizada.id}
            </Text>

            <Text style={{ color: C.text, marginBottom: 8 }}>
                Estado: {compraRealizada.estado}
            </Text>

            <Text style={[styles.total, { color: C.primary }]}>
                Total:{" "}
                {Number(compraRealizada.total ?? total).toLocaleString("es-AR", {
                style: "currency",
                currency: "ARS",
                maximumFractionDigits: 0,
                })}
            </Text>

            <Pressable
                onPress={onBack}
                style={[
                styles.buyButton,
                { backgroundColor: C.primary },
                ]}
            >
                <Text style={{ color: C.primaryText, fontWeight: "800" }}>
                Volver a explorar
                </Text>
            </Pressable>
            </View>
        </ScrollView>
        );
    }

    // ==============================
    // DETALLE DEL EVENTO
    // ==============================

    return (
        <ScrollView contentContainerStyle={styles.container}>
        <Pressable onPress={onBack} style={styles.back}>
            <Text style={{ color: C.primary, fontWeight: "700" }}>
            ← Volver a explorar
            </Text>
        </Pressable>

        <View
            style={[
            styles.banner,
            { backgroundColor: C.surface2 },
            ]}
        >
            <Ticketito size={150} />
        </View>

        <View
            style={[
            styles.category,
            { backgroundColor: C.primary },
            ]}
        >
            <Text style={{ color: C.primaryText, fontWeight: "700" }}>
            {categoria}
            </Text>
        </View>

        <Text style={[styles.title, { color: C.text }]}>
            {titulo}
        </Text>

        <View style={styles.info}>
            <Text style={[styles.infoText, { color: C.text }]}>
            📅 {fechaTexto}
            </Text>

            <Text style={[styles.infoText, { color: C.text }]}>
            📍 {lugar}
            </Text>
        </View>

        <Text style={[styles.sectionTitle, { color: C.text }]}>
            Sobre el evento
        </Text>

        <Text style={[styles.description, { color: C.muted }]}>
            {descripcion}
        </Text>

        <Text style={[styles.sectionTitle, { color: C.text }]}>
            Elegí tus entradas
        </Text>

        {tipos.length > 0 ? (
            tipos.map((tipo, index) => {
            const cantidad = cantidades[tipo.id] || 0;

            const disponibles = Number(tipo.cupoDisponible ?? 0);

            const agotada = disponibles <= 0;

            return (
                <View
                key={tipo.id || index}
                style={[
                    styles.ticket,
                    {
                    backgroundColor: C.surface,
                    borderColor: C.border,
                    },
                ]}
                >
                <View style={{ flex: 1 }}>
                    <Text style={[styles.ticketTitle, { color: C.text }]}>
                    {tipo.nombre || tipo.titulo || "Entrada"}
                    </Text>

                    {tipo.descripcion ? (
                    <Text style={{ color: C.muted, marginTop: 5 }}>
                        {tipo.descripcion}
                    </Text>
                    ) : null}

                    <Text style={{ color: C.muted, marginTop: 6 }}>
                    {agotada
                        ? "Agotadas"
                        : `${disponibles} disponibles`}
                    </Text>

                    <Text style={[styles.price, { color: C.primary }]}>
                    {Number(tipo.precio || 0).toLocaleString("es-AR", {
                        style: "currency",
                        currency: "ARS",
                        maximumFractionDigits: 0,
                    })}
                    </Text>
                </View>

                <View style={styles.selector}>
                    <Pressable
                    onPress={() => disminuir(tipo)}
                    disabled={cantidad <= 0}
                    style={[
                        styles.quantityButton,
                        {
                        backgroundColor: C.surface2,
                        opacity: cantidad <= 0 ? 0.4 : 1,
                        },
                    ]}
                    >
                    <Text style={[styles.quantityText, { color: C.text }]}>
                        −
                    </Text>
                    </Pressable>

                    <Text style={[styles.quantity, { color: C.text }]}>
                    {cantidad}
                    </Text>

                    <Pressable
                    onPress={() => aumentar(tipo)}
                    disabled={agotada || cantidad >= disponibles}
                    style={[
                        styles.quantityButton,
                        {
                        backgroundColor: C.primary,
                        opacity:
                            agotada || cantidad >= disponibles ? 0.4 : 1,
                        },
                    ]}
                    >
                    <Text style={[styles.quantityText, { color: C.primaryText }]}>
                        +
                    </Text>
                    </Pressable>
                </View>
                </View>
            );
            })
        ) : (
            <Text style={{ color: C.muted }}>
            No hay tipos de entrada disponibles.
            </Text>
        )}

        {/* ============================== */}
        {/* RESUMEN DE COMPRA */}
        {/* ============================== */}

        <View
            style={[
            styles.resumen,
            {
                backgroundColor: C.surface2,
            },
            ]}
        >
            <Text style={[styles.sectionTitle, { color: C.text }]}>
            Resumen
            </Text>

            <Text style={{ color: C.text }}>
            Entradas seleccionadas: {totalEntradas}
            </Text>

            <Text style={[styles.total, { color: C.primary }]}>
            Total:{" "}
            {total.toLocaleString("es-AR", {
                style: "currency",
                currency: "ARS",
                maximumFractionDigits: 0,
            })}
            </Text>
        </View>

        {error ? (
            <Text style={styles.error}>
            {error}
            </Text>
        ) : null}

        <Pressable
            onPress={solicitarConfirmacionCompra}
            disabled={comprando || totalEntradas === 0}
            style={[
                styles.buyButton,
                {
                backgroundColor: C.primary,
                opacity: comprando || totalEntradas === 0 ? 0.5 : 1,
                },
            ]}
            >
            <Text style={{ color: C.primaryText, fontWeight: "800" }}>
                Comprar entradas
            </Text>
        </Pressable>

        <ConfirmacionModal
            visible={modalConfirmarCompra}
            titulo="¿Confirmás tu compra?"
            mensaje={`Vas a comprar ${totalEntradas} entrada(s) para ${titulo}. El total es ${total.toLocaleString("es-AR", {
                style: "currency",
                currency: "ARS",
                maximumFractionDigits: 0,
            })}. ¿Querés continuar?`}
            tipo="warning"
            textoBoton="Confirmar compra"
            textoCancelar="Volver"
            mostrarCancelar
            onAceptar={() => {
                setModalConfirmarCompra(false);
                realizarCompra();
            }}
            onCancelar={() => setModalConfirmarCompra(false)}
        />

        <ConfirmacionModal
            visible={modalCompraVisible}
            titulo="¡Compra realizada!"
            mensaje="Tus entradas ya están listas. Podés consultarlas en la sección Mis entradas."
            tipo="success"
            textoBoton="¡Genial!"
            onAceptar={() => {
                setModalCompraVisible(false);
                setCompraRealizada(null);
            }}
        />
    </ScrollView>

    
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
  },

  back: {
    marginBottom: 20,
  },

  banner: {
    minHeight: 190,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },

  category: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    marginBottom: 12,
  },

  title: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 18,
  },

  info: {
    gap: 12,
    marginBottom: 25,
  },

  infoText: {
    fontSize: 15,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 12,
    marginTop: 10,
  },

  description: {
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 20,
  },

  ticket: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  ticketTitle: {
    fontSize: 16,
    fontWeight: "700",
  },

  price: {
    fontSize: 17,
    fontWeight: "800",
    marginTop: 10,
  },

  selector: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  quantityButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  quantityText: {
    fontSize: 22,
    fontWeight: "800",
  },

  quantity: {
    fontSize: 18,
    fontWeight: "800",
    minWidth: 20,
    textAlign: "center",
  },

  resumen: {
    padding: 18,
    borderRadius: 18,
    marginTop: 20,
  },

  total: {
    fontSize: 23,
    fontWeight: "900",
    marginTop: 15,
  },

  buyButton: {
    padding: 17,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 20,
  },

  error: {
    color: "#D93025",
    marginTop: 15,
    fontWeight: "600",
  },

  confirmacion: {
    padding: 20,
    borderRadius: 24,
    alignItems: "center",
    marginTop: 20,
  },

  confirmacionTitulo: {
    fontSize: 26,
    fontWeight: "900",
    marginTop: 15,
  },
});
