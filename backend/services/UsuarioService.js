
import { UsuarioRepository } from "../repositories/UsuarioRepository.js";
import { EventoRepository } from "../repositories/EventoRepository.js";

export class UsuarioService {
  constructor() {
    this.usuarioRepository = new UsuarioRepository();
    this.eventoRepository = new EventoRepository();
  }

  obtenerTodos() {
    return this.usuarioRepository.obtenerTodos();
  }

  obtenerPorId(id) {
    const usuario = this.usuarioRepository.obtenerPorId(id);

    if (!usuario) {
      throw new Error("Usuario no encontrado");
    }

    return usuario;
  }

  agregarFavorito(usuarioId, eventoId) {
    const usuario = this.obtenerPorId(usuarioId);
    const evento = this.eventoRepository.obtenerPorId(eventoId);

    if (!evento) {
      throw new Error("Evento no encontrado");
    }

    if (usuario.favoritos.includes(Number(eventoId))) {
      throw new Error("El evento ya está en favoritos");
    }

    usuario.favoritos.push(Number(eventoId));

    return this.usuarioRepository.guardar(usuario);
  }

  quitarFavorito(usuarioId, eventoId) {
    const usuario = this.obtenerPorId(usuarioId);

    usuario.favoritos = usuario.favoritos.filter(
      id => id !== Number(eventoId)
    );

    return this.usuarioRepository.guardar(usuario);
  }

  obtenerFavoritos(usuarioId) {
    const usuario = this.obtenerPorId(usuarioId);

    return usuario.favoritos
      .map(eventoId => this.eventoRepository.obtenerPorId(eventoId))
      .filter(evento => evento !== undefined);
  }
}
