
export class Favorito {
  constructor({
    id,
    compradorId,
    eventoId,
    fecha = new Date(),
  }) {
    this.id = id;
    this.compradorId = Number(compradorId);
    this.eventoId = Number(eventoId);
    this.fecha = fecha;
  }
}
