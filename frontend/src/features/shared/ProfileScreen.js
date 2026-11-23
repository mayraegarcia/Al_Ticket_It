
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from "react-native";

import { useTheme } from "../../theme/ThemeContext";
import { useAuth } from "../../context/authContext";

export default function ProfileScreen() {
  const { C } = useTheme();
  const { usuario, cerrarSesion } = useAuth();

  const nombreCompleto = [
    usuario?.nombre,
    usuario?.apellido,
  ]
    .filter(Boolean)
    .join(" ");

  const iniciales = [
    usuario?.nombre?.[0],
    usuario?.apellido?.[0],
  ]
    .filter(Boolean)
    .join("")
    .toUpperCase();

  const esOrganizador = usuario?.rol === "ORGANIZADOR";

  const rol = esOrganizador ? "Organizador" : "Comprador";

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: C.bg }}
      contentContainerStyle={styles.container}
    >
      <Text style={[styles.title, { color: C.text }]}>
        Mi perfil
      </Text>

      <View style={[styles.profileCard, { backgroundColor: C.card }]}>
        <View
          style={[
            styles.avatar,
            { backgroundColor: C.primary },
          ]}
        >
          <Text style={styles.avatarText}>
            {iniciales || "U"}
          </Text>
        </View>

        <Text style={[styles.name, { color: C.text }]}>
          {nombreCompleto || "Usuario"}
        </Text>

        <Text style={[styles.email, { color: C.muted }]}>
          {usuario?.email || "Sin correo electrónico"}
        </Text>

        <View
          style={[
            styles.roleBadge,
            { backgroundColor: C.bg },
          ]}
        >
          <Text style={[styles.roleText, { color: C.primary }]}>
            {rol}
          </Text>
        </View>
      </View>

      <Text style={[styles.sectionTitle, { color: C.text }]}>
        Información de la cuenta
      </Text>

      <View style={[styles.infoCard, { backgroundColor: C.card }]}>
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: C.muted }]}>
            Nombre
          </Text>

          <Text style={[styles.infoValue, { color: C.text }]}>
            {usuario?.nombre || "-"}
          </Text>
        </View>

        <View style={styles.separator} />

        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: C.muted }]}>
            Apellido
          </Text>

          <Text style={[styles.infoValue, { color: C.text }]}>
            {usuario?.apellido || "-"}
          </Text>
        </View>

        <View style={styles.separator} />

        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: C.muted }]}>
            Correo electrónico
          </Text>

          <Text style={[styles.infoValue, { color: C.text }]}>
            {usuario?.email || "-"}
          </Text>
        </View>

        <View style={styles.separator} />

        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: C.muted }]}>
            Tipo de cuenta
          </Text>

          <Text style={[styles.infoValue, { color: C.text }]}>
            {rol}
          </Text>
        </View>
      </View>

      <Pressable
        style={[styles.logoutButton, { borderColor: "#DC2626" }]}
        onPress={cerrarSesion}
      >
        <Text style={styles.logoutText}>
          Cerrar sesión
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 25,
    fontWeight: "800",
    marginBottom: 22,
  },
  profileCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 28,
  },
  avatar: {
    width: 85,
    height: 85,
    borderRadius: 45,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "800",
  },
  name: {
    fontSize: 21,
    fontWeight: "700",
  },
  email: {
    fontSize: 14,
    marginTop: 5,
  },
  roleBadge: {
    paddingHorizontal: 15,
    paddingVertical: 7,
    borderRadius: 20,
    marginTop: 14,
  },
  roleText: {
    fontSize: 12,
    fontWeight: "700",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
  infoCard: {
    borderRadius: 14,
    padding: 16,
  },
  infoRow: {
    paddingVertical: 10,
    gap: 5,
  },
  infoLabel: {
    fontSize: 12,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: "600",
  },
  separator: {
    height: 1,
    backgroundColor: "#D1D5DB",
  },
  logoutButton: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 15,
    alignItems: "center",
    marginTop: 25,
  },
  logoutText: {
    color: "#DC2626",
    fontSize: 15,
    fontWeight: "700",
  },
});
