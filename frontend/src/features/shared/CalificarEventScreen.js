import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from "react-native";

import { useTheme } from "../../theme/ThemeContext";
import { resenaService } from "../../service/reseñaService";
import { mensajeDeError } from "../../service/api";

export default function CalificarEventoScreen({ evento, onBack, onCreated }) {
  const { C } = useTheme();

  const [puntuacion, setPuntuacion] = useState(0);
  const [detalle, setDetalle] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  const enviarResena = async () => {
    if (puntuacion === 0) {
      setError("Seleccioná una puntuación.");
      return;
    }

    if (!detalle.trim()) {
      setError("Escribí un comentario.");
      return;
    }

    try {
      setEnviando(true);
      setError("");

      await resenaService.crear({
        eventoId: evento.id,
        puntuacion,
        detalle: detalle.trim(),
      });

      onCreated?.();
    } catch (e) {
      setError(mensajeDeError(e));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: C.bg }}
      contentContainerStyle={styles.contenido}
    >
      <Pressable onPress={onBack} style={styles.volver}>
        <Text style={{ color: C.primary, fontWeight: "800" }}>
          ← Volver a mis entradas
        </Text>
      </Pressable>

      <View
        style={[
          styles.card,
          { backgroundColor: C.card, borderColor: C.border },
        ]}
      >
        <Text style={[styles.titulo, { color: C.text }]}>
          Calificar evento
        </Text>

        <Text style={[styles.evento, { color: C.text }]}>
          {evento?.nombre || evento?.titulo || "Evento"}
        </Text>

        <Text style={[styles.descripcion, { color: C.muted }]}>
          Contanos cómo fue tu experiencia.
        </Text>

        <Text style={[styles.label, { color: C.text }]}>
          Tu puntuación
        </Text>

        <View style={styles.estrellas}>
          {[1, 2, 3, 4, 5].map((estrella) => (
            <Pressable
              key={estrella}
              onPress={() => setPuntuacion(estrella)}
              style={styles.estrella}
            >
              <Text
                style={{
                  fontSize: 38,
                  color: estrella <= puntuacion ? "#F5B301" : C.muted,
                }}
              >
                ★
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={[styles.puntuacionTexto, { color: C.text }]}>
          {puntuacion === 0
            ? "Seleccioná las estrellas"
            : `${puntuacion} de 5`}
        </Text>

        <Text style={[styles.label, { color: C.text }]}>
          Comentario
        </Text>

        <TextInput
          value={detalle}
          onChangeText={setDetalle}
          placeholder="Compartí tu experiencia..."
          placeholderTextColor={C.muted}
          multiline
          maxLength={1000}
          style={[
            styles.input,
            {
              color: C.text,
              backgroundColor: C.bg,
              borderColor: C.border,
            },
          ]}
        />

        <Text style={{ color: C.muted, textAlign: "right" }}>
          {detalle.length}/1000
        </Text>

        {error ? (
          <Text style={styles.error}>{error}</Text>
        ) : null}

        <Pressable
          onPress={enviarResena}
          disabled={enviando}
          style={[
            styles.boton,
            { backgroundColor: C.primary },
            enviando && { opacity: 0.6 },
          ]}
        >
          {enviando ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.botonTexto}>
              Enviar reseña
            </Text>
          )}
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contenido: {
    padding: 20,
    paddingBottom: 40,
  },

  volver: {
    marginBottom: 18,
  },

  card: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 20,
  },

  titulo: {
    fontSize: 23,
    fontWeight: "900",
    marginBottom: 12,
  },

  evento: {
    fontSize: 18,
    fontWeight: "800",
  },

  descripcion: {
    marginTop: 8,
    marginBottom: 25,
    fontSize: 14,
  },

  label: {
    fontWeight: "800",
    marginBottom: 12,
    marginTop: 10,
  },

  estrellas: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },

  estrella: {
    paddingHorizontal: 3,
  },

  puntuacionTexto: {
    textAlign: "center",
    marginTop: 8,
    marginBottom: 20,
    fontWeight: "700",
  },

  input: {
    borderWidth: 1,
    borderRadius: 12,
    minHeight: 130,
    padding: 14,
    textAlignVertical: "top",
  },

  error: {
    color: "#E53935",
    marginTop: 15,
    fontWeight: "700",
  },

  boton: {
    borderRadius: 14,
    padding: 16,
    marginTop: 20,
    alignItems: "center",
  },

  botonTexto: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 16,
  },
});