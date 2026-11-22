import { useEffect, useMemo, useState } from "react";
import clientesAxios from "../../config/axios.js";
import { CustomInput } from "../ui/CustomInput.jsx";
import { CustomSelect } from "../ui/CustomSelect.jsx";
import { CustomButton } from "../ui/CustomButton.jsx";

const ADVERTENCIAS_DEFAULT = [
  "Descremado NO siempre es sinónimo de Light. Se sugiere como elección alimentos rotulados como Descremado y/o aquellos productos Light con la leyenda bajo en grasas o grasas 0%.",
  "La cocción del huevo y la carne debe ser completa. No ingerirlos crudos o semicruidos.",
  "Las hortalizas y frutas que se ingieren crudas, se recomienda lavarlas con abundante agua segura, después de una correcta higiene de manos. Si se fraccionan sobre tablas, que las mismas, sean exclusivas para estos alimentos, o bien utilizar otro elemento que NO sea de madera ni de plástico.",
];

const filaVacia = () => ({
  categoria: "",
  seleccion: "",
  metodoPreparacion: "",
});

const toInputDate = (valor) => {
  if (!valor) return "";
  const d = new Date(valor);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().split("T")[0];
};

const extraerId = (campo) => {
  if (!campo) return "";
  return typeof campo === "object" ? campo._id || "" : campo;
};

