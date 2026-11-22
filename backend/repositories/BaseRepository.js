
export class BaseRepository {
  constructor(datos) {
    this.datos = datos;
  }

  obtenerTodos() {
    return this.datos;
  }

  obtenerPorId(id) {
    return this.datos.find(objeto => objeto.id === Number(id));
  }

  guardar(objeto) {
    const existente = this.obtenerPorId(objeto.id);

    if (existente) {
      const indice = this.datos.findIndex(
        elemento => elemento.id === objeto.id
      );

      this.datos[indice] = objeto;
      return objeto;
    }

    this.datos.push(objeto);
    return objeto;
  }

  eliminar(id) {
    const indice = this.datos.findIndex(
      objeto => objeto.id === Number(id)
    );

    if (indice === -1) {
      return false;
    }

    this.datos.splice(indice, 1);
    return true;
  }
}
