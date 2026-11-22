
export class Mensaje {
  constructor({
    id,
    compraId,
    emisorId,
    destinatarioId,
    mensaje,
    enviado
  }) {
    this.id = id;
    this.compraId = compraId;
    this.emisorId = emisorId;
    this.destinatarioId = destinatarioId;
    this.mensaje = mensaje;
    this.enviado = enviado;
  }
}
