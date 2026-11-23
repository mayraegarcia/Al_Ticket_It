
import { ResenaRepository } from "../repositories/ReseñaRepository.js";
import { CompraRepository } from "../repositories/CompraRepository.js";
import { EventoRepository } from "../repositories/EventoRepository.js";
import { UsuarioRepository } from "../repositories/UsuarioRepository.js";
import { Resena } from "../domain/Reseña.js";
import { EstadoCompra } from "../domain/EstadoCompra.js";

export class ResenaService {
  constructor() {
    this.resenaRepository = new ResenaRepository();
    this.compraRepository = new CompraRepository();
    this.eventoRepository = new EventoRepository();
    this.usuarioRepository = new UsuarioRepository();
  }

  obtenerPorEvento(eventoId) {
    const evento = this.eventoRepository.obtenerPorId(eventoId);

    if (!evento) {
      throw new Error("Evento no encontrado");
    }

    return this.resenaRepository.buscarPorEvento(eventoId);
  }

  obtenerPorComprador(compradorId) {
    const comprador = this.usuarioRepository.obtenerPorId(compradorId);

    if (!comprador) {
      throw new Error("Comprador no encontrado");
    }

    return this.resenaRepository.buscarPorComprador(compradorId);
  }

  crear(compradorId, datos) {
    const comprador = this.usuarioRepository.obtenerPorId(compradorId);

    if (!comprador) {
      throw new Error("Comprador no encontrado");
    }

    if (!comprador.roles.includes(RolUsuario.COMPRADOR)) {
      throw new Error("El usuario no tiene rol de comprador");
    }

    const eventoId = Number(datos.eventoId);

    const evento = this.eventoRepository.obtenerPorId(eventoId);

    if (!evento) {
      throw new Error("Evento no encontrado");
    }

    if (
      !Number.isInteger(datos.puntuacion) ||
      datos.puntuacion < 1 ||
      datos.puntuacion > 5
    ) {
      throw new Error("La puntuación debe ser un entero entre 1 y 5");
    }

    if (!datos.detalle || !datos.detalle.trim()) {
      throw new Error("El comentario es obligatorio");
    }

    const compras = this.compraRepository.buscarPorCompradorYEvento(
      compradorId,
      eventoId
    );

    const tieneCompraUtilizada = compras.some(
      compra => compra.estado === EstadoCompra.UTILIZADA
    );

    if (!tieneCompraUtilizada) {
      throw new Error(
        "Solo se puede reseñar un evento con una compra utilizada"
      );
    }

    const resenaExistente =
      this.resenaRepository.buscarPorCompradorYEvento(
        compradorId,
        eventoId
      );

    if (resenaExistente) {
      throw new Error("El comprador ya reseñó este evento");
    }

    const resenasExistentes = this.resenaRepository.obtenerTodos();

    const nuevoId =
      resenasExistentes.length === 0
        ? 1
        : Math.max(...resenasExistentes.map(resena => resena.id)) + 1;

    const resena = new Resena({
      id: nuevoId,
      compradorId: comprador.id,
      eventoId: evento.id,
      detalle: datos.detalle.trim(),
      puntuacion: datos.puntuacion,
      fecha: new Date()
    });

    this.resenaRepository.guardar(resena);

    return resena;
  }

  obtenerPuntuacionPromedio(eventoId) {
    const evento = this.eventoRepository.obtenerPorId(eventoId);

    if (!evento) {
      throw new Error("Evento no encontrado");
    }

    return this.resenaRepository.obtenerPuntuacionPromedio(eventoId);
  }

  obtenerPuntuacionPromedioPorOrganizador(organizadorId) {
    const eventos = this.eventoRepository.buscarPorOrganizador(
      organizadorId
    );

    const resenas = eventos.flatMap(evento =>
      this.resenaRepository.buscarPorEvento(evento.id)
    );

    if (resenas.length === 0) {
      return 0;
    }

    const suma = resenas.reduce(
      (acumulado, resena) => acumulado + resena.puntuacion,
      0
    );

    return suma / resenas.length;
  }
}
