
export class DetalleCompra {
  constructor({
    tipoEntradaId,
    cantidad,
    precioUnitario,
    subtotal
  }) {
    this.tipoEntradaId = tipoEntradaId;
    this.cantidad = cantidad;
    this.precioUnitario = precioUnitario;
    this.subtotal = subtotal;
  }
}
