import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CustomInput } from "../ui/CustomInput.jsx";
import { CustomButton } from "../ui/CustomButton";
import clientesAxios from "../../config/axios.js";

export const EditarHabitos = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
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
    nivelActividadFisica: "sedentario",
    horasSuenoNocturno: 7,
    nivelEstres: "bajo",
  });

  useEffect(() => {
    let activo = true;

    const cargarDatos = async () => {
      try {
        const [resHabitos, resPacientes] = await Promise.all([
          clientesAxios.get(`/habitos/${id}`),
          clientesAxios.get("/pacientes"),
        ]);

        if (!activo) return;

        const registro = resHabitos.data.data || resHabitos.data;
        const listaPacientes = Array.isArray(resPacientes.data)
          ? resPacientes.data
          : resPacientes.data.data || resPacientes.data.pacientes || [];

        setPacientes(listaPacientes);
        setFormData({
          pacienteId:
            typeof registro.pacienteId === "object"
              ? registro.pacienteId?._id || ""
              : registro.pacienteId || "",
          cantidadComidasDiarias: registro.cantidadComidasDiarias ?? 4,
          consumoAguaDiarioLitros: registro.consumoAguaDiarioLitros ?? 2,
          alimentosPreferidos: Array.isArray(registro.alimentosPreferidos)
            ? registro.alimentosPreferidos.join(", ")
            : registro.alimentosPreferidos || "",
          alimentosRechazados: Array.isArray(registro.alimentosRechazados)
            ? registro.alimentosRechazados.join(", ")
            : registro.alimentosRechazados || "",
          historialDietasPrevias: registro.historialDietasPrevias || "",
          resultadosDietasPrevias: registro.resultadosDietasPrevias || "",
          nivelActividadFisica: registro.nivelActividadFisica || "sedentario",
          horasSuenoNocturno: registro.horasSuenoNocturno ?? 7,
          nivelEstres: registro.nivelEstres || "bajo",
        });
      } catch (err) {
        if (!activo) return;
        console.error("Error al cargar datos para editar:", err);
        setErrorMsg("No se pudieron cargar los datos de hábitos alimentarios.");
      } finally {
        if (activo) setLoading(false);
      }
    };

    cargarDatos();
    return () => {
      activo = false;
    };
  }, [id]);

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

      await clientesAxios.put(`/habitos/actualizar/${id}`, payload);
      navigate("/habitos-alimentarios");
    } catch (err) {
      console.error("Error al actualizar hábitos alimentarios:", err);
      setErrorMsg(
        err.response?.data?.mensaje ||
          "Error al actualizar los hábitos alimentarios.",
      );
    } finally {
      setGuardando(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-4">
        <div className="card shadow-sm border-0 p-4 rounded-4">
          <p className="text-muted mb-0">Cargando formulario de edición...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="card shadow-sm border-0 p-4 rounded-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="fw-bold text-success mb-0">
            Editar Hábitos Alimentarios
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
            <div className="col-md-6">
              <label className="form-label fw-semibold text-secondary">
                Paciente *
              </label>
              <select
                name="pacienteId"
                className="form-select"
                value={formData.pacienteId}
                onChange={handleChange}
                required
              >
                <option value="">Seleccioná un paciente</option>
                {pacientes.map((pac) => (
                  <option key={pac._id} value={pac._id}>
                    {pac.apellido}, {pac.nombre}
                    {pac.dni ? ` - DNI: ${pac.dni}` : ""}
                  </option>
                ))}
              </select>
            </div>

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
                <option value="sedentario">Sedentario</option>
                <option value="ligero">Ligero</option>
                <option value="moderado">Moderado</option>
                <option value="intenso">Intenso</option>
              </select>
            </div>

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

            <div className="col-md-6">
              <CustomInput
                label="Alimentos preferidos (separados por coma)"
                name="alimentosPreferidos"
                value={formData.alimentosPreferidos}
                onChange={handleChange}
                placeholder="Ej: pollo, arroz integral, palta, frutas"
              />
            </div>

            <div className="col-md-6">
              <CustomInput
                label="Alimentos que rechaza (separados por coma)"
                name="alimentosRechazados"
                value={formData.alimentosRechazados}
                onChange={handleChange}
                placeholder="Ej: brócoli, pescado, picantes"
              />
            </div>

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
              />
            </div>

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
              {guardando ? "Actualizando..." : "Guardar Cambios"}
            </CustomButton>
          </div>
        </form>
      </div>
    </div>
  );
};
