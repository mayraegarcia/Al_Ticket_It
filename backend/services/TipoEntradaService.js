
import { EventoRepository } from "../repositories/EventoRepository.js";
import { TipoEntrada } from "../domain/TipoEntrada.js";

export class TipoEntradaService {
  constructor() {
    this.eventoRepository = new EventoRepository();
  }

  obtenerEvento(eventoId) {
    const evento = this.eventoRepository.obtenerPorId(eventoId);

    if (!evento) {
      throw new Error("Evento no encontrado");
    }

    return evento;
  }

  obtenerPorId(eventoId, tipoEntradaId) {
    const evento = this.obtenerEvento(eventoId);

    const tipoEntrada = evento.tiposEntrada.find(
      tipo => tipo.id === Number(tipoEntradaId)
    );

    if (!tipoEntrada) {
      throw new Error("Tipo de entrada no encontrado");
    }

    return tipoEntrada;
  }

  agregar(eventoId, datos) {
    const evento = this.obtenerEvento(eventoId);

    const nuevoId =
      evento.tiposEntrada.length === 0
        ? 1
        : Math.max(...evento.tiposEntrada.map(tipo => tipo.id)) + 1;

    const tipoEntrada = new TipoEntrada({
      id: nuevoId,
      nombre: datos.nombre,
      descripcion: datos.descripcion || "",
      precio: datos.precio,
      cupoTotal: datos.cupoTotal,
      cupoDisponible: datos.cupoTotal
    });

    evento.tiposEntrada.push(tipoEntrada);

    this.eventoRepository.guardar(evento);

    return tipoEntrada;
  }

  modificar(eventoId, tipoEntradaId, datos) {
    const evento = this.obtenerEvento(eventoId);

    const tipoEntrada = this.obtenerPorId(eventoId, tipoEntradaId);

    if (datos.precio !== undefined) {
      if (datos.precio < 0) {
        throw new Error("El precio no puede ser negativo");
      }

      tipoEntrada.precio = datos.precio;
    }

    if (datos.nombre !== undefined) {
      tipoEntrada.nombre = datos.nombre;
    }

    if (datos.descripcion !== undefined) {
      tipoEntrada.descripcion = datos.descripcion;
    }

    if (datos.cupoTotal !== undefined) {
      const vendidas =
        tipoEntrada.cupoTotal - tipoEntrada.cupoDisponible;

      if (datos.cupoTotal < vendidas) {
        throw new Error(
          "El cupo total no puede ser menor a las entradas vendidas"
        );
      }

      tipoEntrada.cupoTotal = datos.cupoTotal;
      tipoEntrada.cupoDisponible = datos.cupoTotal - vendidas;
    }

    this.eventoRepository.guardar(evento);

    return tipoEntrada;
  }

  eliminar(eventoId, tipoEntradaId) {
    const evento = this.obtenerEvento(eventoId);

    const tipoEntrada = this.obtenerPorId(eventoId, tipoEntradaId);

    const vendidas =
      tipoEntrada.cupoTotal - tipoEntrada.cupoDisponible;

    if (vendidas > 0) {
      throw new Error(
        "No se puede eliminar un tipo de entrada que tiene ventas"
      );
    }

    evento.tiposEntrada = evento.tiposEntrada.filter(
      tipo => tipo.id !== Number(tipoEntradaId)
    );

    this.eventoRepository.guardar(evento);

    return true;
  }
}
