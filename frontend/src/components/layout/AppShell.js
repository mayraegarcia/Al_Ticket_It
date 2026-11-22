
import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  Pressable,
  StyleSheet,
} from "react-native";
import { StatusBar } from "expo-status-bar";

import { useTheme } from "../../theme/ThemeContext";
import Ticketito from "../mascot/Ticketito";
import ThemeToggle from "../ui/ThemeToggle";

import HomeScreen from "../../features/events/screens/HomeScreen";
import PlaceholderScreen from "../../features/shared/PlaceholderScreen";

const tabs = [
  { name: "Explorar", icon: "⌕" },
  { name: "Mis entradas", icon: "▣" },
  { name: "Organizar", icon: "✦" },
  { name: "Perfil", icon: "◉" },
];

export default function AppShell() {
  const [tab, setTab] = useState("Explorar");
  const { C, dark } = useTheme();

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: C.bg }]}>
      <StatusBar style={dark ? "light" : "dark"} />

      {/* Encabezado */}
      <View style={[s.header, { borderColor: C.border }]}>
        <View style={s.brand}>
          <Ticketito size={42} />
          <Text style={[s.brandText, { color: C.text }]}>
            ticketito
          </Text>
        </View>

        <ThemeToggle />
      </View>

      {/* Contenido principal */}
      <View style={s.content}>
        {tab === "Explorar" ? (
          <HomeScreen />
        ) : (
          <PlaceholderScreen title={tab} />
        )}
      </View>

      {/* Navegación inferior */}
      <View style={[s.nav, { backgroundColor: C.nav, borderColor: C.border }]}>
        {tabs.map((item) => {
          const active = tab === item.name;

          return (
            <Pressable
              key={item.name}
              onPress={() => setTab(item.name)}
              style={s.navItem}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
            >
              <Text
                style={[
                  s.navIcon,
                  { color: active ? C.primary : C.muted },
                ]}
              >
                {item.icon}
              </Text>

              <Text
                style={[
                  s.navLabel,
                  {
                    color: active ? C.primary : C.muted,
                    fontWeight: active ? "700" : "500",
                  },
                ]}
              >
                {item.name}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: {
    flex: 1,
  },
  header: {
    height: 64,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
  },
  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  brandText: {
    fontSize: 23,
    fontWeight: "900",
    letterSpacing: -1,
  },
  content: {
    flex: 1,
  },
  nav: {
    minHeight: 70,
    borderTopWidth: 1,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  navItem: {
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    minWidth: 70,
    paddingVertical: 8,
  },
  navIcon: {
    fontSize: 19,
  },
  navLabel: {
    fontSize: 11,
  },
});
