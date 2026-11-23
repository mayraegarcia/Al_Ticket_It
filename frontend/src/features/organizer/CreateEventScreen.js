
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  Pressable,
  Alert,
  ActivityIndicator,
  Modal
} from "react-native";

import { useTheme } from "../../theme/ThemeContext";
import { eventoService } from "../../service/eventoService";
import { categoriaService } from "../../service/categoriaService";
import { mensajeDeError } from "../../service/api";
import ConfirmacionModal from "../../components/ui/ConfirmacionModal";

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

    const [categorias, setCategorias] = useState([]);
    const [cargandoCategorias, setCargandoCategorias] = useState(true);

    const [selectorCategoriasVisible, setSelectorCategoriasVisible] = useState(false);

    useEffect(() => {
    const cargarCategorias = async () => {
        try {
        setCargandoCategorias(true);

        const resultado = await categoriaService.obtenerTodas();

        setCategorias(Array.isArray(resultado) ? resultado : []);
        } catch (error) {
          mostrarMensaje({
            titulo: "Error",
            mensaje: "No se pudieron cargar las categorías.",
            tipo: "error",
          });
        }finally {
        setCargandoCategorias(false);
        }
    };

    cargarCategorias();
    }, []);

    const mostrarMensaje = ({
      titulo,
      mensaje,
      tipo = "error",
      textoBoton = "Aceptar",
    }) => {
      setModalConfig({
        titulo,
        mensaje,
        tipo,
        textoBoton,
        mostrarCancelar: false,
      });

      setModalVisible(true);
    };

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
      anio < new Date().getFullYear() ||
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

  const confirmarCreacion = async () => {
    try {
      setModalVisible(false);
      setGuardando(true);

      const fechaEvento = convertirFecha();

      if (!fechaEvento) {
        mostrarMensaje({
          titulo: "Fecha inválida",
          mensaje: "Revisá la fecha y la hora del evento.",
          tipo: "error",
        });
        return;
      }

      const nuevoEvento = {
        nombre: titulo.trim(),
        descripcion: descripcion.trim(),
        categoriaId: Number(categoriaId),
        fecha: fechaEvento.toISOString(),
      };

      const eventoCreado = await eventoService.crear(nuevoEvento);

      setEventoPendiente(eventoCreado);

      setModalConfig({
        titulo: "¡Evento creado!",
        mensaje:
          "Tu evento se creó correctamente. Ahora podés configurar sus tipos de entrada.",
        tipo: "success",
        textoBoton: "Continuar",
        mostrarCancelar: false,
      });

      setModalVisible(true);
    } catch (error) {
      mostrarMensaje({
        titulo: "Error",
        mensaje: mensajeDeError(error),
        tipo: "error",
      });
    } finally {
      setGuardando(false);
    }
  };

  const guardarEvento = () => {
    if (
      !titulo.trim() ||
      !descripcion.trim() ||
      !categoriaId ||
      !fecha.trim() ||
      !hora.trim()
    ) {
      mostrarMensaje({
        titulo: "Datos incompletos",
        mensaje: "Completá todos los campos antes de continuar.",
        tipo: "warning",
      });
      return;
    }

    const fechaEvento = convertirFecha();

    if (!fechaEvento) {
      mostrarMensaje({
        titulo: "Fecha u hora inválida",
        mensaje:
          "Ingresá una fecha válida y una hora válida. Revisá que la fecha tenga formato DD/MM/AAAA y la hora HH:MM.",
        tipo: "error",
      });
      return;
    }

    if (fechaEvento <= new Date()) {
      mostrarMensaje({
        titulo: "Fecha inválida",
        mensaje: "El evento debe tener una fecha futura.",
        tipo: "warning",
      });
      return;
    }

    setModalConfig({
      titulo: "¿Crear evento?",
      mensaje:
        "¿Estás seguro de que querés crear este evento? Se guardará como borrador y después podrás configurar sus entradas.",
      tipo: "warning",
      textoBoton: "Confirmar",
      mostrarCancelar: true,
    });

    setModalVisible(true);
  };

  const formatearFecha = (texto) => {
    const numeros = texto.replace(/\D/g, "").slice(0, 8);

    if (numeros.length <= 2) {
      return numeros;
    }

    if (numeros.length <= 4) {
      return `${numeros.slice(0, 2)}/${numeros.slice(2)}`;
    }

    return `${numeros.slice(0, 2)}/${numeros.slice(2, 4)}/${numeros.slice(4)}`;
  };

  const formatearHora = (texto) => {
    const numeros = texto.replace(/\D/g, "").slice(0, 4);

    if (numeros.length <= 2) {
      return numeros;
    }

    return `${numeros.slice(0, 2)}:${numeros.slice(2)}`;
  };


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
    <View style={{ flex: 1, backgroundColor: C.bg }}>
        <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        >
        <View style={styles.encabezado}>
          <Text style={[styles.title, { color: C.text }]}>
            Crear evento
          </Text>

          <Text style={[styles.subtitle, { color: C.muted }]}>
            Organizá tu próximo evento. Completá los datos
            principales para comenzar.
          </Text>
        </View>

        <View
          style={[
            styles.formulario,
            {
              backgroundColor: C.surface,
              borderColor: C.border,
            },
          ]}
        >

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

        <View style={styles.field}>
            <Text style={[styles.label, { color: C.text }]}>
            Categoría
            </Text>

            <Pressable
            onPress={() => setSelectorCategoriasVisible(true)}
            disabled={cargandoCategorias || guardando}
            style={[
                styles.input,
                {
                backgroundColor: C.card,
                borderColor: C.border || C.muted,
                height: 48,
                justifyContent: "center",
                },
            ]}
            >
            <Text style={{ color: categoriaId ? C.text : C.muted }}>
                {cargandoCategorias
                ? "Cargando categorías..."
                : categorias.find(
                    c => Number(c.id) === Number(categoriaId)
                    )?.nombre || "Seleccioná una categoría"}
            </Text>
            </Pressable>
        </View>

        {campo(
          "Fecha del evento",
          fecha,
          (texto) => setFecha(formatearFecha(texto)),
          "DD/MM/AAAA",
          { keyboardType: "numeric" }
        )}

        {campo(
          "Hora del evento",
          hora,
          (texto) => setHora(formatearHora(texto)),
          "HH:MM",
          { keyboardType: "numeric" }
        )}

        </View>

       <View
        style={[
          styles.notice,
          {
            backgroundColor: C.card,
            borderColor: C.border,
          },
        ]}
      >
        <Text style={styles.noticeIcono}>ℹ</Text>

        <View style={{ flex: 1 }}>
          <Text style={[styles.noticeTitulo, { color: C.text }]}>
            Tu evento comenzará como borrador
          </Text>

          <Text style={[styles.noticeText, { color: C.muted }]}>
            Luego podrás configurar los tipos de entrada,
            precios y publicar tu evento.
          </Text>
        </View>
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

        {/* Selector de categorías */}
        <Modal
        visible={selectorCategoriasVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectorCategoriasVisible(false)}
        >
        <View style={styles.overlay}>
            <View style={[styles.listaCategorias, { backgroundColor: C.surface }]}>
            <Text style={[styles.title, { color: C.text, marginBottom: 15 }]}>
                Seleccionar categoría
            </Text>

            {cargandoCategorias ? (
                <ActivityIndicator color={C.primary} />
            ) : categorias.length === 0 ? (
                <Text style={{ color: C.muted }}>
                No hay categorías disponibles.
                </Text>
            ) : (
                categorias.map(categoria => (
                <Pressable
                    key={categoria.id}
                    onPress={() => {
                    setCategoriaId(String(categoria.id));
                    setSelectorCategoriasVisible(false);
                    }}
                    style={styles.opcionCategoria}
                >
                    <View>
                    <Text style={{ color: C.text, fontWeight: "700" }}>
                        {categoria.nombre}
                    </Text>

                    <Text style={{ color: C.muted, fontSize: 12 }}>
                        {categoria.descripcion}
                    </Text>
                    </View>

                    {Number(categoriaId) === Number(categoria.id) && (
                    <Text style={{ color: C.primary }}>✓</Text>
                    )}
                </Pressable>
                ))
            )}

            <Pressable
                onPress={() => setSelectorCategoriasVisible(false)}
                style={{ alignItems: "center", paddingTop: 15 }}
            >
                <Text style={{ color: C.primary, fontWeight: "700" }}>
                Cerrar
                </Text>
            </Pressable>
            </View>
        </View>
        </Modal>

        {/* Confirmación de creación */}
        <ConfirmacionModal
          visible={modalVisible}
          titulo={modalConfig.titulo}
          mensaje={modalConfig.mensaje}
          tipo={modalConfig.tipo}
          textoBoton={modalConfig.textoBoton}
          mostrarCancelar={modalConfig.mostrarCancelar}
          textoCancelar="Cancelar"
          onCancelar={() => setModalVisible(false)}
          onAceptar={() => {
            if (modalConfig.mostrarCancelar) {
              confirmarCreacion();
            } else if (eventoPendiente) {
              setModalVisible(false);
              onCreated?.(eventoPendiente);
              setEventoPendiente(null);
            } else {
              setModalVisible(false);
            }
          }}
        />
    </View>
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
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    },
    listaCategorias: {
    width: "100%",
    maxWidth: 400,
    borderRadius: 20,
    padding: 20,
    },
    opcionCategoria: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#88888855",
    },

    encabezado: {
  marginBottom: 24,
  marginTop: 10,
},

