import clientesAxios from "../config/axios.js";

export const obtenerInformePaciente = async (pacienteId, params = {}) => {
  const { data } = await clientesAxios.get(`/reportes/paciente/${pacienteId}`, {
    params,
  });

  return data?.informe || data?.data?.informe || data?.data || data;
};