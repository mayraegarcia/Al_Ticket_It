import React from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
} from "react-native";

import Ticketito from "../mascot/Ticketito";
import { useTheme } from "../../theme/ThemeContext";

export default function EventCard({ event, onPress }) {
  const { C } = useTheme();

  const titulo =
    event.titulo || event.nombre || "Evento";

  const fecha =
    event.fecha || event.fechaEvento || null;

  const lugar =
    event.lugar ||
    event.ubicacion ||
    event.espacio ||
    "Lugar a confirmar";

  const categoria =
    event.categoria?.nombre ||
    event.categoriaNombre ||
    (typeof event.categoria === "string"
      ? event.categoria
      : "Evento");

  const tipos =
    event.tiposEntrada ||
    event.tiposEntradas ||
    [];

  const precios = tipos
    .map((tipo) => Number(tipo.precio))
    .filter((precio) => Number.isFinite(precio));

  const precioEvento =
    precios.length > 0
      ? Math.min(...precios)
      : Number(event.precio);

  const tienePrecio =
    Number.isFinite(precioEvento) && precioEvento >= 0;

  const precioTexto = tienePrecio
    ? precioEvento.toLocaleString("es-AR", {
        style: "currency",
        currency: "ARS",
        maximumFractionDigits: 0,
      })
    : "Consultar entradas";

  const fechaTexto = fecha
    ? new Date(fecha).toLocaleDateString("es-AR", {
        weekday: "short",
        day: "2-digit",
        month: "short",
      })
    : "Fecha a confirmar";

  return (
    <View
      style={[
        s.card,
        {
          backgroundColor: C.surface,
          borderColor: C.border,
        },
      ]}
    >
      {/* Ilustración */}
      <View
        style={[
          s.art,
          { backgroundColor: C.surface2 },
        ]}
      >
        <View style={s.bubble} />

        <Ticketito size={94} />

        <Text style={s.label}>
          {categoria.toUpperCase()}
        </Text>
      </View>

      {/* Información */}
      <View style={s.info}>
        <View style={s.row}>
          <Text style={[s.date, { color: C.primary }]}>
            {fechaTexto}
          </Text>

          <Text
            style={[s.category, { color: C.muted }]}
            numberOfLines={1}
          >
            {categoria}
          </Text>
        </View>

        <Text
          style={[s.title, { color: C.text }]}
          numberOfLines={2}
        >
          {titulo}
        </Text>

        <Text
          style={[s.place, { color: C.muted }]}
          numberOfLines={2}
        >
          {lugar}
        </Text>

        {/* Precio y botón */}
        <View style={s.bottom}>
          <Text
            style={[s.price, { color: C.text }]}
          >
            {precioTexto}
          </Text>

          <Pressable
            onPress={() => onPress?.(event)}
            style={({ pressed }) => [
              s.btn,
              {
                backgroundColor: C.primary,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel={`Ver evento ${titulo}`}
          >
            <Text
              style={[
                s.btnText,
                { color: C.primaryText },
              ]}
            >
              Ver evento ↗
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 23,
    overflow: "hidden",
    marginTop: 15,
  },

  art: {
    height: 165,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },

  bubble: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "#FFFFFF",
    opacity: 0.3,
    left: -20,
    top: -20,
  },

  label: {
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 2,
    position: "absolute",
    bottom: 12,
    color: "#252A38",
  },

  info: {
    padding: 16,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },

  date: {
    fontSize: 11,
    fontWeight: "800",
  },

  category: {
    fontSize: 12,
  },

  title: {
    fontSize: 22,
    fontWeight: "800",
    marginTop: 8,
  },

  place: {
    marginTop: 4,
  },

  bottom: {
    marginTop: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },

  price: {
    fontSize: 18,
    fontWeight: "800",
    flexShrink: 1,
  },

  btn: {
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 12,
  },

  btnText: {
    fontWeight: "700",
  },
});
