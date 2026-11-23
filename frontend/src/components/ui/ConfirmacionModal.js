
import React from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
} from "react-native";
import { useTheme } from "../../theme/ThemeContext";

export default function ConfirmacionModal({
  visible,
  titulo = "¡Listo!",
  mensaje = "",
  tipo = "success",
  textoBoton = "Aceptar",
  textoCancelar = "Cancelar",
  mostrarCancelar = false,
  onAceptar,
  onCancelar,
}) {
  const { C } = useTheme();

  const iconos = {
    success: "✓",
    error: "✕",
    warning: "!",
    info: "i",
  };

  const colores = {
    success: "#4D9B74",
    error: "#D9534F",
    warning: "#D9A441",
    info: "#5796C8",
  };

  const color = colores[tipo] || colores.success;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancelar || onAceptar}
    >
      <View style={s.overlay}>
        <View
          style={[
            s.contenedor,
            { backgroundColor: C.surface },
          ]}
        >
          <View
            style={[
              s.icono,
              { backgroundColor: color },
            ]}
          >
            <Text style={s.iconoTexto}>
              {iconos[tipo] || iconos.success}
            </Text>
          </View>

          <Text style={[s.titulo, { color: C.text }]}>
            {titulo}
          </Text>

          <Text style={[s.mensaje, { color: C.muted }]}>
            {mensaje}
          </Text>

          <View style={s.botones}>
            {mostrarCancelar && (
              <Pressable
                onPress={onCancelar}
                style={[
                  s.boton,
                  s.botonSecundario,
                  { borderColor: C.border },
                ]}
              >
                <Text style={{ color: C.text, fontWeight: "700" }}>
                  {textoCancelar}
                </Text>
              </Pressable>
            )}

            <Pressable
              onPress={onAceptar}
              style={[s.boton, { backgroundColor: C.primary }]}
            >
              <Text style={s.textoBoton}>
                {textoBoton}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  contenedor: {
    width: "100%",
    maxWidth: 400,
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
  },
  icono: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  iconoTexto: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "900",
  },
  titulo: {
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 10,
  },
  mensaje: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    marginBottom: 24,
  },
  botones: {
    width: "100%",
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
  },
  boton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  botonSecundario: {
    backgroundColor: "transparent",
    borderWidth: 1,
  },
  textoBoton: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 15,
  },
});
