
import bcrypt from "bcrypt";

import { usuarios, categorias, eventos, compras, resenas} from "./datosIniciales.js";

import { Usuario } from "../domain/Usuario.js";
import { RolUsuario } from "../domain/RolUsuario.js";
import { Categoria } from "../domain/Categoria.js";
import { Evento } from "../domain/Evento.js";
import { TipoEntrada } from "../domain/TipoEntrada.js";
import { EstadoEvento } from "../domain/EstadoEvento.js";
import { Compra } from "../domain/Compra.js";
import { DetalleCompra } from "../domain/DetalleCompra.js";
import { EstadoCompra } from "../domain/EstadoCompra.js";
import { Resena } from "../domain/Reseña.js";

export async function cargarDatosIniciales() {
  // Evitamos cargar nuevamente los datos si ya existen.
  if (
    usuarios.length > 0 ||
    categorias.length > 0 ||
    eventos.length > 0 ||
    compras.length > 0
  ) {
    if (resenas.length === 0) {
      resenas.push(
        new Resena({
          id: 1,
          compradorId: 1,
          eventoId: 2,
          puntuacion: 5,
          detalle: "Excelente experiencia, el teatro estuvo increíble.",
          fecha: new Date(),
        })
      );
    }

    return;
  }

  // Fechas dinámicas para poder realizar la demostración en cualquier momento.
  const fechaEnDias = (dias, hora = "20:00:00") => {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() + dias);

    const [horas, minutos, segundos] = hora.split(":");
    fecha.setHours(Number(horas), Number(minutos), Number(segundos), 0);

    return fecha;
  };

  const passwordHash = await bcrypt.hash("123456", 10);

  // ==============================
  // USUARIOS
  // ==============================

  usuarios.push(
    new Usuario({
      id: 1,
      nombre: "Lucia",
      apellido: "Gomez",
      email: "lucia@gmail.com",
      passwordHash,
      roles: [RolUsuario.COMPRADOR],
      favoritos: [1, 3],
    }),

    new Usuario({
      id: 2,
      nombre: "Martin",
      apellido: "Perez",
      email: "martin@gmail.com",
      passwordHash,
      roles: [RolUsuario.ORGANIZADOR],
      favoritos: [],
    }),

    new Usuario({
      id: 3,
      nombre: "Sofia",
      apellido: "Rodriguez",
      email: "sofia@gmail.com",
      passwordHash,
      roles: [RolUsuario.COMPRADOR, RolUsuario.ORGANIZADOR],
      favoritos: [2, 5],
    }),

    new Usuario({
      id: 4,
      nombre: "Juan",
      apellido: "Lopez",
      email: "juan@gmail.com",
      passwordHash,
      roles: [RolUsuario.COMPRADOR],
      favoritos: [1],
    }),

    new Usuario({
      id: 5,
      nombre: "Ana",
      apellido: "Martinez",
      email: "ana@gmail.com",
      passwordHash,
      roles: [RolUsuario.ORGANIZADOR],
      favoritos: [],
    })
  );

  // ==============================
  // CATEGORIAS
  // ==============================

  categorias.push(
    new Categoria({
      id: 1,
      nombre: "Musica",
      descripcion: "Eventos y recitales musicales",
    }),

    new Categoria({
      id: 2,
      nombre: "Teatro",
      descripcion: "Obras y espectaculos teatrales",
    }),

    new Categoria({
      id: 3,
      nombre: "Deportes",
      descripcion: "Eventos deportivos",
    }),

    new Categoria({
      id: 4,
      nombre: "Conferencias",
      descripcion: "Charlas y encuentros",
    }),

    new Categoria({
      id: 5,
      nombre: "Festivales",
      descripcion: "Festivales y eventos multitudinarios",
    })
  );

  // ==============================
  // EVENTOS
  // ==============================

  eventos.push(
    new Evento({
      id: 1,
      nombre: "Rock en Buenos Aires",
      descripcion: "Una noche de rock con bandas nacionales.",
      categoriaId: 1,
      fecha: fechaEnDias(5, "20:00:00"),
      lugar: "Movistar Arena, Buenos Aires",
      tiposEntrada: [
        new TipoEntrada({
          id: 1,
          nombre: "General",
          descripcion: "Entrada general",
          precio: 15000,
          cupoTotal: 500,
          cupoDisponible: 497,
        }),

        new TipoEntrada({
          id: 2,
          nombre: "VIP",
          descripcion: "Acceso VIP",
          precio: 30000,
          cupoTotal: 100,
          cupoDisponible: 99,
        }),
      ],
      multimedia: [],
      organizadorId: 2,
      estado: EstadoEvento.PUBLICADO,
    }),

    new Evento({
      id: 2,
      nombre: "Teatro de verano",
      descripcion: "Una obra teatral para disfrutar en familia.",
      categoriaId: 2,
      fecha: fechaEnDias(-10, "21:00:00"),
      lugar: "Teatro Gran Rex, Buenos Aires",
      tiposEntrada: [
        new TipoEntrada({
          id: 3,
          nombre: "Platea",
          descripcion: "Ubicacion en platea",
          precio: 12000,
          cupoTotal: 200,
          cupoDisponible: 196,
        }),
      ],
      multimedia: [],
      organizadorId: 3,
      estado: EstadoEvento.PUBLICADO,
    }),

    new Evento({
      id: 3,
      nombre: "Maraton de Buenos Aires",
      descripcion: "Una jornada deportiva para todos.",
      categoriaId: 3,
      fecha: fechaEnDias(20, "08:00:00"),
      lugar: "Obelisco, Buenos Aires",
      tiposEntrada: [
        new TipoEntrada({
          id: 4,
          nombre: "General",
          descripcion: "Inscripcion general",
          precio: 8000,
          cupoTotal: 1000,
          cupoDisponible: 998,
        }),
      ],
      multimedia: [],
      organizadorId: 5,
      estado: EstadoEvento.PUBLICADO,
    }),

    new Evento({
      id: 4,
      nombre: "Tecnologia y futuro",
      descripcion: "Conferencia sobre tecnologia e innovacion.",
      categoriaId: 4,
      fecha: fechaEnDias(-5, "18:00:00"),
      lugar: "Centro Cultural Kirchner, Buenos Aires",
      tiposEntrada: [
        new TipoEntrada({
          id: 5,
          nombre: "General",
          descripcion: "Acceso a la conferencia",
          precio: 10000,
          cupoTotal: 300,
          cupoDisponible: 298,
        }),
      ],
      multimedia: [],
      organizadorId: 5,
      estado: EstadoEvento.PUBLICADO,
    }),

    new Evento({
      id: 5,
      nombre: "Festival de bandas",
      descripcion: "Festival con diferentes bandas en vivo.",
      categoriaId: 5,
      fecha: fechaEnDias(45, "16:00:00"),
      lugar: "Tecnopolis, Buenos Aires",
      tiposEntrada: [
        new TipoEntrada({
          id: 6,
          nombre: "Preventa",
          descripcion: "Entrada promocional anticipada",
          precio: 20000,
          cupoTotal: 800,
          cupoDisponible: 798,
        }),

        new TipoEntrada({
          id: 7,
          nombre: "VIP",
          descripcion: "Acceso premium",
          precio: 40000,
          cupoTotal: 150,
          cupoDisponible: 150,
        }),
      ],
      multimedia: [],
      organizadorId: 2,
      estado: EstadoEvento.PUBLICADO,
    }),

    new Evento({
      id: 6,
      nombre: "Noche de jazz",
      descripcion: "Una noche especial de jazz en vivo.",
      categoriaId: 1,
      fecha: fechaEnDias(60, "21:30:00"),
      lugar: "Usina del Arte, Buenos Aires",
      tiposEntrada: [
        new TipoEntrada({
          id: 8,
          nombre: "General",
          descripcion: "Entrada al show",
          precio: 10000,
          cupoTotal: 80,
          cupoDisponible: 75,
        }),

        new TipoEntrada({
          id: 9,
          nombre: "Platea",
          descripcion: "Ubicacion preferencial",
          precio: 18000,
          cupoTotal: 30,
          cupoDisponible: 28,
        }),
      ],
      multimedia: [],
      organizadorId: 5,
      estado: EstadoEvento.PUBLICADO,
    })
  );

  // ==============================
  // COMPRAS DE PRUEBA
  // ==============================

  compras.push(
    // Lucía: compra confirmada para el evento próximo.
    new Compra({
      id: 1,
      compradorId: 1,
      eventoId: 1,
      fecha: fechaEnDias(-2, "12:00:00"),
      estado: EstadoCompra.CONFIRMADA,
      detalles: [
        new DetalleCompra({
          tipoEntradaId: 1,
          cantidad: 2,
          precioUnitario: 15000,
          subtotal: 30000,
        }),
      ],
      total: 30000,
    }),

    // Lucía: compra pendiente.
    new Compra({
      id: 2,
      compradorId: 1,
      eventoId: 1,
      fecha: fechaEnDias(-1, "15:00:00"),
      estado: EstadoCompra.PENDIENTE,
      detalles: [
        new DetalleCompra({
          tipoEntradaId: 2,
          cantidad: 1,
          precioUnitario: 30000,
          subtotal: 30000,
        }),
      ],
      total: 30000,
    }),

    // Lucía: compra utilizada para poder calificar.
    new Compra({
      id: 3,
      compradorId: 1,
      eventoId: 2,
      fecha: fechaEnDias(-20, "12:00:00"),
      estado: EstadoCompra.UTILIZADA,
      detalles: [
        new DetalleCompra({
          tipoEntradaId: 3,
          cantidad: 2,
          precioUnitario: 12000,
          subtotal: 24000,
        }),
      ],
      total: 24000,
    }),

    // Juan: compra utilizada del mismo evento.
    new Compra({
      id: 4,
      compradorId: 4,
      eventoId: 2,
      fecha: fechaEnDias(-18, "14:00:00"),
      estado: EstadoCompra.UTILIZADA,
      detalles: [
        new DetalleCompra({
          tipoEntradaId: 3,
          cantidad: 2,
          precioUnitario: 12000,
          subtotal: 24000,
        }),
      ],
      total: 24000,
    }),

    // Lucía: compra utilizada de la conferencia.
    new Compra({
      id: 5,
      compradorId: 1,
      eventoId: 4,
      fecha: fechaEnDias(-12, "10:00:00"),
      estado: EstadoCompra.UTILIZADA,
      detalles: [
        new DetalleCompra({
          tipoEntradaId: 5,
          cantidad: 2,
          precioUnitario: 10000,
          subtotal: 20000,
        }),
      ],
      total: 20000,
    }),

    // Juan: compra confirmada de un evento próximo.
    new Compra({
      id: 6,
      compradorId: 4,
      eventoId: 3,
      fecha: fechaEnDias(-3, "11:00:00"),
      estado: EstadoCompra.CONFIRMADA,
      detalles: [
        new DetalleCompra({
          tipoEntradaId: 4,
          cantidad: 2,
          precioUnitario: 8000,
          subtotal: 16000,
        }),
      ],
      total: 16000,
    }),

    // Sofía: compra confirmada para el festival.
    new Compra({
      id: 7,
      compradorId: 3,
      eventoId: 5,
      fecha: fechaEnDias(-1, "16:00:00"),
      estado: EstadoCompra.CONFIRMADA,
      detalles: [
        new DetalleCompra({
          tipoEntradaId: 6,
          cantidad: 2,
          precioUnitario: 20000,
          subtotal: 40000,
        }),
      ],
      total: 40000,
    }),

    // Juan: compra cancelada.
    new Compra({
      id: 8,
      compradorId: 4,
      eventoId: 6,
      fecha: fechaEnDias(-2, "17:00:00"),
      estado: EstadoCompra.CANCELADA,
      detalles: [
        new DetalleCompra({
          tipoEntradaId: 8,
          cantidad: 2,
          precioUnitario: 10000,
          subtotal: 20000,
        }),
      ],
      total: 20000,
    })
  );

  // ==============================
  // RESEÑAS
  // ==============================

  resenas.push(
    new Resena({
      id: 1,
      compradorId: 1,
      eventoId: 2,
      puntuacion: 5,
      detalle: "Excelente experiencia, el teatro estuvo increíble.",
      fecha: fechaEnDias(-8),
    }),

    new Resena({
      id: 2,
      compradorId: 4,
      eventoId: 2,
      puntuacion: 4,
      detalle: "Muy lindo evento, disfruté mucho la obra.",
      fecha: fechaEnDias(-7),
    }),

    new Resena({
      id: 3,
      compradorId: 1,
      eventoId: 4,
      puntuacion: 5,
      detalle: "Muy interesante y bien organizado. Lo recomiendo.",
      fecha: fechaEnDias(-3),
    })
  );

  console.log("Datos iniciales cargados correctamente.");
}