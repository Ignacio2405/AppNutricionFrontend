import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CustomInput } from "../ui/CustomInput.jsx";
import { CustomSelect } from "../ui/CustomSelect.jsx";
import { CustomTextarea } from "../ui/CustomTextarea.jsx";
import { CustomButton } from "../ui/CustomButton.jsx";
import clientesAxios from "../../config/axios.js";
import { PARAMETROS_LISTADO_COMPLETO } from "../../utils/paginacion.js";

const toInputDate = (fecha) => {
  if (!fecha) return "";
  const d = new Date(fecha);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString().split("T")[0];
};

const toInputNumber = (val) =>
  val === null || val === undefined ? "" : String(val);

export const EditarLaboratorio = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [formData, setFormData] = useState({
    pacienteId: "",
    fechaEstudio: "",
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

    const cargarDatos = async () => {
      try {
        const [resLab, resPacientes] = await Promise.all([
          clientesAxios.get(`/resultados-laboratorio/${id}`),
          clientesAxios.get("/pacientes", {
            params: PARAMETROS_LISTADO_COMPLETO,
          }),
        ]);

        if (!activo) return;

        const registro = resLab.data.data || resLab.data;
        const listaPacientes = Array.isArray(resPacientes.data)
          ? resPacientes.data
          : resPacientes.data.data || resPacientes.data.pacientes || [];

        setPacientes(listaPacientes);
        setFormData({
          pacienteId:
            typeof registro.pacienteId === "object"
              ? registro.pacienteId?._id || ""
              : registro.pacienteId || "",
          fechaEstudio: toInputDate(registro.fechaEstudio),
          glucemia: toInputNumber(registro.glucemia),
          colesterolTotal: toInputNumber(registro.colesterolTotal),
          colesterolHdl: toInputNumber(registro.colesterolHdl),
          colesterolLdl: toInputNumber(registro.colesterolLdl),
          trigliceridos: toInputNumber(registro.trigliceridos),
          hemoglobinaGlicosilada: toInputNumber(
            registro.hemoglobinaGlicosilada,
          ),
          tsh: toInputNumber(registro.tsh),
          observacionesLaboratorio: registro.observacionesLaboratorio || "",
          dietaryRecall24h: registro.dietaryRecall24h || "",
          notasNutricionista: registro.notasNutricionista || "",
        });
      } catch (err) {
        if (!activo) return;
        console.error("Error al cargar datos para editar laboratorio:", err);
        setErrorMsg("No se pudieron cargar los datos del laboratorio.");
      } finally {
        if (activo) setLoading(false);
      }
    };

    cargarDatos();
    return () => {
      activo = false;
    };
  }, [id]);

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
      await clientesAxios.put(`/resultados-laboratorio/${id}`, formData);
      navigate("/resultados-laboratorio");
    } catch (err) {
      console.error("Error al actualizar laboratorio:", err);
      const detalle = Array.isArray(err.response?.data?.errores)
        ? ` (${err.response.data.errores.join(" - ")})`
        : "";
      setErrorMsg(
        (err.response?.data?.mensaje ||
          "Error al actualizar los resultados de laboratorio.") + detalle,
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
            Editar Resultados de Laboratorio
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
            <div className="col-md-8">
              <CustomSelect
                label="Paciente *"
                id="pacienteId"
                name="pacienteId"
                value={formData.pacienteId}
                options={opcionesPacientes}
                required
                placeholder="Escriba apellido, nombre o DNI..."
                onChange={handleChange}
              />
            </div>

            <div className="col-md-4">
              <CustomInput
                label="Fecha del estudio"
                type="date"
                name="fechaEstudio"
                value={formData.fechaEstudio}
                onChange={handleChange}
              />
            </div>

            <div className="col-sm-6 col-md-3">
              <CustomInput
                label="Glucemia (mg/dL)"
                type="number"
                step="0.1"
                min="0"
                name="glucemia"
                value={formData.glucemia}
                onChange={handleChange}
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
              />
            </div>

            <div className="col-12">
              <CustomTextarea
                label="Observaciones generales del laboratorio"
                id="observacionesLaboratorio"
                name="observacionesLaboratorio"
                rows={2}
                value={formData.observacionesLaboratorio}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-6">
              <CustomTextarea
                label="Recordatorio de 24 horas (Dietary Recall 24h)"
                id="dietaryRecall24h"
                name="dietaryRecall24h"
                rows={4}
                value={formData.dietaryRecall24h}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-6">
              <CustomTextarea
                label="Notas clínicas y observaciones del nutricionista"
                id="notasNutricionista"
                name="notasNutricionista"
                rows={4}
                value={formData.notasNutricionista}
                onChange={handleChange}
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
              {guardando ? "Actualizando..." : "Guardar Cambios"}
            </CustomButton>
          </div>
        </form>
      </div>
    </div>
  );
};
