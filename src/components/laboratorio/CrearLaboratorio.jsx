import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CustomInput } from "../ui/CustomInput.jsx";
import { CustomButton } from "../ui/CustomButton.jsx";
import clientesAxios from "../../config/axios.js";

const fechaHoyInput = () => new Date().toISOString().split("T")[0];

export const CrearLaboratorio = () => {
  const navigate = useNavigate();

  const [pacientes, setPacientes] = useState([]);
  const [loadingPacientes, setLoadingPacientes] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [formData, setFormData] = useState({
    pacienteId: "",
    fechaEstudio: fechaHoyInput(),
    glucemia: "",
    colesterolTotal: "",
    colesterolHdl: "",
    colesterolLdl: "",
    trigliceridos: "",
    hemoglobinaGlicosilada: "",
    tsh: "",
    observacionesLaboratorio: "",
    dietaryRecall24h: "",
    notasNutricionista: "",
  });

  useEffect(() => {
    let activo = true;

    const cargarPacientes = async () => {
      try {
        const { data } = await clientesAxios.get("/pacientes");
        if (!activo) return;
        const lista = Array.isArray(data)
          ? data
          : data.data || data.pacientes || [];
        setPacientes(lista);
      } catch (err) {
        if (!activo) return;
        console.error("Error al cargar pacientes:", err);
        setErrorMsg("No se pudo cargar la lista de pacientes.");
      } finally {
        if (activo) setLoadingPacientes(false);
      }
    };

    cargarPacientes();
    return () => {
      activo = false;
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!formData.pacienteId) {
      setErrorMsg("Debés seleccionar un paciente.");
      return;
    }

    setGuardando(true);
    try {
      const payload = {
        ...formData,
        fechaEstudio: formData.fechaEstudio || new Date().toISOString(),
      };

      await clientesAxios.post("/resultados-laboratorio", payload);
      navigate("/resultados-laboratorio");
    } catch (err) {
      console.error("Error al registrar resultados de laboratorio:", err);
      const detalle = Array.isArray(err.response?.data?.errores)
        ? ` (${err.response.data.errores.join(" - ")})`
        : "";
      setErrorMsg(
        (err.response?.data?.mensaje ||
          "Ocurrió un error al guardar los resultados de laboratorio.") +
          detalle,
      );
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="container py-4">
      <div className="card shadow-sm border-0 p-4 rounded-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="fw-bold text-success mb-0">
            Registrar Resultados de Laboratorio
          </h3>
          <CustomButton
            type="button"
            variant="secondary"
            onClick={() => navigate("/resultados-laboratorio")}
          >
            Volver al listado
          </CustomButton>
        </div>

        {errorMsg && (
          <div className="alert alert-danger py-2 small">{errorMsg}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            {/* Paciente */}
            <div className="col-md-8">
              <label className="form-label fw-semibold text-secondary">
                Paciente *
              </label>
              <select
                name="pacienteId"
                className="form-select"
                value={formData.pacienteId}
                onChange={handleChange}
                disabled={loadingPacientes}
                required
              >
                <option value="">
                  {loadingPacientes
                    ? "Cargando pacientes..."
                    : "Seleccioná un paciente"}
                </option>
                {pacientes.map((pac) => (
                  <option key={pac._id} value={pac._id}>
                    {pac.apellido}, {pac.nombre}
                    {pac.dni ? ` - DNI: ${pac.dni}` : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Fecha del estudio */}
            <div className="col-md-4">
              <CustomInput
                label="Fecha del estudio"
                type="date"
                name="fechaEstudio"
                value={formData.fechaEstudio}
                onChange={handleChange}
              />
            </div>

            {/* Marcadores bioquímicos */}
            <div className="col-sm-6 col-md-3">
              <CustomInput
                label="Glucemia (mg/dL)"
                type="number"
                step="0.1"
                min="0"
                name="glucemia"
                value={formData.glucemia}
                onChange={handleChange}
                placeholder="Ej: 92"
              />
            </div>

            <div className="col-sm-6 col-md-3">
              <CustomInput
                label="Colesterol total (mg/dL)"
                type="number"
                step="0.1"
                min="0"
                name="colesterolTotal"
                value={formData.colesterolTotal}
                onChange={handleChange}
                placeholder="Ej: 185"
              />
            </div>

            <div className="col-sm-6 col-md-3">
              <CustomInput
                label="Colesterol HDL (mg/dL)"
                type="number"
                step="0.1"
                min="0"
                name="colesterolHdl"
                value={formData.colesterolHdl}
                onChange={handleChange}
                placeholder="Ej: 54"
              />
            </div>

            <div className="col-sm-6 col-md-3">
              <CustomInput
                label="Colesterol LDL (mg/dL)"
                type="number"
                step="0.1"
                min="0"
                name="colesterolLdl"
                value={formData.colesterolLdl}
                onChange={handleChange}
                placeholder="Ej: 110"
              />
            </div>

            <div className="col-sm-6 col-md-4">
              <CustomInput
                label="Triglicéridos (mg/dL)"
                type="number"
                step="0.1"
                min="0"
                name="trigliceridos"
                value={formData.trigliceridos}
                onChange={handleChange}
                placeholder="Ej: 130"
              />
            </div>

            <div className="col-sm-6 col-md-4">
              <CustomInput
                label="Hemoglobina glicosilada (%)"
                type="number"
                step="0.1"
                min="0"
                max="25"
                name="hemoglobinaGlicosilada"
                value={formData.hemoglobinaGlicosilada}
                onChange={handleChange}
                placeholder="Ej: 5.4"
              />
            </div>

            <div className="col-sm-6 col-md-4">
              <CustomInput
                label="TSH / Tiroides (mUI/L)"
                type="number"
                step="0.01"
                min="0"
                name="tsh"
                value={formData.tsh}
                onChange={handleChange}
                placeholder="Ej: 2.15"
              />
            </div>

            {/* Observaciones del laboratorio */}
            <div className="col-12">
              <label className="form-label fw-semibold text-secondary">
                Observaciones generales del laboratorio
              </label>
              <textarea
                name="observacionesLaboratorio"
                className="form-control"
                rows="2"
                value={formData.observacionesLaboratorio}
                onChange={handleChange}
                placeholder="Valores de referencia del laboratorio, ayuno, comentarios técnicos..."
              />
            </div>

            {/* Recordatorio 24h y notas clínicas */}
            <div className="col-md-6">
              <label className="form-label fw-semibold text-secondary">
                Recordatorio de 24 horas (Dietary Recall 24h)
              </label>
              <textarea
                name="dietaryRecall24h"
                className="form-control"
                rows="4"
                value={formData.dietaryRecall24h}
                onChange={handleChange}
                placeholder="Detalle de comidas, horarios, porciones y bebidas ingeridas en las últimas 24 hs..."
              />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold text-secondary">
                Notas clínicas y observaciones del nutricionista
              </label>
              <textarea
                name="notasNutricionista"
                className="form-control"
                rows="4"
                value={formData.notasNutricionista}
                onChange={handleChange}
                placeholder="Interpretación clínica, conducta nutricional, pedidos complementarios..."
              />
            </div>
          </div>

          <div className="d-flex justify-content-end gap-2 mt-4">
            <CustomButton
              type="button"
              variant="secondary"
              onClick={() => navigate("/resultados-laboratorio")}
            >
              Cancelar
            </CustomButton>
            <CustomButton type="submit" disabled={guardando}>
              {guardando ? "Guardando..." : "Guardar Laboratorio"}
            </CustomButton>
          </div>
        </form>
      </div>
    </div>
  );
};
