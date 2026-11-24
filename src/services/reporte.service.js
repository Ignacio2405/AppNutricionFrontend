import clientesAxios from "../config/axios.js";

export const obtenerInformePaciente = async (pacienteId, params = {}) => {
  const { data } = await clientesAxios.get(`/reportes/paciente/${pacienteId}`, {
    params,
  });
  return data;
};