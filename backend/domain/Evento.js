
export class Evento {
  constructor({
    id,
    nombre,
    descripcion,
    categoriaId,
    fecha,
    tiposEntrada = [],
    multimedia = [],
    organizadorId,
    estado
  }) {
    this.id = id;
    this.nombre = nombre;
    this.descripcion = descripcion;
    this.categoriaId = categoriaId;
    this.fecha = fecha;
    this.tiposEntrada = tiposEntrada;
    this.multimedia = multimedia;
    this.organizadorId = organizadorId;
    this.estado = estado;
  }
}
