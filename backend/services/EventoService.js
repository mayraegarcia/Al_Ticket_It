
import { EventoRepository } from "../repositories/EventoRepository.js";
import { UsuarioRepository } from "../repositories/UsuarioRepository.js";
import { CategoriaRepository } from "../repositories/CategoriaRepository.js";

import { Evento } from "../domain/Evento.js";
import { EstadoEvento } from "../domain/EstadoEvento.js";
import { RolUsuario } from "../domain/RolUsuario.js";

import { ResenaService } from "./ReseñaService.js";

export class EventoService {
  constructor() {
    this.eventoRepository = new EventoRepository();
    this.usuarioRepository = new UsuarioRepository();
    this.categoriaRepository = new CategoriaRepository();
    this.resenaService = new ResenaService();
  }

  // ==============================
  // CONSULTAS
  // ==============================

  obtenerTodos() {
    return this.eventoRepository.buscarPorEstado(
      EstadoEvento.PUBLICADO
    );
  }

  obtenerPorId(id) {
    const evento = this.eventoRepository.obtenerPorId(id);

    if (!evento) {
      throw new Error("Evento no encontrado");
    }

    if (evento.estado !== EstadoEvento.PUBLICADO) {
      throw new Error("El evento no está publicado");
    }

    return evento;
  }

  buscar({ texto, categoriaId, orden } = {}) {
    const eventosEncontrados = this.eventoRepository.buscar({
      texto,
      categoriaId,
      estado: EstadoEvento.PUBLICADO
    });

    if (orden === "fecha") {
      return this.eventoRepository.ordenarPorFecha(eventosEncontrados);
    }

    if (orden === "precio") {
      return this.eventoRepository.ordenarPorPrecio(eventosEncontrados);
    }

    if (orden === "puntaje") {
      return eventosEncontrados
        .map(evento => ({
          evento,
          puntaje: this.resenaService.obtenerPuntuacionPromedioPorOrganizador(
            evento.organizadorId
          )
        }))
        .sort((a, b) => b.puntaje - a.puntaje)
        .map(resultado => resultado.evento);
    }

    return eventosEncontrados;
  }

  buscarPorOrganizador(organizadorId) {
    return this.eventoRepository.buscarPorOrganizador(organizadorId);
  }

  // ==============================
  // CREAR EVENTO
  // ==============================

  crear(organizadorId, datos) {
    const organizador = this.usuarioRepository.obtenerPorId(organizadorId);

    if (!organizador) {
      throw new Error("Organizador no encontrado");
    }

    if (!organizador.roles.includes(RolUsuario.ORGANIZADOR)) {
      throw new Error("El usuario no tiene rol de organizador");
    }

    const categoria = this.categoriaRepository.obtenerPorId(datos.categoriaId);

    if (!categoria) {
      throw new Error("Categoría no encontrada");
    }

    const eventos = this.eventoRepository.obtenerTodos();

    const nuevoId = eventos.length === 0
      ? 1
      : Math.max(...eventos.map(evento => evento.id)) + 1;

    const evento = new Evento({
      id: nuevoId,
      nombre: datos.nombre,
      descripcion: datos.descripcion,
      categoriaId: Number(datos.categoriaId),
      fecha: datos.fecha,
      tiposEntrada: [],
      multimedia: datos.multimedia || [],
      organizadorId: organizador.id,
      estado: EstadoEvento.BORRADOR
    });

    return this.eventoRepository.guardar(evento);
  }

  // ==============================
  // MODIFICAR EVENTO
  // ==============================

