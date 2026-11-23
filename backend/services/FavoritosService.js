import { FavoritosRepository } from "../repositories/FavoritosRepository.js";
import { EventoRepository } from "../repositories/EventoRepository.js";
import { UsuarioRepository } from "../repositories/UsuarioRepository.js";
import { Favorito } from "../domain/Favorito.js";
import { RolUsuario } from "../domain/RolUsuario.js";

export class FavoritosService {
  constructor() {
    this.favoritosRepository = new FavoritosRepository();
    this.eventoRepository = new EventoRepository();
    this.usuarioRepository = new UsuarioRepository();
  }

  obtenerPorComprador(compradorId) {
    const comprador = this.usuarioRepository.obtenerPorId(compradorId);

    if (!comprador) {
      throw new Error("Comprador no encontrado");
    }

    if (!comprador.roles.includes(RolUsuario.COMPRADOR)) {
      throw new Error("El usuario no tiene rol de comprador");
    }

    const favoritos =
      this.favoritosRepository.buscarPorComprador(compradorId);

    return favoritos.map(favorito => {
      const evento = this.eventoRepository.obtenerPorId(
        favorito.eventoId
      );

      return {
        ...favorito,
        evento,
      };
    });
  }

  agregar(compradorId, eventoId) {
    const comprador = this.usuarioRepository.obtenerPorId(compradorId);

    if (!comprador) {
      throw new Error("Comprador no encontrado");
    }

    if (!comprador.roles.includes(RolUsuario.COMPRADOR)) {
      throw new Error("El usuario no tiene rol de comprador");
    }

    const evento = this.eventoRepository.obtenerPorId(eventoId);

    if (!evento) {
      throw new Error("Evento no encontrado");
    }

    const existente =
      this.favoritosRepository.buscarPorCompradorYEvento(
        compradorId,
        eventoId
      );

    if (existente) {
      throw new Error("El evento ya está en favoritos");
    }

    const favoritos = this.favoritosRepository.obtenerTodos();

    const nuevoId =
      favoritos.length === 0
        ? 1
        : Math.max(...favoritos.map(favorito => favorito.id)) + 1;

    const favorito = new Favorito({
      id: nuevoId,
      compradorId: comprador.id,
      eventoId: evento.id,
      fecha: new Date(),
    });

    return this.favoritosRepository.guardar(favorito);
  }

  eliminar(compradorId, eventoId) {
    const comprador = this.usuarioRepository.obtenerPorId(compradorId);

    if (!comprador) {
      throw new Error("Comprador no encontrado");
    }

    if (!comprador.roles.includes(RolUsuario.COMPRADOR)) {
      throw new Error("El usuario no tiene rol de comprador");
    }

    const evento = this.eventoRepository.obtenerPorId(eventoId);

    if (!evento) {
      throw new Error("Evento no encontrado");
    }

    const eliminado =
      this.favoritosRepository.eliminarPorCompradorYEvento(
        compradorId,
        eventoId
      );

    if (!eliminado) {
      throw new Error("El evento no está en favoritos");
    }

    return eliminado;
  }
}