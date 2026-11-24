import clientesAxios from "../config/axios.js";

const BASE_URL = "/excepcion";

export const obtenerExcepcionesAgenda = async (params = {}) => {
  const { data } = await clientesAxios.get(BASE_URL, { params });
  return data;
};

export const crearExcepcionAgenda = async (payload) => {
  const { data } = await clientesAxios.post(BASE_URL, payload);
  return data;
};

export const desactivarExcepcionAgenda = async (id) => {
  const { data } = await clientesAxios.patch(`${BASE_URL}/${id}/desactivar`);
  return data;
};