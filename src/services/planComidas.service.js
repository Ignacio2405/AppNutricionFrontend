import clientesAxios from "../config/axios.js";

const ENDPOINT = "/planes-comidas";

export const obtenerPlanesComidas = async (params = {}) => {
  const { data } = await clientesAxios.get(ENDPOINT, { params });
  return data;
};

export const obtenerPlanComidasPorId = async (id) => {
  const { data } = await clientesAxios.get(`${ENDPOINT}/${id}`);
  return data;
};

export const crearPlanComidas = async (payload) => {
  const { data } = await clientesAxios.post(ENDPOINT, payload);
  return data;
};

export const actualizarPlanComidas = async (id, payload) => {
  const { data } = await clientesAxios.put(`${ENDPOINT}/${id}`, payload);
  return data;
};

export const eliminarPlanComidas = async (id) => {
  const { data } = await clientesAxios.delete(`${ENDPOINT}/${id}`);
  return data;
};
