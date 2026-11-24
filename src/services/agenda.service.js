import clientesAxios from "../config/axios.js";

const BASE_URL = "/agenda";

export const obtenerAgenda = async (params = {}) => {
  const { data } = await clientesAxios.get(BASE_URL, { params });
  return data;
};

export const crearAgenda = async (payload) => {
  const { data } = await clientesAxios.post(BASE_URL, payload);
  return data;
};

export const actualizarAgenda = async (id, payload) => {
  const { data } = await clientesAxios.put(`${BASE_URL}/${id}`, payload);
  return data;
};

export const eliminarAgenda = async (id) => {
  const { data } = await clientesAxios.delete(`${BASE_URL}/${id}`);
  return data;
};
export const obtenerTurnosDisponibles = async ({ medico, fecha }) => {
  const { data } = await clientesAxios.get("/turno/turnos-disponibles", {
    params: { medico, fecha },
  });
  return data;
};