
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
    const compras = this.compraRepository.buscarPorComprador(
      Number(compradorId)
    );

    return compras.map((compra) => {
      const evento = this.eventoRepository.obtenerPorId(compra.eventoId);

      if (!evento) {
        return {
          ...compra,
          diasFaltantes: null,
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
        diasFaltantes,
      };
    });
  }

  buscarPorEvento(eventoId, organizadorId) {
    const evento = this.eventoRepository.obtenerPorId(Number(eventoId));

    if (!evento) {
      throw new Error("Evento no encontrado");
    }

    const organizador = this.usuarioRepository.obtenerPorId(
      Number(organizadorId)
    );

    if (!organizador) {
      throw new Error("Organizador no encontrado");
    }

    if (!organizador.roles.includes(RolUsuario.ORGANIZADOR)) {
      throw new Error("El usuario no tiene rol de organizador");
    }

    if (Number(evento.organizadorId) !== Number(organizadorId)) {
      throw new Error(
        "No tenés permiso para consultar las ventas de este evento"
      );
    }

    const compras = this.compraRepository.buscarPorEvento(Number(eventoId));

    return compras.map((compra) => {
      const comprador = this.usuarioRepository.obtenerPorId(
        Number(compra.compradorId)
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
            (tipo) =>
              Number(tipo.id) === Number(detalle.tipoEntradaId)
          );

          return {
            ...detalle,
            tipoEntrada:
              tipoEntrada?.nombre || "Tipo de entrada no disponible",
          };
        }),
      };
    });
  }

  // ==============================
  // CREAR COMPRA
  // ==============================

  crear(compradorId, eventoId, items) {
    const comprador = this.usuarioRepository.obtenerPorId(
      Number(compradorId)
    );

    if (!comprador) {
      throw new Error("Comprador no encontrado");
    }

    if (!comprador.roles.includes(RolUsuario.COMPRADOR)) {
      throw new Error("El usuario no tiene rol de comprador");
    }

    const evento = this.eventoRepository.obtenerPorId(Number(eventoId));

    if (!evento) {
      throw new Error("Evento no encontrado");
    }

    if (evento.estado !== EstadoEvento.PUBLICADO) {
      throw new Error("El evento no está disponible para comprar");
    }

    if (new Date(evento.fecha) <= new Date()) {
      throw new Error(
        "No se pueden comprar entradas para un evento que ya comenzó"
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      throw new Error(
        "La compra debe contener al menos un tipo de entrada"
      );
    }

    // Agrupamos las cantidades de un mismo tipo de entrada.
    const cantidadesPorTipo = new Map();

    for (const item of items) {
      const tipoEntradaId = Number(item.tipoEntradaId);

      if (!Number.isInteger(tipoEntradaId)) {
        throw new Error("El tipo de entrada no es válido");
      }

      if (!Number.isInteger(item.cantidad) || item.cantidad <= 0) {
        throw new Error("La cantidad debe ser un entero positivo");
      }

      const cantidadAcumulada =
        (cantidadesPorTipo.get(tipoEntradaId) || 0) + item.cantidad;

      cantidadesPorTipo.set(tipoEntradaId, cantidadAcumulada);
    }

    const detalles = [];

    for (const [tipoEntradaId, cantidad] of cantidadesPorTipo) {
      const tipoEntrada = evento.tiposEntrada.find(
        (tipo) => Number(tipo.id) === tipoEntradaId
      );

      if (!tipoEntrada) {
        throw new Error("Tipo de entrada no encontrado");
      }

      if (cantidad > tipoEntrada.cupoDisponible) {
        throw new Error("No hay suficientes entradas disponibles");
      }

      const detalle = new DetalleCompra({
        tipoEntradaId: tipoEntrada.id,
        cantidad,
        precioUnitario: tipoEntrada.precio,
        subtotal: tipoEntrada.precio * cantidad,
      });

      detalles.push(detalle);
    }

    const total = detalles.reduce(
      (acumulador, detalle) => acumulador + detalle.subtotal,
      0
    );

    const compras = this.compraRepository.obtenerTodos();

    const nuevoId =
      compras.length === 0
        ? 1
        : Math.max(...compras.map((compra) => Number(compra.id))) + 1;

    const compra = new Compra({
      id: nuevoId,
      compradorId: Number(comprador.id),
      eventoId: Number(evento.id),
      fecha: new Date(),
      estado: EstadoCompra.PENDIENTE_DE_PAGO,
      detalles,
      total,
    });

    // Reservamos el cupo al crear la compra pendiente.
    for (const detalle of detalles) {
      const tipoEntrada = evento.tiposEntrada.find(
        (tipo) =>
          Number(tipo.id) === Number(detalle.tipoEntradaId)
      );

      tipoEntrada.cupoDisponible -= detalle.cantidad;
    }

    this.eventoRepository.guardar(evento);
    this.compraRepository.guardar(compra);

    this.registrarCambioEstado(
      compra.id,
      EstadoCompra.PENDIENTE_DE_PAGO,
      comprador.id
    );

    return compra;
  }

  // ==============================
  // CONFIRMAR PAGO SIMULADO
  // ==============================

  confirmarPago(compraId, compradorId) {
    const compra = this.obtenerPorId(Number(compraId));

    if (Number(compra.compradorId) !== Number(compradorId)) {
      throw new Error("No tenés permiso para pagar esta compra");
    }

    if (compra.estado !== EstadoCompra.PENDIENTE_DE_PAGO) {
      throw new Error("La compra no está pendiente de pago");
    }

    const evento = this.eventoRepository.obtenerPorId(
      Number(compra.eventoId)
    );

    if (!evento) {
      throw new Error("Evento no encontrado");
    }

    if (evento.estado !== EstadoEvento.PUBLICADO) {
      throw new Error("El evento no está disponible");
    }

    if (new Date(evento.fecha) <= new Date()) {
      throw new Error("El evento ya comenzó");
    }

    // Simulamos la aprobación del pago.
    compra.estado = EstadoCompra.CONFIRMADA;

    this.compraRepository.guardar(compra);

    this.registrarCambioEstado(
      compra.id,
      EstadoCompra.CONFIRMADA,
      Number(compradorId)
    );

    return compra;
  }

  // ==============================
  // CANCELAR / REEMBOLSAR COMPRA
  // ==============================

  cancelar(compraId, quienId) {
    const compra = this.obtenerPorId(Number(compraId));

    const quien = this.usuarioRepository.obtenerPorId(Number(quienId));

    if (!quien) {
      throw new Error("Usuario no encontrado");
    }

    const evento = this.eventoRepository.obtenerPorId(
      Number(compra.eventoId)
    );

    if (!evento) {
      throw new Error("Evento no encontrado");
    }

    const esComprador =
      Number(compra.compradorId) === Number(quienId);

    const esOrganizador =
      Number(evento.organizadorId) === Number(quienId);

    if (!esComprador && !esOrganizador) {
      throw new Error(
        "El usuario no está autorizado para cancelar esta compra"
      );
    }

    if (
      compra.estado !== EstadoCompra.CONFIRMADA &&
      compra.estado !== EstadoCompra.PENDIENTE_DE_PAGO
    ) {
      throw new Error(
        "Solo se pueden cancelar compras pendientes o confirmadas"
      );
    }

    if (new Date(evento.fecha) <= new Date()) {
      throw new Error(
        "No se puede cancelar una compra después del inicio del evento"
      );
    }

    // Devolvemos el cupo reservado.
    for (const detalle of compra.detalles) {
      const tipoEntrada = evento.tiposEntrada.find(
        (tipo) =>
          Number(tipo.id) === Number(detalle.tipoEntradaId)
      );

      if (tipoEntrada) {
        tipoEntrada.cupoDisponible += detalle.cantidad;
      }
    }

    // Si estaba pendiente, se cancela.
    // Si estaba confirmada, se registra como reembolsada.
    const nuevoEstado =
      compra.estado === EstadoCompra.PENDIENTE_DE_PAGO
        ? EstadoCompra.CANCELADA
        : EstadoCompra.REEMBOLSADA;

    compra.estado = nuevoEstado;

    this.eventoRepository.guardar(evento);
    this.compraRepository.guardar(compra);

    this.registrarCambioEstado(
      compra.id,
      nuevoEstado,
      Number(quienId)
    );

    return compra;
  }

  // ==============================
  // MARCAR COMPRA COMO UTILIZADA
  // ==============================

  marcarUtilizada(compraId, organizadorId) {
    const compra = this.obtenerPorId(Number(compraId));

    const evento = this.eventoRepository.obtenerPorId(
      Number(compra.eventoId)
    );

    if (!evento) {
      throw new Error("Evento no encontrado");
    }

    const organizador = this.usuarioRepository.obtenerPorId(
      Number(organizadorId)
    );

    if (!organizador) {
      throw new Error("Organizador no encontrado");
    }

    if (!organizador.roles.includes(RolUsuario.ORGANIZADOR)) {
      throw new Error("El usuario no tiene rol de organizador");
    }

    if (Number(evento.organizadorId) !== Number(organizadorId)) {
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
      Number(organizadorId)
    );

    return compra;
  }

  // ==============================
  // HISTORIAL DE ESTADOS
  // ==============================

  registrarCambioEstado(compraId, estado, quienId) {
    const cambios = this.cambioEstadoRepository.obtenerTodos();

    const nuevoId =
      cambios.length === 0
        ? 1
        : Math.max(...cambios.map((cambio) => Number(cambio.id))) + 1;

    const cambio = new CambioEstadoCompra({
      id: nuevoId,
      compraId: Number(compraId),
      estado,
      quienId: Number(quienId),
      fechaHora: new Date(),
    });

    return this.cambioEstadoRepository.guardar(cambio);
  }

  obtenerHistorial(compraId) {
    const compra = this.obtenerPorId(Number(compraId));

    return this.cambioEstadoRepository.buscarPorCompraOrdenados(
      compra.id
    );
  }
}