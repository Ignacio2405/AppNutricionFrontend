import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CustomInput } from "../ui/CustomInput.jsx";
import { CustomButton } from "../ui/CustomButton.jsx";
import clientesAxios from "../../config/axios.js";

export const CrearHabitos = () => {
  const navigate = useNavigate();

  const [pacientes, setPacientes] = useState([]);
  const [loadingPacientes, setLoadingPacientes] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [formData, setFormData] = useState({
    pacienteId: "",
    cantidadComidasDiarias: 4,
    consumoAguaDiarioLitros: 2,
    alimentosPreferidos: "",
    alimentosRechazados: "",
    historialDietasPrevias: "",
    resultadosDietasPrevias: "",
    nivelActividadFisica: "sedentarismo",
    horasSuenoNocturno: 7,
    nivelEstres: "bajo",
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
        cantidadComidasDiarias: Number(formData.cantidadComidasDiarias),
        consumoAguaDiarioLitros: Number(formData.consumoAguaDiarioLitros),
        horasSuenoNocturno: Number(formData.horasSuenoNocturno),
      };

      await clientesAxios.post("/habitos/crear", payload);
      navigate("/habitos-alimentarios");
    } catch (err) {
      console.error("Error al registrar hábitos alimentarios:", err);
      console.log("Detalle 400 del backend:", err.response?.data);
      const detalle = Array.isArray(err.response?.data?.errores)
        ? ` (${err.response.data.errores.join(" - ")})`
        : "";
      setErrorMsg(
        (err.response?.data?.mensaje ||
          "Ocurrió un error al guardar los hábitos alimentarios.") + detalle,
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
            Registrar Hábitos Alimentarios
          </h3>
          <CustomButton
            type="button"
            variant="secondary"
            onClick={() => navigate("/habitos-alimentarios")}
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
            <div className="col-md-6">
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

            {/* Cantidad de comidas diarias */}
            <div className="col-md-3">
              <CustomInput
                label="Comidas diarias *"
                type="number"
                name="cantidadComidasDiarias"
                min="1"
                max="12"
                value={formData.cantidadComidasDiarias}
                onChange={handleChange}
                required
              />
            </div>

            {/* Consumo de agua */}
            <div className="col-md-3">
              <CustomInput
                label="Agua diaria (Litros) *"
                type="number"
                step="0.1"
                min="0"
                max="15"
                name="consumoAguaDiarioLitros"
                value={formData.consumoAguaDiarioLitros}
                onChange={handleChange}
                required
              />
            </div>

            {/* Nivel de actividad física */}
            <div className="col-md-4">
              <label className="form-label fw-semibold text-secondary">
                Nivel de actividad física
              </label>
              <select
                name="nivelActividadFisica"
                className="form-select"
                value={formData.nivelActividadFisica}
                onChange={handleChange}
              >
                <option value="sedentarismo">Sedentarismo</option>
                <option value="ligero">Ligero</option>
                <option value="moderado">Moderado</option>
                <option value="intenso">Intenso</option>
              </select>
            </div>

            {/* Horas de sueño */}
            <div className="col-md-4">
              <CustomInput
                label="Horas de sueño nocturno"
                type="number"
                step="0.5"
                min="0"
                max="24"
                name="horasSuenoNocturno"
                value={formData.horasSuenoNocturno}
                onChange={handleChange}
              />
            </div>

            {/* Nivel de estrés */}
            <div className="col-md-4">
              <label className="form-label fw-semibold text-secondary">
                Nivel de estrés percibido
              </label>
              <select
                name="nivelEstres"
                className="form-select"
                value={formData.nivelEstres}
                onChange={handleChange}
              >
                <option value="bajo">Bajo</option>
                <option value="medio">Medio</option>
                <option value="alto">Alto</option>
              </select>
            </div>

            {/* Alimentos preferidos */}
            <div className="col-md-6">
              <CustomInput
                label="Alimentos preferidos (separados por coma)"
                name="alimentosPreferidos"
                value={formData.alimentosPreferidos}
                onChange={handleChange}
                placeholder="Ej: pollo, arroz integral, palta, frutas"
              />
            </div>

            {/* Alimentos que rechaza */}
            <div className="col-md-6">
              <CustomInput
                label="Alimentos que rechaza (separados por coma)"
                name="alimentosRechazados"
                value={formData.alimentosRechazados}
                onChange={handleChange}
                placeholder="Ej: brócoli, pescado, picantes"
              />
            </div>

            {/* Historial de dietas previas */}
            <div className="col-md-6">
              <label className="form-label fw-semibold text-secondary">
                Historial de dietas previas
              </label>
              <textarea
                name="historialDietasPrevias"
                className="form-control"
                rows="3"
                value={formData.historialDietasPrevias}
                onChange={handleChange}
                placeholder="Detalle las dietas o planes realizados anteriormente..."
              />
            </div>

            {/* Resultados de dietas previas */}
            <div className="col-md-6">
              <label className="form-label fw-semibold text-secondary">
                Resultados de dietas previas
              </label>
              <textarea
                name="resultadosDietasPrevias"
                className="form-control"
                rows="3"
                value={formData.resultadosDietasPrevias}
                onChange={handleChange}
                placeholder="Adherencia, descenso de peso, efecto rebote, etc."
              />
            </div>
          </div>

          <div className="d-flex justify-content-end gap-2 mt-4">
            <CustomButton
              type="button"
              variant="secondary"
              onClick={() => navigate("/habitos-alimentarios")}
            >
              Cancelar
            </CustomButton>
            <CustomButton type="submit" disabled={guardando}>
              {guardando ? "Guardando..." : "Guardar Hábitos"}
            </CustomButton>
          </div>
        </form>
      </div>
    </div>
  );
};
