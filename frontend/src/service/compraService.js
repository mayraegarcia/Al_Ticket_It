import api from "./api";

export const compraService = {
  obtenerMisCompras: async () => {
    return await api.get("/compras/mis-compras");
  },

  obtenerPorId: async (id) => {
    return await api.get(`/compras/${id}`);
  },

  obtenerPorEvento: async (eventoId) => {
    return await api.get(`/compras/evento/${eventoId}`);
  },

  crear: async (datosCompra) => {
    return await api.post("/compras", datosCompra);
  },

  cancelar: async (id) => {
    return await api.patch(`/compras/${id}/cancelar`);
  },

  marcarUtilizada: async (id) => {
    return await api.patch(`/compras/${id}/utilizar`);
  },

  obtenerHistorial: async (id) => {
    return await api.get(`/compras/${id}/historial`);
  },
};