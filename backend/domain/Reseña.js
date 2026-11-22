
export class Resena {
  constructor({
    id,
    compradorId,
    eventoId,
    detalle,
    puntuacion,
    fecha
  }) {
    this.id = id;
    this.compradorId = compradorId;
    this.eventoId = eventoId;
    this.detalle = detalle;
    this.puntuacion = puntuacion;
    this.fecha = fecha;
  }
}
