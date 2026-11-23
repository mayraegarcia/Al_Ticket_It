
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  Pressable,
  Alert,
  ActivityIndicator,
} from "react-native";

import { useTheme } from "../../theme/ThemeContext";
import { eventoService } from "../../service/eventoService";
import { mensajeDeError } from "../../service/api";

export default function CreateEventScreen({ onCreated }) {
    const { C } = useTheme();

    const [titulo, setTitulo] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [categoriaId, setCategoriaId] = useState("");
    const [fecha, setFecha] = useState("");
    const [hora, setHora] = useState("");

    const [eventoPendiente, setEventoPendiente] = useState(null);

    const [guardando, setGuardando] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalConfig, setModalConfig] = useState({
    titulo: "",
    mensaje: "",
    tipo: "info",
    textoBoton: "Aceptar",
    mostrarCancelar: false,
    });

  const convertirFecha = () => {
    const partes = fecha.split("/");

    if (partes.length !== 3) return null;

    const [dia, mes, anio] = partes.map(Number);
    const [horas, minutos] = hora.split(":").map(Number);

    if (
      !Number.isInteger(dia) ||
      !Number.isInteger(mes) ||
      !Number.isInteger(anio) ||
      !Number.isInteger(horas) ||
      !Number.isInteger(minutos)
    ) {
      return null;
    }

    if (
      anio < 2026 ||
      mes < 1 || mes > 12 ||
      dia < 1 || dia > 31 ||
      horas < 0 || horas > 23 ||
      minutos < 0 || minutos > 59
    ) {
      return null;
    }

    const fechaObjeto = new Date(
      anio,
      mes - 1,
      dia,
      horas,
      minutos
    );

    if (
      fechaObjeto.getFullYear() !== anio ||
      fechaObjeto.getMonth() !== mes - 1 ||
      fechaObjeto.getDate() !== dia
    ) {
      return null;
    }

    return fechaObjeto;
  };

  const guardarEvento = async () => {
    if (
      !titulo.trim() ||
      !descripcion.trim() ||
      !categoriaId.trim() ||
      !fecha.trim() ||
      !hora.trim()
    ) {
      Alert.alert(
        "Datos incompletos",
        "Completá todos los campos."
      );
      return;
    }

    if (
      !Number.isInteger(Number(categoriaId)) ||
      Number(categoriaId) <= 0
    ) {
      Alert.alert(
        "Categoría inválida",
        "Ingresá un ID de categoría válido."
      );
      return;
    }

    const fechaEvento = convertirFecha();

    if (!fechaEvento) {
      Alert.alert(
        "Fecha u hora inválida",
        "Ingresá una fecha válida con formato DD/MM/AAAA y una hora con formato HH:MM."
      );
      return;
    }

    if (fechaEvento <= new Date()) {
      Alert.alert(
        "Fecha inválida",
        "El evento debe tener una fecha futura."
      );
      return;
    }

    const confirmarCreacion = async () => {
        try {
            setModalVisible(false);
            setGuardando(true);

            const fechaEvento = convertirFecha();

            const nuevoEvento = {
            nombre: titulo.trim(),
            descripcion: descripcion.trim(),
            categoriaId: Number(categoriaId),
            fecha: fechaEvento.toISOString(),
            };

            const eventoCreado = await eventoService.crear(nuevoEvento);

            setModalConfig({
            titulo: "¡Evento creado!",
            mensaje: "Tu evento se creó correctamente. Ahora podés configurar sus tipos de entrada.",
            tipo: "success",
            textoBoton: "Continuar",
            mostrarCancelar: false,
            });

            // Guardamos el evento para continuar con su configuración.
            setEventoPendiente(eventoCreado);
            setModalVisible(true);

        } catch (error) {
            setModalConfig({
            titulo: "Error",
            mensaje: mensajeDeError(error),
            tipo: "error",
            textoBoton: "Aceptar",
            mostrarCancelar: false,
            });

            setModalVisible(true);
        } finally {
            setGuardando(false);
        }
        };

    setModalConfig({
        titulo: "¿Crear evento?",
        mensaje: "¿Estás seguro de que querés crear este evento? Se guardará como borrador y después podrás configurar sus entradas.",
        tipo: "warning",
        textoBoton: "Confirmar",
        mostrarCancelar: true,
        });

    setModalVisible(true);

  const campo = (
    label,
    value,
    setter,
    placeholder,
    options = {}
  ) => (
    <View style={styles.field}>
      <Text style={[styles.label, { color: C.text }]}>
        {label}
      </Text>

      <TextInput
        value={value}
        onChangeText={setter}
        placeholder={placeholder}
        placeholderTextColor={C.muted}
        keyboardType={options.keyboardType || "default"}
        multiline={options.multiline || false}
        editable={!guardando}
        textAlignVertical={
          options.multiline ? "top" : "center"
        }
        style={[
          styles.input,
          {
            color: C.text,
            backgroundColor: C.card,
            borderColor: C.border || C.muted,
            height: options.multiline ? 100 : 48,
          },
        ]}
      />
    </View>
  );

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: C.bg }}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={[styles.title, { color: C.text }]}>
        Crear evento
      </Text>

      <Text style={[styles.subtitle, { color: C.muted }]}>
        Completá la información para crear tu evento.
      </Text>

      {campo(
        "Nombre del evento",
        titulo,
        setTitulo,
        "Ej: Festival de Música"
      )}

      {campo(
        "Descripción",
        descripcion,
        setDescripcion,
        "Contá de qué se trata...",
        { multiline: true }
      )}

      {campo(
        "ID de categoría",
        categoriaId,
        setCategoriaId,
        "Ej: 1",
        { keyboardType: "number-pad" }
      )}

      {campo(
        "Fecha (DD/MM/AAAA)",
        fecha,
        setFecha,
        "15/12/2026"
      )}

      {campo(
        "Hora (HH:MM)",
        hora,
        setHora,
        "20:00"
      )}

      <View
        style={[
          styles.notice,
          { backgroundColor: C.card }
        ]}
      >
        <Text style={[styles.noticeText, { color: C.muted }]}>
          El evento se creará como borrador. Luego podrás
          configurar sus entradas y publicarlo.
        </Text>
      </View>

      <Pressable
        style={[
          styles.button,
          {
            backgroundColor: C.primary,
            opacity: guardando ? 0.7 : 1,
          },
        ]}
        onPress={guardarEvento}
        disabled={guardando}
      >
        {guardando ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.buttonText}>
            Crear evento
          </Text>
        )}
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
  },
  subtitle: {
    fontSize: 14,
    marginTop: 6,
    marginBottom: 22,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 7,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 13,
    fontSize: 14,
  },
  notice: {
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
  },
  noticeText: {
    fontSize: 13,
    lineHeight: 19,
  },
  button: {
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});

}