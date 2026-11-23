
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";

import { useTheme } from "../../theme/ThemeContext";
import { tipoEntradaService } from "../../service/tipoEntradaService";
import { eventoService } from "../../service/eventoService";
import { mensajeDeError } from "../../service/api";

export default function ManageTicketTypesScreen({
  evento,
  onBack,
  onPublished,
}) {
  const { C } = useTheme();

  const [tipos, setTipos] = useState(evento?.tiposEntrada || []);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [precio, setPrecio] = useState("");
  const [cupoTotal, setCupoTotal] = useState("");
  const [tipoEditando, setTipoEditando] = useState(null);

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [publicando, setPublicando] = useState(false);

  const cargarTipos = async () => {
    try {
      setCargando(true);

      const respuesta = await tipoEntradaService.obtenerPorEvento(evento.id);

      // Aceptamos tanto un array como un evento con tiposEntrada.
      const lista = Array.isArray(respuesta)
        ? respuesta
        : respuesta?.tiposEntrada || [];

      setTipos(lista);
    } catch (error) {
      Alert.alert("Error", mensajeDeError(error));
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarTipos();
  }, [evento?.id]);

  const limpiarFormulario = () => {
    setNombre("");
    setDescripcion("");
    setPrecio("");
    setCupoTotal("");
    setTipoEditando(null);
  };

  const seleccionarParaEditar = (tipo) => {
    setTipoEditando(tipo);
    setNombre(tipo.nombre || "");
    setDescripcion(tipo.descripcion || "");
    setPrecio(String(tipo.precio ?? ""));
    setCupoTotal(String(tipo.cupoTotal ?? ""));
  };

  const guardarTipo = async () => {
  if (!nombre.trim() || !precio.trim() || !cupoTotal.trim()) {
    Alert.alert(
      "Datos incompletos",
      "Completá el nombre, el precio y el cupo."
    );
    return;
  }

  const precioNumero = Number(precio.replace(",", "."));
  const cupoNumero = Number(cupoTotal);

  if (!Number.isFinite(precioNumero) || precioNumero < 0) {
    Alert.alert("Precio inválido", "Ingresá un precio válido.");
    return;
  }

  if (!Number.isInteger(cupoNumero) || cupoNumero <= 0) {
    Alert.alert("Cupo inválido", "El cupo debe ser mayor a cero.");
    return;
  }

  const estabaEditando = Boolean(tipoEditando);

  try {
    setGuardando(true);

    const datos = {
      nombre: nombre.trim(),
      descripcion: descripcion.trim(),
      precio: precioNumero,
      cupoTotal: cupoNumero,
    };

    if (estabaEditando) {
      await tipoEntradaService.modificar(
        evento.id,
        tipoEditando.id,
        datos
      );
    } else {
      await tipoEntradaService.agregar(evento.id, datos);
    }

    limpiarFormulario();
    await cargarTipos();

    Alert.alert(
      "¡Listo!",
      estabaEditando
        ? "El tipo de entrada fue actualizado."
        : "El tipo de entrada fue agregado."
    );
  } catch (error) {
    Alert.alert("Error", mensajeDeError(error));
  } finally {
    setGuardando(false);
  }
};

  const eliminarTipo = (tipo) => {
    Alert.alert(
      "Eliminar tipo de entrada",
      `¿Querés eliminar "${tipo.nombre}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await tipoEntradaService.eliminar(evento.id, tipo.id);
              await cargarTipos();
              if (tipoEditando?.id === tipo.id) {
                limpiarFormulario();
              }
            } catch (error) {
              Alert.alert("Error", mensajeDeError(error));
            }
          },
        },
      ]
    );
  };

  const publicarEvento = () => {
    if (tipos.length === 0) {
      Alert.alert(
        "No podés publicar todavía",
        "Primero agregá al menos un tipo de entrada."
      );
      return;
    }

    Alert.alert(
      "Publicar evento",
      "¿Estás seguro de que querés publicar este evento?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Publicar",
          onPress: async () => {
            try {
              setPublicando(true);
              await eventoService.publicar(evento.id);

              Alert.alert(
                "¡Evento publicado!",
                "Tu evento ya está disponible para los compradores.",
                [{ text: "Aceptar", onPress: onPublished }]
              );
            } catch (error) {
              Alert.alert("No se pudo publicar", mensajeDeError(error));
            } finally {
              setPublicando(false);
            }
          },
        },
      ]
    );
  };

  if (!evento) {
    return (
      <View style={[styles.center, { backgroundColor: C.bg }]}>
        <Text style={{ color: C.text }}>No hay un evento seleccionado.</Text>
        <Pressable onPress={onBack}>
          <Text style={{ color: C.primary, marginTop: 15 }}>Volver</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: C.bg }}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Pressable onPress={onBack} style={styles.backButton}>
        <Text style={{ color: C.primary, fontWeight: "700" }}>
          ← Volver a mis eventos
        </Text>
      </Pressable>

      <Text style={[styles.title, { color: C.text }]}>
        Configurar entradas
      </Text>

      <Text style={[styles.subtitle, { color: C.muted }]}>
        {evento.nombre}
      </Text>

      <View style={[styles.card, { backgroundColor: C.card }]}>
        <Text style={[styles.sectionTitle, { color: C.text }]}>
          {tipoEditando ? "Editar tipo de entrada" : "Agregar tipo de entrada"}
        </Text>

        <View style={styles.opcionesRapidas}>
        {["General", "VIP", "Preventa", "Platea"].map((opcion) => (
            <Pressable
            key={opcion}
            onPress={() => setNombre(opcion)}
            style={[
                styles.chip,
                {
                backgroundColor:
                    nombre === opcion ? C.primary : C.bg,
                borderColor: C.border,
                },
            ]}
            >
            <Text
                style={{
                color: nombre === opcion ? "#FFFFFF" : C.text,
                fontWeight: "600",
                }}
            >
                {opcion}
            </Text>
            </Pressable>
        ))}
        </View>
        <TextInput
          value={nombre}
          onChangeText={setNombre}
          placeholder="Ej: General, VIP, Preventa"
          placeholderTextColor={C.muted}
          style={[styles.input, { color: C.text, borderColor: C.border }]}
        />

        <Text style={[styles.label, { color: C.text }]}>Descripción (opcional)</Text>
        <TextInput
          value={descripcion}
          onChangeText={setDescripcion}
          placeholder="Detalles de esta entrada"
          placeholderTextColor={C.muted}
          style={[styles.input, { color: C.text, borderColor: C.border }]}
        />

        <Text style={[styles.label, { color: C.text }]}>Precio</Text>
        <TextInput
          value={precio}
          onChangeText={setPrecio}
          placeholder="Ej: 15000"
          keyboardType="decimal-pad"
          placeholderTextColor={C.muted}
          style={[styles.input, { color: C.text, borderColor: C.border }]}
        />

        <Text style={[styles.label, { color: C.text }]}>Cupo total</Text>
        <TextInput
          value={cupoTotal}
          onChangeText={setCupoTotal}
          placeholder="Ej: 100"
          keyboardType="number-pad"
          placeholderTextColor={C.muted}
          style={[styles.input, { color: C.text, borderColor: C.border }]}
        />

        <Pressable
          onPress={guardarTipo}
          disabled={guardando}
          style={[styles.primaryButton, { backgroundColor: C.primary }]}
        >
          {guardando ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.primaryButtonText}>
              {tipoEditando ? "Guardar cambios" : "Agregar entrada"}
            </Text>
          )}
        </Pressable>

        {tipoEditando && (
          <Pressable onPress={limpiarFormulario} style={styles.cancelEdit}>
            <Text style={{ color: C.muted }}>Cancelar edición</Text>
          </Pressable>
        )}
      </View>

      <View style={styles.listHeader}>
        <Text style={[styles.sectionTitle, { color: C.text }]}>
          Tipos de entrada
        </Text>
        <Text style={{ color: C.muted }}>{tipos.length} configurados</Text>
      </View>

      {cargando ? (
        <ActivityIndicator size="large" color={C.primary} />
      ) : tipos.length === 0 ? (
        <Text style={[styles.empty, { color: C.muted }]}>
          Todavía no agregaste tipos de entrada.
        </Text>
      ) : (
        tipos.map((tipo) => (
          <View
            key={tipo.id}
            style={[styles.ticketCard, { backgroundColor: C.card }]}
          >
            <View style={{ flex: 1 }}>
              <Text style={[styles.ticketName, { color: C.text }]}>
                {tipo.nombre}
              </Text>

              {tipo.descripcion ? (
                <Text style={{ color: C.muted, marginTop: 4 }}>
                  {tipo.descripcion}
                </Text>
              ) : null}

              <Text style={[styles.ticketInfo, { color: C.muted }]}>
                Precio: ${Number(tipo.precio).toLocaleString("es-AR")}
                </Text>

                <Text style={[styles.ticketInfo, { color: C.muted }]}>
                Cupo total: {tipo.cupoTotal}
                </Text>

                <Text style={[styles.ticketInfo, { color: C.muted }]}>
                Disponibles: {tipo.cupoDisponible ?? tipo.cupoTotal}
                </Text>

                <Text style={[styles.ticketInfo, { color: C.muted }]}>
                Vendidas: {
                    tipo.cupoTotal - (tipo.cupoDisponible ?? tipo.cupoTotal)
                }
                </Text>
            </View>

            <View style={styles.actions}>
              <Pressable onPress={() => seleccionarParaEditar(tipo)}>
                <Text style={{ color: C.primary, fontWeight: "700" }}>
                  Editar
                </Text>
              </Pressable>

              <Pressable onPress={() => eliminarTipo(tipo)}>
                <Text style={{ color: "#DC2626", fontWeight: "700" }}>
                  Eliminar
                </Text>
              </Pressable>
            </View>
          </View>
        ))
      )}

      <Pressable
        onPress={publicarEvento}
        disabled={publicando || cargando}
        style={[
          styles.publishButton,
          { backgroundColor: tipos.length > 0 ? "#16A34A" : C.muted },
        ]}
      >
        {publicando ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.primaryButtonText}>Publicar evento</Text>
        )}
      </Pressable>

      <Text style={[styles.helper, { color: C.muted }]}>
        Para publicar el evento necesitás configurar al menos un tipo de entrada.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  backButton: {
    marginBottom: 18,
  },
  title: {
    fontSize: 25,
    fontWeight: "800",
  },
  subtitle: {
    fontSize: 15,
    marginTop: 6,
    marginBottom: 22,
  },
  card: {
    padding: 17,
    borderRadius: 15,
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 15,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 7,
  },
  input: {
    borderWidth: 1,
    borderRadius: 9,
    paddingHorizontal: 12,
    paddingVertical: 11,
    marginBottom: 15,
    fontSize: 14,
  },
  primaryButton: {
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 5,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
  cancelEdit: {
    alignItems: "center",
    marginTop: 13,
  },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  empty: {
    textAlign: "center",
    padding: 25,
  },
  ticketCard: {
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  ticketName: {
    fontSize: 16,
    fontWeight: "800",
  },
  ticketInfo: {
    fontSize: 13,
    marginTop: 6,
  },
  actions: {
    gap: 14,
    alignItems: "flex-end",
  },
  publishButton: {
    padding: 16,
    borderRadius: 11,
    alignItems: "center",
    marginTop: 18,
  },
  helper: {
    fontSize: 12,
    textAlign: "center",
    marginTop: 10,
    lineHeight: 18,
  },
  opcionesRapidas: {
  flexDirection: "row",
  flexWrap: "wrap",
  gap: 8,
  marginBottom: 15,
},

chip: {
  borderWidth: 1,
  borderRadius: 20,
  paddingHorizontal: 13,
  paddingVertical: 8,
},
});
