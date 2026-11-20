import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CustomInput } from "../ui/CustomInput.jsx";
import { CustomSelect } from "../ui/CustomSelect";
import { CustomButton } from "../ui/CustomButton";
import clientesAxios from "../../config/axios.js";

const obtenerFechaLocalHoy = () => {
  const ahora = new Date();
  const anio = ahora.getFullYear();
  const mes = String(ahora.getMonth() + 1).padStart(2, "0");
  const dia = String(ahora.getDate()).padStart(2, "0");
  return `${anio}-${mes}-${dia}`;
};

const obtenerHoraLocalActual = () => {
  const ahora = new Date();
  const horas = String(ahora.getHours()).padStart(2, "0");
  const minutos = String(ahora.getMinutes()).padStart(2, "0");
  return `${horas}:${minutos}`;
};

const crearEstadoInicial = () => ({
  pacienteId: "",
  turnoId: "",
  fecha: obtenerFechaLocalHoy(),
  hora: obtenerHoraLocalActual(),
  observaciones: "",
  peso: "",
  talla: "",
  cuello: "",
  brazo: "",
  cintura: "",
  cadera: "",
  pTricipital: "",
  pBicipital: "",
  pSubescapular: "",
  pSuprailiaco: "",
});

const aNumeroOpcional = (valor) => {
  if (valor === "" || valor === null || valor === undefined) return undefined;
  const num = Number(valor);
  return Number.isNaN(num) ? undefined : num;
};

export const CrearConsulta = () => {
  const [formData, setFormData] = useState(crearEstadoInicial);
  const [pacientesOptions, setPacientesOptions] = useState([]);
  const [errorServer, setErrorServer] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPacientes = async () => {
      try {
        const { data } = await clientesAxios.get("/pacientes");
        const lista = Array.isArray(data)
          ? data
          : data.pacientes || data.data || data.docs || [];
        const opciones = lista.map((p) => ({
          value: p._id,
          label: `${p.apellido}, ${p.nombre} (DNI: ${p.dni})`,
        }));
        setPacientesOptions(opciones);
      } catch (err) {
        console.error("Error al cargar pacientes:", err);
      }
    };
    fetchPacientes();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorServer("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const payload = {
        paciente: formData.pacienteId,
        turno: formData.turnoId.trim() || undefined,
        fecha: formData.fecha || undefined,
        hora: formData.hora,
        observaciones: formData.observaciones.trim() || undefined,
        antropometria: {
          mediciones: {
            peso: aNumeroOpcional(formData.peso),
            talla: aNumeroOpcional(formData.talla),
            cuello: aNumeroOpcional(formData.cuello),
            brazo: aNumeroOpcional(formData.brazo),
            cintura: aNumeroOpcional(formData.cintura),
            cadera: aNumeroOpcional(formData.cadera),
            pTricipital: aNumeroOpcional(formData.pTricipital),
            pBicipital: aNumeroOpcional(formData.pBicipital),
            pSubescapular: aNumeroOpcional(formData.pSubescapular),
            pSuprailiaco: aNumeroOpcional(formData.pSuprailiaco),
          },
        },
      };

      await clientesAxios.post("/consulta", payload);
      setSuccessMsg("¡Consulta médica registrada con éxito!");
      setTimeout(() => navigate("/consulta"), 1500);
    } catch (err) {
      console.error(err);
      setErrorServer(
        err.response?.data?.mensaje ||
          err.response?.data?.error ||
          "Error al registrar la consulta médica.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4" style={{ maxWidth: "820px" }}>
      <div className="card shadow-sm border-0 p-4 rounded-4">
        <h3 className="fw-bold text-success mb-3">Registrar Nueva Consulta</h3>

        {errorServer && (
          <div className="alert alert-danger py-2 small">{errorServer}</div>
        )}
        {successMsg && (
          <div className="alert alert-success py-2 small">{successMsg}</div>
        )}

        <form onSubmit={handleSubmit}>
          <h6 className="fw-semibold text-secondary mb-3">
            Datos de la Consulta
          </h6>
          <div className="row">
            <div className="col-md-6">
              <CustomSelect
                label="Paciente"
                id="pacienteId"
                name="pacienteId"
                value={formData.pacienteId}
                onChange={handleChange}
                options={pacientesOptions}
                required
              />
            </div>
          </div>

          <div className="row">
            <div className="col-md-6">
              <CustomInput
                label="Fecha"
                name="fecha"
                type="date"
                value={formData.fecha}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-6">
              <CustomInput
                label="Hora"
                name="hora"
                type="time"
                value={formData.hora}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <hr className="my-3" />
          <h6 className="fw-semibold text-secondary mb-3">
            Mediciones Antropométricas
          </h6>

          <div className="row">
            <div className="col-md-3">
              <CustomInput
                label="Peso (kg)"
                name="peso"
                type="number"
                step="0.01"
                min="0"
                value={formData.peso}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-3">
              <CustomInput
                label="Talla (cm / m)"
                name="talla"
                type="number"
                step="0.01"
                min="0"
                value={formData.talla}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-3">
              <CustomInput
                label="Cuello (cm)"
                name="cuello"
                type="number"
                step="0.1"
                value={formData.cuello}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-3">
              <CustomInput
                label="Brazo (cm)"
                name="brazo"
                type="number"
                step="0.1"
                value={formData.brazo}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="row">
            <div className="col-md-3">
              <CustomInput
                label="Cintura (cm)"
                name="cintura"
                type="number"
                step="0.1"
                value={formData.cintura}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-3">
              <CustomInput
                label="Cadera (cm)"
                name="cadera"
                type="number"
                step="0.1"
                value={formData.cadera}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-3">
              <CustomInput
                label="Pliegue Tricipital (mm)"
                name="pTricipital"
                type="number"
                step="0.1"
                value={formData.pTricipital}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-3">
              <CustomInput
                label="Pliegue Bicipital (mm)"
                name="pBicipital"
                type="number"
                step="0.1"
                value={formData.pBicipital}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="row">
            <div className="col-md-6">
              <CustomInput
                label="Pliegue Subescapular (mm)"
                name="pSubescapular"
                type="number"
                step="0.1"
                value={formData.pSubescapular}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-6">
              <CustomInput
                label="Pliegue Suprailíaco (mm)"
                name="pSuprailiaco"
                type="number"
                step="0.1"
                value={formData.pSuprailiaco}
                onChange={handleChange}
              />
            </div>
          </div>

          <CustomInput
            label="Observaciones"
            name="observaciones"
            value={formData.observaciones}
            onChange={handleChange}
            placeholder="Notas clínicas, evolución o indicaciones..."
          />

          <div className="d-flex justify-content-end gap-2 mt-4">
            <CustomButton
              type="button"
              variant="secondary"
              onClick={() => navigate(-1)}
            >
              Cancelar
            </CustomButton>
            <CustomButton type="submit" loading={loading}>
              Guardar Consulta
            </CustomButton>
          </div>
        </form>
      </div>
    </div>
  );
};
