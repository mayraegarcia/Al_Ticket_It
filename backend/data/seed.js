
import bcrypt from "bcrypt";

import { usuarios, categorias, eventos } from "./datosIniciales.js";

import { Usuario } from "../domain/Usuario.js";
import { RolUsuario } from "../domain/RolUsuario.js";
import { Categoria } from "../domain/Categoria.js";
import { Evento } from "../domain/Evento.js";
import { TipoEntrada } from "../domain/TipoEntrada.js";
import { EstadoEvento } from "../domain/EstadoEvento.js";

export async function cargarDatosIniciales() {
  if (usuarios.length > 0 || categorias.length > 0 || eventos.length > 0) {
    return;
  }

  // Usaremos la misma contraseña para todos los usuarios de prueba.
  const passwordHash = await bcrypt.hash("123456", 10);

  // USUARIOS
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
      favoritos: [2],
    }),

    new Usuario({
      id: 4,
      nombre: "Juan",
      apellido: "Lopez",
      email: "juan@gmail.com",
      passwordHash,
      roles: [RolUsuario.COMPRADOR],
      favoritos: [],
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

  // CATEGORIAS
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

  // EVENTOS
  eventos.push(
    new Evento({
      id: 1,
      nombre: "Rock en Buenos Aires",
      descripcion: "Una noche de rock con bandas nacionales.",
      categoriaId: 1,
      fecha: new Date("2027-03-15T20:00:00"),
      tiposEntrada: [
        new TipoEntrada({
          id: 1,
          nombre: "General",
          descripcion: "Entrada general",
          precio: 15000,
          cupoTotal: 500,
          cupoDisponible: 500,
        }),

        new TipoEntrada({
          id: 2,
          nombre: "VIP",
          descripcion: "Acceso VIP",
          precio: 30000,
          cupoTotal: 100,
          cupoDisponible: 100,
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
      fecha: new Date("2027-01-20T21:00:00"),
      tiposEntrada: [
        new TipoEntrada({
          id: 3,
          nombre: "Platea",
          descripcion: "Ubicacion en platea",
          precio: 12000,
          cupoTotal: 200,
          cupoDisponible: 200,
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
      fecha: new Date("2027-04-10T08:00:00"),
      tiposEntrada: [
        new TipoEntrada({
          id: 4,
          nombre: "Participante",
          descripcion: "Inscripcion general",
          precio: 8000,
          cupoTotal: 1000,
          cupoDisponible: 1000,
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
      fecha: new Date("2027-05-05T18:00:00"),
      tiposEntrada: [
        new TipoEntrada({
          id: 5,
          nombre: "General",
          descripcion: "Acceso a la conferencia",
          precio: 10000,
          cupoTotal: 300,
          cupoDisponible: 300,
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
      fecha: new Date("2027-06-12T16:00:00"),
      tiposEntrada: [
        new TipoEntrada({
          id: 6,
          nombre: "General",
          descripcion: "Acceso al festival",
          precio: 20000,
          cupoTotal: 800,
          cupoDisponible: 800,
        }),

        new TipoEntrada({
          id: 7,
          nombre: "Premium",
          descripcion: "Acceso premium",
          precio: 40000,
          cupoTotal: 150,
          cupoDisponible: 150,
        }),
      ],
      multimedia: [],
      organizadorId: 2,
      estado: EstadoEvento.PUBLICADO,
    })
  );

  console.log("Datos iniciales cargados correctamente.");
}