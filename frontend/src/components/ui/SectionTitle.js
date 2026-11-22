
import React from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
} from "react-native";

import { useTheme } from "../../theme/ThemeContext";

export default function SectionTitle({ title, action, onAction }) {
  const { C } = useTheme();

  return (
    <View style={s.row}>
      <Text style={[s.title, { color: C.text }]}>
        {title}
      </Text>

      {action && (
        <Pressable
          onPress={onAction}
          disabled={!onAction}
          accessibilityRole={onAction ? "button" : undefined}
          style={({ pressed }) => [
            s.action,
            {
              opacity: pressed ? 0.7 : 1,
            },
          ]}
        >
          <Text style={[s.actionText, { color: C.primary }]}>
            {action}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  row: {
    marginTop: 24,
    marginBottom: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 19,
    fontWeight: "800",
    letterSpacing: -0.4,
  },
  action: {
    paddingVertical: 5,
    paddingHorizontal: 4,
  },
  actionText: {
    fontWeight: "700",
  },
});
