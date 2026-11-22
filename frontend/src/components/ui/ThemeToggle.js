
import React from "react";
import {
  Pressable,
  Text,
  StyleSheet,
} from "react-native";

import { useTheme } from "../../theme/ThemeContext";

export default function ThemeToggle() {
  const { dark, setDark, C } = useTheme();

  const toggleTheme = () => {
    setDark(!dark);
  };

  return (
    <Pressable
      onPress={toggleTheme}
      style={({ pressed }) => [
        s.btn,
        {
          backgroundColor: C.surface,
          borderColor: C.border,
          opacity: pressed ? 0.7 : 1,
        },
      ]}
      accessibilityRole="button"
      accessibilityLabel={
        dark ? "Activar tema claro" : "Activar tema oscuro"
      }
      accessibilityHint="Cambia la apariencia de la aplicación"
    >
      <Text style={[s.icon, { color: C.text }]}>
        {dark ? "☼" : "☾"}
      </Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  btn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    fontSize: 20,
  },
});
