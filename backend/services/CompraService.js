
import { UsuarioRepository } from "../repositories/UsuarioRepository.js";
import { EventoRepository } from "../repositories/EventoRepository.js";
import { CompraRepository } from "../repositories/CompraRepository.js";
import { CambioEstadoCompraRepository } from "../repositories/CambioEstadoCompraRepository.js";

import { Compra } from "../domain/Compra.js";
import { DetalleCompra } from "../domain/DetalleCompra.js";
import { CambioEstadoCompra } from "../domain/CambioEstadoCompra.js";

import { RolUsuario } from "../domain/RolUsuario.js";
import { EstadoEvento } from "../domain/EstadoEvento.js";
import { EstadoCompra } from "../domain/EstadoCompra.js";

export class CompraService {
  constructor() {
    this.usuarioRepository = new UsuarioRepository();
    this.eventoRepository = new EventoRepository();
    this.compraRepository = new CompraRepository();
    this.cambioEstadoRepository = new CambioEstadoCompraRepository();
  }

  // ==============================
  // CONSULTAS
  // ==============================

  obtenerPorId(id) {
    const compra = this.compraRepository.obtenerPorId(id);

    if (!compra) {
      throw new Error("Compra no encontrada");
    }

    return compra;
  }

  buscarPorComprador(compradorId) {
    const compras = this.compraRepository.buscarPorComprador(compradorId);

    return compras.map(compra => {
      const evento = this.eventoRepository.obtenerPorId(compra.eventoId);

      if (!evento) {
        return {
          ...compra,
          diasFaltantes: null
        };
      }

      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      const fechaEvento = new Date(evento.fecha);
      fechaEvento.setHours(0, 0, 0, 0);

      const diferencia = fechaEvento.getTime() - hoy.getTime();

      const diasFaltantes = Math.ceil(
        diferencia / (1000 * 60 * 60 * 24)
      );

      return {
        ...compra,
        diasFaltantes
      };
    });
  }

  buscarPorEvento(eventoId, organizadorId) {
    const evento = this.eventoRepository.obtenerPorId(eventoId);

    if (!evento) {
      throw new Error("Evento no encontrado");
    }

    const organizador = this.usuarioRepository.obtenerPorId(organizadorId);

    if (!organizador) {
      throw new Error("Organizador no encontrado");
    }

    if (!organizador.roles.includes(RolUsuario.ORGANIZADOR)) {
      throw new Error("El usuario no tiene rol de organizador");
    }

    if (Number(evento.organizadorId) !== Number(organizadorId)) {
      throw new Error("No tenés permiso para consultar las ventas de este evento");
    }

    const compras = this.compraRepository.buscarPorEvento(eventoId);

    return compras.map((compra) => {
      const comprador = this.usuarioRepository.obtenerPorId(
        compra.compradorId
      );

      return {
        ...compra,

        comprador: comprador
          ? {
              nombre: comprador.nombre,
              apellido: comprador.apellido,
              email: comprador.email,
            }
          : null,

        detalles: compra.detalles.map((detalle) => {
          const tipoEntrada = evento.tiposEntrada.find(
            (tipo) => Number(tipo.id) === Number(detalle.tipoEntradaId)
          );

          return {
            ...detalle,
            tipoEntrada: tipoEntrada?.nombre || "Tipo de entrada no disponible",
          };
        }),
      };
    });
  }
  // ==============================
  // CREAR COMPRA
  // ==============================

