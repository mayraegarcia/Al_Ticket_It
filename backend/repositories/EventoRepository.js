
import { BaseRepository } from "./BaseRepository.js";
import { eventos } from "../data/datosIniciales.js";


export class EventoRepository extends BaseRepository {
  constructor() {
    super(eventos);
  }

  buscarPorNombre(texto) {
    const textoNormalizado = texto.toLowerCase();

    return this.datos.filter(evento =>
      evento.nombre.toLowerCase().includes(textoNormalizado)
    );
  }

  buscarPorCategoria(categoriaId) {
    return this.datos.filter(
      evento => evento.categoriaId === Number(categoriaId)
    );
  }

  buscarPorOrganizador(organizadorId) {
    return this.datos.filter(
      evento => evento.organizadorId === Number(organizadorId)
    );
  }

  buscarPorEstado(estado) {
    return this.datos.filter(evento => evento.estado === estado);
  }

  buscar({ texto, categoriaId, organizadorId, estado } = {}) {
    return this.datos.filter(evento => {
      const coincideTexto =
        !texto ||
        evento.nombre.toLowerCase().includes(texto.toLowerCase());

      const coincideCategoria =
        categoriaId === undefined ||
        evento.categoriaId === Number(categoriaId);

      const coincideOrganizador =
        organizadorId === undefined ||
        evento.organizadorId === Number(organizadorId);

      const coincideEstado =
        estado === undefined || evento.estado === estado;

      return (
        coincideTexto &&
        coincideCategoria &&
        coincideOrganizador &&
        coincideEstado
      );
    });
  }

  ordenarPorFecha(listaEventos) {
    return [...listaEventos].sort(
      (a, b) => new Date(a.fecha) - new Date(b.fecha)
    );
  }

  ordenarPorPrecio(listaEventos) {
    return [...listaEventos].sort(
      (a, b) => this.obtenerPrecioMinimo(a) - this.obtenerPrecioMinimo(b)
    );
  }

  obtenerPrecioMinimo(evento) {
    if (evento.tiposEntrada.length === 0) {
      return Infinity;
    }

    return Math.min(
      ...evento.tiposEntrada.map(tipo => tipo.precio)
    );
  }
}
