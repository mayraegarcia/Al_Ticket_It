
import api from "./api";

export const mensajeService = {
  obtenerPorCompra: async (compraId) =>
    await api.get(`/mensajes/compra/${compraId}`),

  enviar: async (compraId, mensaje) =>
    await api.post(`/mensajes/compra/${compraId}`, {
      mensaje,
    }),
};