formulario: {
  borderWidth: 1,
  borderRadius: 22,
  padding: 18,
  gap: 4,
  marginBottom: 20,
},

notice: {
  flexDirection: "row",
  alignItems: "flex-start",
  gap: 12,
  padding: 16,
  borderRadius: 18,
  borderWidth: 1,
  marginBottom: 20,
},

noticeIcono: {
  fontSize: 20,
  fontWeight: "800",
},

noticeTitulo: {
  fontSize: 14,
  fontWeight: "800",
  marginBottom: 6,
},

noticeText: {
  fontSize: 13,
  lineHeight: 20,
},

field: {
  marginBottom: 16,
},

label: {
  fontSize: 14,
  fontWeight: "700",
  marginBottom: 8,
},

input: {
  borderWidth: 1,
  borderRadius: 14,
  paddingHorizontal: 14,
  fontSize: 15,
},

title: {
  fontSize: 28,
  fontWeight: "900",
  marginBottom: 8,
},

subtitle: {
  fontSize: 15,
  lineHeight: 22,
},

container: {
  padding: 22,
  paddingBottom: 40,
},

button: {
  minHeight: 54,
  borderRadius: 16,
  justifyContent: "center",
  alignItems: "center",
  marginTop: 4,
},

buttonText: {
  color: "#FFFFFF",
  fontSize: 16,
  fontWeight: "800",
},
});