export const FormularioPlanComidas = ({
  tituloFormulario = "Registrar Plan de Comidas",
  initialData = null,
  onSubmit,
  onCancel,
  submitting = false,
  submitLabel = "Guardar Plan",
}) => {
  const [pacientes, setPacientes] = useState([]);
  const [consultas, setConsultas] = useState([]);

  const [patientId, setPatientId] = useState(() =>
    extraerId(initialData?.patientId),
  );
  const [consultationId, setConsultationId] = useState(() =>
    extraerId(initialData?.consultationId),
  );
  const [titulo, setTitulo] = useState(() => initialData?.titulo || "");
  const [fechaEntrega, setFechaEntrega] = useState(
    () => toInputDate(initialData?.fechaEntrega) || toInputDate(new Date()),
  );
  const [fechaInicioVigencia, setFechaInicioVigencia] = useState(() =>
    toInputDate(initialData?.fechaInicioVigencia),
  );
  const [fechaFinRevision, setFechaFinRevision] = useState(() =>
    toInputDate(initialData?.fechaFinRevision),
  );
  const [planActivo, setPlanActivo] = useState(() =>
    initialData?.planActivo !== undefined
      ? Boolean(initialData.planActivo)
      : true,
  );

  const [objetivosMacros, setObjetivosMacros] = useState(() => ({
    caloriasDiarias: initialData?.objetivosMacros?.caloriasDiarias ?? "",
    proteinasGramos: initialData?.objetivosMacros?.proteinasGramos ?? "",
    carbohidratosGramos:
      initialData?.objetivosMacros?.carbohidratosGramos ?? "",
    grasasGramos: initialData?.objetivosMacros?.grasasGramos ?? "",
  }));

  const [grupoDeAlimentos, setGrupoDeAlimentos] = useState(() =>
    Array.isArray(initialData?.grupoDeAlimentos) &&
    initialData.grupoDeAlimentos.length > 0
      ? initialData.grupoDeAlimentos.map((f) => ({
          categoria: f.categoria || "",
          seleccion: f.seleccion || "",
          metodoPreparacion: f.metodoPreparacion || "",
        }))
      : [filaVacia()],
  );

  const [advertencias, setAdvertencias] = useState(() =>
    Array.isArray(initialData?.advertencias)
      ? initialData.advertencias
      : ADVERTENCIAS_DEFAULT,
  );
  const [nuevaAdvertencia, setNuevaAdvertencia] = useState("");
  const [errorLocal, setErrorLocal] = useState("");

  useEffect(() => {
    let ignore = false;

    const cargarCatalogos = async () => {
      try {
        const [resPac, resCons] = await Promise.all([
          clientesAxios.get("/pacientes"),
          clientesAxios.get("/consulta").catch(() => ({ data: [] })),
        ]);
        if (ignore) return;

        const listaPac = Array.isArray(resPac.data)
          ? resPac.data
          : resPac.data?.data || [];
        const listaCons = Array.isArray(resCons.data)
          ? resCons.data
          : resCons.data?.data || [];
        setPacientes(listaPac);
        setConsultas(listaCons);
      } catch {
        // Continúa aunque falle algún catálogo
      }
    };

    cargarCatalogos();
    return () => {
      ignore = true;
    };
  }, []);

  const opcionesPacientes = useMemo(
    () =>
      pacientes.map((pac) => ({
        value: pac._id,
        label: `${`${pac.nombre || ""} ${pac.apellido || ""}`.trim()}${
          pac.dni ? ` (DNI ${pac.dni})` : ""
        }`,
      })),
    [pacientes],
  );

  const opcionesConsultas = useMemo(() => {
    const filtradas = patientId
      ? consultas.filter(
          (c) =>
            !c.patientId ||
            String(extraerId(c.patientId)) === String(patientId),
        )
      : consultas;

    return filtradas.map((cons) => {
      const fecha = cons.fecha ? toInputDate(cons.fecha) : "";
      const detalle =
        cons.motivo || cons.observaciones || cons.diagnostico || "Consulta";
      return {
        value: cons._id,
        label: fecha ? `${fecha} - ${detalle}` : detalle,
      };
    });
  }, [consultas, patientId]);

  const handleMacroChange = (e) => {
    const { name, value } = e.target;
    setObjetivosMacros((prev) => ({ ...prev, [name]: value }));
  };

  const handleFilaChange = (index, field, value) => {
    setGrupoDeAlimentos((prev) =>
      prev.map((fila, idx) =>
        idx === index ? { ...fila, [field]: value } : fila,
      ),
    );
  };

  const agregarFila = () => {
    setGrupoDeAlimentos((prev) => [...prev, filaVacia()]);
  };

  const quitarFila = (index) => {
    setGrupoDeAlimentos((prev) =>
      prev.length > 1 ? prev.filter((_, idx) => idx !== index) : [filaVacia()],
    );
  };

  const agregarAdvertencia = () => {
    const texto = nuevaAdvertencia.trim();
    if (!texto) return;
    setAdvertencias((prev) => [...prev, texto]);
    setNuevaAdvertencia("");
  };

  const quitarAdvertencia = (index) => {
    setAdvertencias((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setErrorLocal("");

    if (!patientId) {
      setErrorLocal("Seleccioná un paciente.");
      return;
    }
    if (!titulo.trim()) {
      setErrorLocal("Ingresá un título para el plan de comidas.");
      return;
    }
    if (!fechaInicioVigencia) {
      setErrorLocal("Indicá la fecha de inicio de vigencia.");
      return;
    }

    const filasLimpias = grupoDeAlimentos
      .filter((f) => f.categoria.trim() && f.seleccion.trim())
      .map((f) => ({
        categoria: f.categoria.trim().toUpperCase(),
        seleccion: f.seleccion.trim(),
        metodoPreparacion: f.metodoPreparacion.trim(),
      }));

    const payload = {
      patientId,
      consultationId: consultationId || null,
      titulo: titulo.trim(),
      fechaEntrega: fechaEntrega || new Date().toISOString(),
      fechaInicioVigencia,
      fechaFinRevision: fechaFinRevision || null,
      planActivo,
      objetivosMacros: {
        caloriasDiarias:
          objetivosMacros.caloriasDiarias !== ""
            ? Number(objetivosMacros.caloriasDiarias)
            : null,
        proteinasGramos:
          objetivosMacros.proteinasGramos !== ""
            ? Number(objetivosMacros.proteinasGramos)
            : null,
        carbohidratosGramos:
          objetivosMacros.carbohidratosGramos !== ""
            ? Number(objetivosMacros.carbohidratosGramos)
            : null,
        grasasGramos:
          objetivosMacros.grasasGramos !== ""
            ? Number(objetivosMacros.grasasGramos)
            : null,
      },
      grupoDeAlimentos: filasLimpias,
      advertencias,
    };

    onSubmit(payload);
  };

  return (
    <div className="container py-4">
      <div className="card shadow-sm border-0 p-4 rounded-4">
        <h3 className="fw-bold text-success mb-4">{tituloFormulario}</h3>

        {errorLocal && (
          <div className="alert alert-danger py-2 small mb-3" role="alert">
            {errorLocal}
          </div>
        )}

        <form onSubmit={handleFormSubmit}>
          {/* Datos generales y vigencia */}
          <div className="row g-3">
            <div className="col-md-6">
              <CustomSelect
                id="patientId"
                name="patientId"
                label="Paciente *"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                options={opcionesPacientes}
                required
              />
            </div>

            <div className="col-md-6">
              <CustomSelect
                id="consultationId"
                name="consultationId"
                label="Consulta asociada (opcional)"
                value={consultationId}
                onChange={(e) => setConsultationId(e.target.value)}
                options={opcionesConsultas}
                placeholder="Buscar consulta o dejar vacío..."
              />
            </div>

            <div className="col-12">
              <CustomInput
                id="tituloPlan"
                label="Título del plan *"
                placeholder="Ej: Plan hipocalórico, normoproteico y preventivo..."
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                required
              />
            </div>

            <div className="col-md-4">
              <CustomInput
                id="fechaEntrega"
                label="Fecha de entrega"
                type="date"
                value={fechaEntrega}
                onChange={(e) => setFechaEntrega(e.target.value)}
              />
            </div>

            <div className="col-md-4">
              <CustomInput
                id="fechaInicioVigencia"
                label="Inicio de vigencia *"
                type="date"
                value={fechaInicioVigencia}
                onChange={(e) => setFechaInicioVigencia(e.target.value)}
                required
              />
            </div>

            <div className="col-md-4">
              <CustomInput
                id="fechaFinRevision"
                label="Revisión / Fin estimado"
                type="date"
                value={fechaFinRevision}
                onChange={(e) => setFechaFinRevision(e.target.value)}
              />
            </div>

            <div className="col-12">
              <div className="form-check mb-2">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="planActivoCheck"
                  checked={planActivo}
                  onChange={(e) => setPlanActivo(e.target.checked)}
                />
                <label
                  className="form-check-label fw-medium"
                  htmlFor="planActivoCheck"
                >
                  Marcar como plan activo vigente del paciente
                </label>
              </div>
            </div>
          </div>

          <hr className="my-4" />

          {/* Objetivos diarios de macronutrientes */}
          <h6 className="fw-semibold text-secondary mb-3">
            Objetivos Diarios de Macronutrientes
          </h6>
          <div className="row g-3">
            <div className="col-sm-6 col-md-3">
              <CustomInput
                id="caloriasDiarias"
                name="caloriasDiarias"
                label="Calorías (kcal)"
                type="number"
                min="0"
                placeholder="Ej: 1800"
                value={objetivosMacros.caloriasDiarias}
                onChange={handleMacroChange}
              />
            </div>

            <div className="col-sm-6 col-md-3">
              <CustomInput
                id="proteinasGramos"
                name="proteinasGramos"
                label="Proteínas (g)"
                type="number"
                min="0"
                step="0.1"
                placeholder="Ej: 95"
                value={objetivosMacros.proteinasGramos}
                onChange={handleMacroChange}
              />
            </div>

            <div className="col-sm-6 col-md-3">
              <CustomInput
                id="carbohidratosGramos"
                name="carbohidratosGramos"
                label="Carbohidratos (g)"
                type="number"
                min="0"
                step="0.1"
                placeholder="Ej: 200"
                value={objetivosMacros.carbohidratosGramos}
                onChange={handleMacroChange}
              />
            </div>

            <div className="col-sm-6 col-md-3">
              <CustomInput
                id="grasasGramos"
                name="grasasGramos"
                label="Grasas (g)"
                type="number"
                min="0"
                step="0.1"
                placeholder="Ej: 55"
                value={objetivosMacros.grasasGramos}
                onChange={handleMacroChange}
              />
            </div>
          </div>

          <hr className="my-4" />

          {/* Grupos de alimentos */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6 className="fw-semibold text-secondary m-0">
              Grupos de Alimentos
            </h6>
            <CustomButton
              variant="outline"
              className="btn-sm"
              onClick={agregarFila}
            >
              + Agregar fila
            </CustomButton>
          </div>

          {grupoDeAlimentos.map((fila, idx) => (
            <div
              className="row g-2 align-items-end mb-3 pb-2 border-bottom"
              key={idx}
            >
              <div className="col-md-3">
                <CustomInput
                  id={`categoria-${idx}`}
                  label="Categoría"
                  placeholder="YOGURT/LECHE, CARNE..."
                  value={fila.categoria}
                  onChange={(e) =>
                    handleFilaChange(idx, "categoria", e.target.value)
                  }
                  className="mb-2"
                />
              </div>

              <div className="col-md-4">
                <CustomInput
                  id={`seleccion-${idx}`}
                  label="Selección"
                  placeholder="Preferentemente descremado..."
                  value={fila.seleccion}
                  onChange={(e) =>
                    handleFilaChange(idx, "seleccion", e.target.value)
                  }
                  className="mb-2"
                />
              </div>

              <div className="col-md-4">
                <CustomInput
                  id={`metodo-${idx}`}
                  label="Método de preparación"
                  placeholder="Solo, con frutas, al horno..."
                  value={fila.metodoPreparacion}
                  onChange={(e) =>
                    handleFilaChange(idx, "metodoPreparacion", e.target.value)
                  }
                  className="mb-2"
                />
              </div>

              <div className="col-md-1 mb-2">
                <CustomButton
                  variant="danger"
                  fullWidth
                  onClick={() => quitarFila(idx)}
                  title="Quitar fila"
                >
                  ✕
                </CustomButton>
              </div>
            </div>
          ))}

          <hr className="my-4" />

          {/* Advertencias y recomendaciones */}
          <h6 className="fw-semibold text-secondary mb-3">
            Advertencias y Recomendaciones
          </h6>

          <ul className="list-group mb-3">
            {advertencias.map((adv, idx) => (
              <li
                className="list-group-item d-flex justify-content-between align-items-start gap-2"
                key={idx}
              >
                <span className="small">{adv}</span>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => quitarAdvertencia(idx)}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>

          <div className="row g-2 align-items-end mb-4">
            <div className="col-md-10">
              <CustomInput
                id="nuevaAdvertencia"
                label="Nueva advertencia o recomendación"
                placeholder="Escriba una recomendación adicional..."
                value={nuevaAdvertencia}
                onChange={(e) => setNuevaAdvertencia(e.target.value)}
                className="mb-0"
              />
            </div>
            <div className="col-md-2">
              <CustomButton
                variant="outline"
                fullWidth
                onClick={agregarAdvertencia}
              >
                + Agregar
              </CustomButton>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="d-flex justify-content-end gap-2 pt-2">
            {onCancel && (
              <CustomButton variant="secondary" onClick={onCancel}>
                Cancelar
              </CustomButton>
            )}
            <CustomButton type="submit" variant="primary" loading={submitting}>
              {submitLabel}
            </CustomButton>
          </div>
        </form>
      </div>
    </div>
  );
};
