
export class TipoEntrada {
  constructor({
    id,
    nombre,
    descripcion = "",
    precio,
    cupoTotal,
    cupoDisponible
  }) {
    this.id = id;
    this.nombre = nombre;
    this.descripcion = descripcion;
    this.precio = precio;
    this.cupoTotal = cupoTotal;
    this.cupoDisponible = cupoDisponible;
  }
}
