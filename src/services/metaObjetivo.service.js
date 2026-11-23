import clientesAxios from "../config/axios.js";

const ENDPOINT = "/metas-objetivos";

export const obtenerMetasObjetivos = async (params = {}) => {
  const { data } = await clientesAxios.get(ENDPOINT, { params });
  return Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
};

export const obtenerMetaObjetivoPorId = async (id) => {
  const { data } = await clientesAxios.get(`${ENDPOINT}/${id}`);
  return data?.data || data;
};

export const crearMetaObjetivo = async (payload) => {
  const { data } = await clientesAxios.post(ENDPOINT, payload);
  return data?.data || data;
};

export const actualizarMetaObjetivo = async (id, payload) => {
  const { data } = await clientesAxios.put(`${ENDPOINT}/${id}`, payload);
  return data?.data || data;
};

export const eliminarMetaObjetivo = async (id) => {
  const { data } = await clientesAxios.delete(`${ENDPOINT}/${id}`);
  return data;
};