
import { MensajeRepository } from "../repositories/MensajeRepository.js";
import { CompraRepository } from "../repositories/CompraRepository.js";
import { EventoRepository } from "../repositories/EventoRepository.js";
import { UsuarioRepository } from "../repositories/UsuarioRepository.js";
import { Mensaje } from "../domain/Mensaje.js";

export class MensajeService {
  constructor() {
    this.mensajeRepository = new MensajeRepository();
    this.compraRepository = new CompraRepository();
    this.eventoRepository = new EventoRepository();
    this.usuarioRepository = new UsuarioRepository();
  }

  obtenerConversacion(compraId, usuarioId) {
    const compra = this.obtenerCompra(compraId);

    this.validarParticipante(compra, usuarioId);

    return this.mensajeRepository.buscarConversacionOrdenada(compraId);
  }

  enviar(compraId, emisorId, texto) {
    const compra = this.obtenerCompra(compraId);

    const emisor = this.usuarioRepository.obtenerPorId(emisorId);

    if (!emisor) {
      throw new Error("Usuario no encontrado");
    }

    const destinatarioId = this.validarParticipante(compra, emisorId);

    if (typeof texto !== "string" || texto.trim() === "") {
      throw new Error("El mensaje no puede estar vacío");
    }

    const mensajesExistentes = this.mensajeRepository.obtenerTodos();

    const nuevoId =
      mensajesExistentes.length === 0
        ? 1
        : Math.max(...mensajesExistentes.map(mensaje => mensaje.id)) + 1;

    const mensaje = new Mensaje({
      id: nuevoId,
      compraId: compra.id,
      emisorId: emisor.id,
      destinatarioId,
      mensaje: texto.trim(),
      enviado: new Date()
    });

    this.mensajeRepository.guardar(mensaje);

    return mensaje;
  }

  obtenerCompra(compraId) {
    const compra = this.compraRepository.obtenerPorId(compraId);

    if (!compra) {
      throw new Error("Compra no encontrada");
    }

    return compra;
  }

  validarParticipante(compra, usuarioId) {
    const evento = this.eventoRepository.obtenerPorId(compra.eventoId);

    if (!evento) {
      throw new Error("Evento no encontrado");
    }

    const id = Number(usuarioId);

    const esComprador = compra.compradorId === id;
    const esOrganizador = evento.organizadorId === id;

    if (!esComprador && !esOrganizador) {
      throw new Error(
        "El usuario no participa en esta compra"
      );
    }

    return esComprador ? evento.organizadorId : compra.compradorId;
  }
}
