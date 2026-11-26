import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CustomInput } from "../ui/CustomInput.jsx";
import { CustomSelect } from "../ui/CustomSelect.jsx";
import { CustomSelectSimple } from "../ui/CustomSelectSimple.jsx";
import { CustomTextarea } from "../ui/CustomTextarea.jsx";
import { CustomButton } from "../ui/CustomButton.jsx";
import clientesAxios from "../../config/axios.js";
import { PARAMETROS_LISTADO_COMPLETO } from "../../utils/paginacion.js";

const OPCIONES_ACTIVIDAD_FISICA = [
  { value: "sedentarismo", label: "Sedentarismo" },
  { value: "ligero", label: "Ligero" },
  { value: "moderado", label: "Moderado" },
  { value: "intenso", label: "Intenso" },
];

const OPCIONES_NIVEL_ESTRES = [
  { value: "bajo", label: "Bajo" },
  { value: "medio", label: "Medio" },
  { value: "alto", label: "Alto" },
];

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
        const { data } = await clientesAxios.get("/pacientes", {
          params: PARAMETROS_LISTADO_COMPLETO,
        });
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

  const opcionesPacientes = useMemo(
    () =>
      pacientes.map((pac) => ({
        value: pac._id,
        label: `${pac.apellido || ""}, ${pac.nombre || ""}${
          pac.dni ? ` - DNI: ${pac.dni}` : ""
        }`,
      })),
    [pacientes],
  );

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
            <div className="col-md-6">
              <CustomSelect
                label="Paciente *"
                id="pacienteId"
                name="pacienteId"
                value={formData.pacienteId}
                options={opcionesPacientes}
                disabled={loadingPacientes}
                required
                placeholder={
                  loadingPacientes
                    ? "Cargando pacientes..."
                    : "Escriba apellido, nombre o DNI..."
                }
                onChange={handleChange}
              />
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
              <CustomSelectSimple
                label="Nivel de actividad física"
                id="nivelActividadFisica"
                name="nivelActividadFisica"
                value={formData.nivelActividadFisica}
                options={OPCIONES_ACTIVIDAD_FISICA}
                onChange={handleChange}
              />
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
              <CustomSelectSimple
                label="Nivel de estrés percibido"
                id="nivelEstres"
                name="nivelEstres"
                value={formData.nivelEstres}
                options={OPCIONES_NIVEL_ESTRES}
                onChange={handleChange}
              />
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
              <CustomTextarea
                label="Historial de dietas previas"
                id="historialDietasPrevias"
                name="historialDietasPrevias"
                rows={3}
                value={formData.historialDietasPrevias}
                onChange={handleChange}
                placeholder="Detalle las dietas o planes realizados anteriormente..."
              />
            </div>

            <div className="col-md-6">
              <CustomTextarea
                label="Resultados de dietas previas"
                id="resultadosDietasPrevias"
                name="resultadosDietasPrevias"
                rows={3}
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
