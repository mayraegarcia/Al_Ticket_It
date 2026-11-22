
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
      {/* Ilustración del evento */}
      <View
        style={[
          s.art,
          { backgroundColor: event.color },
        ]}
      >
        <View style={s.bubble} />

        <Ticketito size={94} />

        <Text style={s.label}>
          {event.category?.toUpperCase()}
        </Text>
      </View>

      {/* Información del evento */}
      <View style={s.info}>
        <View style={s.row}>
          <Text style={[s.date, { color: C.primary }]}>
            {event.date}
          </Text>

          <Text style={[s.category, { color: C.muted }]}>
            {event.category}
          </Text>
        </View>

        <Text style={[s.title, { color: C.text }]}>
          {event.title}
        </Text>

        <Text style={[s.place, { color: C.muted }]}>
          {event.place}
        </Text>

        {/* Precio y acción */}
        <View style={s.bottom}>
          <Text style={[s.price, { color: C.text }]}>
            {event.price}
          </Text>

          <Pressable
            onPress={onPress}
            style={({ pressed }) => [
              s.btn,
              {
                backgroundColor: C.primary,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel={`Ver evento ${event.title}`}
          >
            <Text style={[s.btnText, { color: C.primaryText }]}>
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
  },
  price: {
    fontSize: 18,
    fontWeight: "800",
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