  crear(compradorId, eventoId, items) {
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

    if (evento.estado !== EstadoEvento.PUBLICADO) {
      throw new Error("El evento no está disponible para comprar");
    }

    if (new Date(evento.fecha) <= new Date()) {
      throw new Error("No se pueden comprar entradas para un evento que ya comenzó");
    }

    if (!Array.isArray(items) || items.length === 0) {
      throw new Error("La compra debe contener al menos un tipo de entrada");
    }

    const detalles = [];

    for (const item of items) {
      const tipoEntrada = evento.tiposEntrada.find(
        tipo => tipo.id === Number(item.tipoEntradaId)
      );

      if (!tipoEntrada) {
        throw new Error("Tipo de entrada no encontrado");
      }

      if (!Number.isInteger(item.cantidad) || item.cantidad <= 0) {
        throw new Error("La cantidad debe ser un entero positivo");
      }

      if (item.cantidad > tipoEntrada.cupoDisponible) {
        throw new Error("No hay suficientes entradas disponibles");
      }

      const detalle = new DetalleCompra({
        tipoEntradaId: tipoEntrada.id,
        cantidad: item.cantidad,
        precioUnitario: tipoEntrada.precio,
        subtotal: tipoEntrada.precio * item.cantidad
      });

      detalles.push(detalle);
    }

    const total = detalles.reduce(
      (acumulador, detalle) => acumulador + detalle.subtotal,
      0
    );

    const compras = this.compraRepository.obtenerTodos();

    const nuevoId = compras.length === 0
      ? 1
      : Math.max(...compras.map(compra => compra.id)) + 1;

    const compra = new Compra({
      id: nuevoId,
      compradorId: comprador.id,
      eventoId: evento.id,
      fecha: new Date(),
      estado: EstadoCompra.CONFIRMADA,
      detalles,
      total
    });

    // Descontamos el cupo de cada tipo de entrada.
    for (const detalle of detalles) {
      const tipoEntrada = evento.tiposEntrada.find(
        tipo => tipo.id === detalle.tipoEntradaId
      );

      tipoEntrada.cupoDisponible -= detalle.cantidad;
    }

    this.eventoRepository.guardar(evento);
    this.compraRepository.guardar(compra);

    this.registrarCambioEstado(
      compra.id,
      EstadoCompra.CONFIRMADA,
      comprador.id
    );

    return compra;
  }

  // ==============================
  // CANCELAR / REEMBOLSAR COMPRA
  // ==============================

  cancelar(compraId, quienId) {
    const compra = this.obtenerPorId(compraId);

    const quien = this.usuarioRepository.obtenerPorId(quienId);

    if (!quien) {
      throw new Error("Usuario no encontrado");
    }

    const evento = this.eventoRepository.obtenerPorId(compra.eventoId);

    if (!evento) {
      throw new Error("Evento no encontrado");
    }

    const esComprador = compra.compradorId === Number(quienId);
    const esOrganizador = evento.organizadorId === Number(quienId);

    if (!esComprador && !esOrganizador) {
      throw new Error("El usuario no está autorizado para cancelar esta compra");
    }

    if (compra.estado !== EstadoCompra.CONFIRMADA) {
      throw new Error("Solo se pueden cancelar compras confirmadas");
    }

    if (new Date(evento.fecha) <= new Date()) {
      throw new Error("No se puede cancelar una compra después del inicio del evento");
    }

    // Devolvemos el cupo de cada tipo de entrada.
    for (const detalle of compra.detalles) {
      const tipoEntrada = evento.tiposEntrada.find(
        tipo => tipo.id === detalle.tipoEntradaId
      );

      if (tipoEntrada) {
        tipoEntrada.cupoDisponible += detalle.cantidad;
      }
    }

    compra.estado = EstadoCompra.REEMBOLSADA;

    this.eventoRepository.guardar(evento);
    this.compraRepository.guardar(compra);

    this.registrarCambioEstado(
      compra.id,
      EstadoCompra.REEMBOLSADA,
      quien.id
    );

    return compra;
  }

  // ==============================
  // MARCAR COMPRA COMO UTILIZADA
  // ==============================

  marcarUtilizada(compraId, organizadorId) {
    const compra = this.obtenerPorId(compraId);

    const evento = this.eventoRepository.obtenerPorId(compra.eventoId);

    if (!evento) {
      throw new Error("Evento no encontrado");
    }

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

    if (compra.estado !== EstadoCompra.CONFIRMADA) {
      throw new Error("Solo se pueden utilizar compras confirmadas");
    }

    if (evento.estado !== EstadoEvento.PUBLICADO) {
      throw new Error("El evento no está disponible");
    }

    compra.estado = EstadoCompra.UTILIZADA;

    this.compraRepository.guardar(compra);

    this.registrarCambioEstado(
      compra.id,
      EstadoCompra.UTILIZADA,
      organizador.id
    );

    return compra;
  }

  // ==============================
  // HISTORIAL DE ESTADOS
  // ==============================

  registrarCambioEstado(compraId, estado, quienId) {
    const cambios = this.cambioEstadoRepository.obtenerTodos();

    const nuevoId = cambios.length === 0
      ? 1
      : Math.max(...cambios.map(cambio => cambio.id)) + 1;

    const cambio = new CambioEstadoCompra({
      id: nuevoId,
      compraId: Number(compraId),
      estado,
      quienId: Number(quienId),
      fechaHora: new Date()
    });

    return this.cambioEstadoRepository.guardar(cambio);
  }

  obtenerHistorial(compraId) {
    const compra = this.obtenerPorId(compraId);

    return this.cambioEstadoRepository.buscarPorCompraOrdenados(compra.id);
  }
}
