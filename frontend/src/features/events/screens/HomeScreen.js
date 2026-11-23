import React, { useEffect, useMemo, useState } from "react";
import {
  ScrollView,
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from "react-native";

import { useTheme } from "../../../theme/ThemeContext";
import EventCard from "../../../components/events/EventCard";
import SectionTitle from "../../../components/ui/SectionTitle";
import Ticketito from "../../../components/mascot/Ticketito";

// Services existentes
import { eventoService } from "../../../service/eventoService";
import { categoriaService } from "../../../service/categoriaService";

const ordenamientos = [
  { label: "Relevancia", value: "relevancia" },
  { label: "Menor precio", value: "precioAsc" },
  { label: "Mayor precio", value: "precioDesc" },
  { label: "Fecha", value: "fechaAsc" },
  { label: "Mejor puntuación", value: "puntajeDesc" },
];

export default function HomeScreen({ onEventPress }) {
  const { C } = useTheme();

  const [eventos, setEventos] = useState([]);
  const [categorias, setCategorias] = useState([]);

  const [busqueda, setBusqueda] = useState("");
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
  const [orden, setOrden] = useState("relevancia");

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  // Cargar catálogo y categorías
  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    setCargando(true);
    setError("");

    try {
      const [respuestaEventos, respuestaCategorias] = await Promise.all([
        eventoService.obtenerTodos(),
        categoriaService.obtenerTodas(),
      ]);

      // Adaptamos las respuestas por si vienen envueltas
      // en una propiedad o directamente como array.
      const listaEventos =
        Array.isArray(respuestaEventos)
          ? respuestaEventos
          : respuestaEventos?.eventos || [];

      const listaCategorias =
        Array.isArray(respuestaCategorias)
          ? respuestaCategorias
          : respuestaCategorias?.categorias || [];

      setEventos(listaEventos);
      setCategorias(listaCategorias);
    } catch (err) {
      setError(
        err?.message ||
        "No pudimos cargar los eventos."
      );
    } finally {
      setCargando(false);
    }
  }

  // Búsqueda, filtrado y ordenamiento local
  const eventosFiltrados = useMemo(() => {
    let resultado = [...eventos];

    // Búsqueda textual
    if (busqueda.trim()) {
      const texto = busqueda.toLowerCase().trim();

      resultado = resultado.filter((evento) => {
        const contenido = [
          evento.titulo,
          evento.nombre,
          evento.descripcion,
          evento.lugar,
          evento.ubicacion,
          evento.categoria?.nombre,
          evento.categoriaNombre,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return contenido.includes(texto);
      });
    }

    // Filtro por categoría
    if (categoriaSeleccionada !== null) {
      resultado = resultado.filter((evento) => {
        const idCategoria =
          evento.categoriaId ??
          evento.categoria?.id ??
          evento.categoria?.nombre ??
          evento.categoriaNombre;

        return String(idCategoria) === String(categoriaSeleccionada);
      });
    }

    // Ordenamiento
    resultado.sort((a, b) => {
      switch (orden) {
        case "precioAsc":
          return obtenerPrecio(a) - obtenerPrecio(b);

        case "precioDesc":
          return obtenerPrecio(b) - obtenerPrecio(a);

        case "fechaAsc":
          return new Date(a.fecha) - new Date(b.fecha);

        case "puntajeDesc":
          return obtenerPuntaje(b) - obtenerPuntaje(a);

        default:
          return 0;
      }
    });

    return resultado;
  }, [eventos, busqueda, categoriaSeleccionada, orden]);

  function obtenerPrecio(evento) {
    const tipos = evento.tiposEntrada || evento.tiposEntradas || [];

    if (tipos.length > 0) {
      return Math.min(
        ...tipos.map((tipo) => Number(tipo.precio) || 0)
      );
    }

    return Number(evento.precio) || 0;
  }

  function obtenerPuntaje(evento) {
    return Number(
      evento.puntajePromedio ??
      evento.promedioPuntaje ??
      evento.puntaje ??
      evento.calificacion ??
      0
    );
  }

  function nombreCategoria(categoria) {
    return categoria.nombre || categoria.titulo || "Categoría";
  }

  return (
    <ScrollView
      contentContainerStyle={s.scroll}
      showsVerticalScrollIndicator={false}
    >
      {/* Presentación */}
      <View style={s.hero}>
        <Text style={[s.eyebrow, { color: C.primary }]}>
          TU PRÓXIMO PLAN ESTÁ ACÁ
        </Text>

        <Text style={[s.h1, { color: C.text }]}>
          Encontrá algo{"\n"}
          que te{" "}
          <Text style={{ color: C.primary }}>
            entusiasme.
          </Text>
        </Text>

        <Text style={[s.sub, { color: C.muted }]}>
          Experiencias, encuentros y momentos para vivir.
        </Text>

        {/* Buscador */}
        <View
          style={[
            s.search,
            {
              backgroundColor: C.surface,
              borderColor: C.border,
            },
          ]}
        >
          <Text style={{ fontSize: 20, color: C.muted }}>
            ⌕
          </Text>

          <TextInput
            value={busqueda}
            onChangeText={setBusqueda}
            placeholder="¿Qué estás buscando?"
            placeholderTextColor={C.muted}
            style={[s.input, { color: C.text }]}
          />
        </View>
      </View>

      {/* Categorías */}
      <SectionTitle title="Descubrí por categoría" />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.categories}
      >
        <Pressable
          onPress={() => setCategoriaSeleccionada(null)}
          style={[
            s.chip,
            {
              backgroundColor:
                categoriaSeleccionada === null
                  ? C.primary
                  : C.surface,
              borderColor: C.border,
            },
          ]}
        >
          <Text
            style={{
              color:
                categoriaSeleccionada === null
                  ? C.primaryText
                  : C.text,
              fontWeight: "600",
            }}
          >
            Todas
          </Text>
        </Pressable>

        {categorias.map((categoria) => {
          const id = categoria.id;
          const activa =
            String(categoriaSeleccionada) === String(id);

          return (
            <Pressable
              key={id}
              onPress={() => setCategoriaSeleccionada(id)}
              style={[
                s.chip,
                {
                  backgroundColor: activa
                    ? C.primary
                    : C.surface,
                  borderColor: C.border,
                },
              ]}
            >
              <Text
                style={{
                  color: activa ? C.primaryText : C.text,
                  fontWeight: "600",
                }}
              >
                {nombreCategoria(categoria)}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Banner */}
      <View style={[s.feature, { backgroundColor: C.surface2 }]}>
        <View style={{ flex: 1 }}>
          <Text style={[s.eyebrow, { color: C.text }]}>
            HECHOS PARA DESCUBRIR
          </Text>

          <Text style={[s.featureTitle, { color: C.text }]}>
            No te quedes{"\n"}
            con las ganas.
          </Text>

          <Text style={{ color: C.text, marginTop: 7 }}>
            Encontrá tu próxima experiencia.
          </Text>
        </View>

        <Ticketito size={92} />
      </View>

      {/* Catálogo */}
      <SectionTitle title="Eventos disponibles" />

      {/* Ordenamiento */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.sortOptions}
      >
        {ordenamientos.map((opcion) => {
          const activa = orden === opcion.value;

          return (
            <Pressable
              key={opcion.value}
              onPress={() => setOrden(opcion.value)}
              style={[
                s.sortChip,
                {
                  backgroundColor: activa
                    ? C.surface2
                    : C.surface,
                  borderColor: C.border,
                },
              ]}
            >
              <Text
                style={{
                  color: C.text,
                  fontWeight: activa ? "700" : "500",
                  fontSize: 12,
                }}
              >
                {opcion.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Cargando */}
      {cargando && (
        <View style={s.feedback}>
          <ActivityIndicator color={C.primary} size="large" />

          <Text style={{ color: C.muted, marginTop: 12 }}>
            Buscando eventos...
          </Text>
        </View>
      )}

      {/* Error */}
      {!cargando && error !== "" && (
        <View style={s.feedback}>
          <Ticketito size={80} />

          <Text style={[s.feedbackTitle, { color: C.text }]}>
            No pudimos cargar los eventos
          </Text>

          <Text
            style={{
              color: C.muted,
              textAlign: "center",
            }}
          >
            {error}
          </Text>

          <Pressable
            onPress={cargarDatos}
            style={[
              s.retry,
              { backgroundColor: C.primary },
            ]}
          >
            <Text style={{ color: C.primaryText, fontWeight: "700" }}>
              Reintentar
            </Text>
          </Pressable>
        </View>
      )}

      {/* Eventos */}
      {!cargando && !error && eventosFiltrados.length > 0 && (
        <View>
          {eventosFiltrados.map((e) => (
            <EventCard
                key={e.id}
                event={e}
                onPress={onEventPress}
            />
          ))}
        </View>
      )}

      {/* Sin resultados */}
      {!cargando && !error && eventosFiltrados.length === 0 && (
        <View style={s.feedback}>
          <Ticketito size={90} />

          <Text style={[s.feedbackTitle, { color: C.text }]}>
            No encontramos eventos
          </Text>

          <Text
            style={{
              color: C.muted,
              textAlign: "center",
            }}
          >
            Probá con otra búsqueda o categoría.
          </Text>

          <Pressable
            onPress={() => {
              setBusqueda("");
              setCategoriaSeleccionada(null);
              setOrden("relevancia");
            }}
            style={[
              s.retry,
              { backgroundColor: C.primary },
            ]}
          >
            <Text style={{ color: C.primaryText, fontWeight: "700" }}>
              Limpiar filtros
            </Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 25,
  },

  hero: {
    paddingTop: 23,
    paddingBottom: 12,
  },

  eyebrow: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.3,
  },

  h1: {
    fontSize: 35,
    fontWeight: "900",
    lineHeight: 41,
    letterSpacing: -1.3,
    marginTop: 8,
  },

  sub: {
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
  },

  search: {
    height: 50,
    borderWidth: 1,
    borderRadius: 15,
    marginTop: 20,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  input: {
    flex: 1,
    fontSize: 15,
  },

  categories: {
    gap: 9,
    paddingBottom: 5,
  },

  chip: {
    borderWidth: 1,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 22,
  },

  feature: {
    marginTop: 23,
    padding: 18,
    borderRadius: 22,
    flexDirection: "row",
    alignItems: "center",
  },

  featureTitle: {
    fontSize: 24,
    fontWeight: "900",
    marginTop: 8,
    lineHeight: 27,
  },

  sortOptions: {
    gap: 8,
    paddingVertical: 8,
  },

  sortChip: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },

  feedback: {
    paddingVertical: 35,
    alignItems: "center",
    gap: 10,
  },

  feedbackTitle: {
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
  },

  retry: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 10,
  },
});
