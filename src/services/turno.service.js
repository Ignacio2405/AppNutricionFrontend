import clientesAxios from "../config/axios";

const BASE_URL = "/turno";

export const obtenerTurnos = async (params = {}) => {
  const { data } = await clientesAxios.get(BASE_URL, { params });
  return data;
};

export const obtenerTurnoPorId = async (id) => {
  const { data } = await clientesAxios.get(`${BASE_URL}/${id}`);
  return data;
};

export const obtenerTurnosDisponibles = async ({ medico, fecha }) => {
  const { data } = await clientesAxios.get(`${BASE_URL}/turnos-disponibles`, {
    params: { medico, fecha },
  });
  return data;
};

export const obtenerDisponibilidadMes = async ({ medico, anio, mes }) => {
  const { data } = await clientesAxios.get(
    `${BASE_URL}/turnos-disponibles-mes`,
    { params: { medico, anio, mes } },
  );
  return data;
};

export const obtenerTurnosPendientesHistoricos = async () => {
  const { data } = await clientesAxios.get(`${BASE_URL}/pendientes-historicos`);
  return data;
};

export const crearTurno = async (payload, { urgencia = false } = {}) => {
  const { data } = await clientesAxios.post(BASE_URL, payload, {
    params: urgencia ? { urgencia: "true" } : {},
  });
  return data;
};

export const actualizarTurno = async (id, payload) => {
  const { data } = await clientesAxios.put(`${BASE_URL}/${id}`, payload);
  return data;
};

export const marcarTurnoAtendido = async (id) => {
  const { data } = await clientesAxios.patch(`${BASE_URL}/${id}/atendido`);
  return data;
};

export const cancelarTurno = async (id) => {
  const { data } = await clientesAxios.patch(`${BASE_URL}/${id}/cancelar`);
  return data;
};

export const eliminarTurno = async (id) => {
  const { data } = await clientesAxios.delete(`${BASE_URL}/${id}`);
  return data;
};