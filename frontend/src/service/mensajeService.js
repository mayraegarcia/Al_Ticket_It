import api from "./api";

export const mensajeService = {
  obtenerPorCompra: async (compraId) => {
    return await api.get(`/mensajes/compra/${compraId}`);
  },

  enviar: async (compraId, mensaje) => {
    return await api.post(
      `/mensajes/compra/${compraId}`,
      mensaje
    );
  },
};