  modificar(eventoId, organizadorId, datos) {
    const evento = this.obtenerEventoExistente(eventoId);

    this.validarOrganizador(evento, organizadorId);

    if (evento.estado !== EstadoEvento.BORRADOR &&
        evento.estado !== EstadoEvento.PUBLICADO) {
      throw new Error("No se puede modificar este evento");
    }

    if (evento.estado === EstadoEvento.PUBLICADO &&
        new Date(evento.fecha) <= new Date()) {
      throw new Error("No se puede modificar un evento que ya comenzó");
    }

    if (datos.categoriaId !== undefined) {
      const categoria = this.categoriaRepository.obtenerPorId(datos.categoriaId);

      if (!categoria) {
        throw new Error("Categoría no encontrada");
      }

      evento.categoriaId = Number(datos.categoriaId);
    }

    if (datos.nombre !== undefined) {
      evento.nombre = datos.nombre;
    }

    if (datos.descripcion !== undefined) {
      evento.descripcion = datos.descripcion;
    }

    if (datos.fecha !== undefined) {
      evento.fecha = datos.fecha;
    }

    if (datos.multimedia !== undefined) {
      evento.multimedia = datos.multimedia;
    }

    return this.eventoRepository.guardar(evento);
  }

  // ==============================
  // PUBLICAR EVENTO
  // ==============================

  publicar(eventoId, organizadorId) {
    const evento = this.obtenerEventoExistente(eventoId);

    this.validarOrganizador(evento, organizadorId);

    if (evento.estado !== EstadoEvento.BORRADOR) {
      throw new Error("Solo se pueden publicar eventos en borrador");
    }

    if (!evento.nombre || evento.nombre.trim() === "") {
      throw new Error("El evento debe tener un nombre");
    }

    if (!evento.descripcion || evento.descripcion.trim() === "") {
      throw new Error("El evento debe tener una descripción");
    }

    if (new Date(evento.fecha) <= new Date()) {
      throw new Error("La fecha del evento debe ser futura");
    }

    if (evento.tiposEntrada.length === 0) {
      throw new Error("El evento debe tener al menos un tipo de entrada");
    }

    evento.estado = EstadoEvento.PUBLICADO;

    return this.eventoRepository.guardar(evento);
  }

  // ==============================
  // CANCELAR EVENTO
  // ==============================

  cancelar(eventoId, organizadorId) {
    const evento = this.obtenerEventoExistente(eventoId);

    this.validarOrganizador(evento, organizadorId);

    if (evento.estado !== EstadoEvento.PUBLICADO &&
        evento.estado !== EstadoEvento.BORRADOR) {
      throw new Error("No se puede cancelar este evento");
    }

    if (new Date(evento.fecha) <= new Date()) {
      throw new Error("No se puede cancelar un evento que ya comenzó");
    }

    evento.estado = EstadoEvento.CANCELADO;

    return this.eventoRepository.guardar(evento);
  }

  // ==============================
  // FINALIZAR EVENTO
  // ==============================

  finalizar(eventoId, organizadorId) {
    const evento = this.obtenerEventoExistente(eventoId);

    this.validarOrganizador(evento, organizadorId);

    if (evento.estado !== EstadoEvento.PUBLICADO) {
      throw new Error("Solo se pueden finalizar eventos publicados");
    }

    if (new Date(evento.fecha) > new Date()) {
      throw new Error("El evento todavía no ocurrió");
    }

    evento.estado = EstadoEvento.FINALIZADO;

    return this.eventoRepository.guardar(evento);
  }

  // ==============================
  // MÉTODOS AUXILIARES
  // ==============================

  obtenerEventoExistente(eventoId) {
    const evento = this.eventoRepository.obtenerPorId(eventoId);

    if (!evento) {
      throw new Error("Evento no encontrado");
    }

    return evento;
  }

  validarOrganizador(evento, organizadorId) {
    const organizador = this.usuarioRepository.obtenerPorId(organizadorId);

    if (!organizador) {
      throw new Error("Organizador no encontrado");
    }

    if (!organizador.roles.includes(RolUsuario.ORGANIZADOR)) {
      throw new Error("El usuario no tiene rol de organizador");
    }

    if (evento.organizadorId !== Number(organizadorId)) {
      throw new Error("El evento no pertenece a este organizador");
    }
  }
}
