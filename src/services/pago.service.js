import clientesAxios from "../config/axios.js";

const BASE_URL = "/pagos";

export const obtenerPagos = async (params = {}) => {
  const { data } = await clientesAxios.get(BASE_URL, { params });
  return data;
};

export const registrarPago = async (payload) => {
  const { data } = await clientesAxios.post(BASE_URL, payload);
  return data;
};

export const anularPago = async (id) => {
  const { data } = await clientesAxios.patch(`${BASE_URL}/${id}/anular`);
  return data;
};