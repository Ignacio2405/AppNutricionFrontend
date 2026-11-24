import { useEffect, useMemo, useState } from "react";
import clientesAxios from "../../config/axios.js";
import { CustomInput } from "../ui/CustomInput.jsx";
import { CustomSelect } from "../ui/CustomSelect.jsx";
import { CustomButton } from "../ui/CustomButton.jsx";

const ADVERTENCIAS_DEFAULT = [
  "Descremado NO siempre es sinónimo de Light. Se sugiere elegir alimentos rotulados como Descremado y/o aquellos productos Light con la leyenda bajo en grasas o grasas 0%.",
  "La cocción del huevo y la carne debe ser completa. No ingerirlos crudos o semicruidos.",
  "Las hortalizas y frutas que se ingieren crudas, se recomienda lavarlas con abundante agua segura, después de una correcta higiene de manos. Si se fraccionan sobre tablas, que las mismas, sean exclusivas para estos alimentos o bien utilizar otro elemento que NO sea de madera ni de plástico.",
];

const OPCIONES_MOMENTO = [
  { value: "DESAYUNO_MERIENDA", label: "Desayuno y merienda" },
  { value: "ALMUERZO_CENA", label: "Almuerzo y cena" },
  { value: "COLACION", label: "Colación" },
];

const extraerId = (campo) => {
  if (!campo) return "";
  return typeof campo === "object"
    ? String(campo._id || campo.id || "")
    : String(campo);
};

const toInputDate = (valor) => {
  if (!valor) return "";
  const d = new Date(valor);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().split("T")[0];
};

const formatearEtiquetaConsulta = (consulta) => {
  const fechaTexto = consulta.fecha ? toInputDate(consulta.fecha) : "";
  const horaTexto = consulta.hora ? ` ${consulta.hora}` : "";
  const detalle =
    consulta.observaciones || consulta.motivo || "Consulta médica";
  const fechaHora = `${fechaTexto}${horaTexto}`.trim();

  return fechaHora ? `${fechaHora} — ${detalle}` : detalle;
};

const filaAlimentoVacia = () => ({
  categoria: "",
  seleccion: "",
  metodoPreparacion: "",
});

const equivalenciaVacia = () => ({
  momento: "DESAYUNO_MERIENDA",
  rubro: "",
  porcionesEquivalencias: "",
  opcionesOPreparaciones: "",
});

const recetaVacia = () => ({
  nombre: "",
  ingredientes: "",
  preparacion: "",
});

const parsearNumeroOpcional = (valor) => {
  if (valor === "" || valor === null || valor === undefined) return null;
  const num = Number(valor);
  return Number.isNaN(num) ? null : num;
};

export const FormularioPlanComidas = ({
  initialData = null,
  onSubmit,
  onCancel,
  submitting = false,
  submitLabel = "Crear Plan de Comidas",
}) => {
  const pacienteInicial = extraerId(
    initialData?.patientId || initialData?.pacienteId || initialData?.paciente,
  );

  const [pacientes, setPacientes] = useState([]);
  const [consultasPaciente, setConsultasPaciente] = useState([]);
  const [cargandoConsultas, setCargandoConsultas] = useState(() =>
    Boolean(pacienteInicial),
  );

  const [patientId, setPatientId] = useState(pacienteInicial);
  const [consultationId, setConsultationId] = useState(() =>
    extraerId(
      initialData?.consultationId ||
        initialData?.consultaId ||
        initialData?.consulta,
    ),
  );

  const [titulo, setTitulo] = useState(() => initialData?.titulo || "");
  const [tipoPlan, setTipoPlan] = useState(() => initialData?.tipoPlan || "");
  const [fechaEntrega, setFechaEntrega] = useState(
    () => toInputDate(initialData?.fechaEntrega) || toInputDate(new Date()),
  );
  const [fechaInicioVigencia, setFechaInicioVigencia] = useState(() =>
    toInputDate(initialData?.fechaInicioVigencia || initialData?.fechaInicio),
  );
  const [fechaFinRevision, setFechaFinRevision] = useState(() =>
    toInputDate(initialData?.fechaFinRevision || initialData?.fechaFin),
  );
  const [planActivo, setPlanActivo] = useState(() =>
    initialData?.planActivo !== undefined
      ? Boolean(initialData.planActivo)
      : true,
  );

  const [caloriasDiarias, setCaloriasDiarias] = useState(() =>
    initialData?.objetivosMacros?.caloriasDiarias !== undefined &&
    initialData?.objetivosMacros?.caloriasDiarias !== null
      ? String(initialData.objetivosMacros.caloriasDiarias)
      : "",
  );
  const [proteinasGramos, setProteinasGramos] = useState(() =>
    initialData?.objetivosMacros?.proteinasGramos !== undefined &&
    initialData?.objetivosMacros?.proteinasGramos !== null
      ? String(initialData.objetivosMacros.proteinasGramos)
      : "",
  );
  const [carbohidratosGramos, setCarbohidratosGramos] = useState(() =>
    initialData?.objetivosMacros?.carbohidratosGramos !== undefined &&
    initialData?.objetivosMacros?.carbohidratosGramos !== null
      ? String(initialData.objetivosMacros.carbohidratosGramos)
      : "",
  );
  const [grasasGramos, setGrasasGramos] = useState(() =>
    initialData?.objetivosMacros?.grasasGramos !== undefined &&
    initialData?.objetivosMacros?.grasasGramos !== null
      ? String(initialData.objetivosMacros.grasasGramos)
      : "",
  );

  const [grupoDeAlimentos, setGrupoDeAlimentos] = useState(() =>
    Array.isArray(initialData?.grupoDeAlimentos) &&
    initialData.grupoDeAlimentos.length > 0
      ? initialData.grupoDeAlimentos.map((item) => ({
          categoria: item.categoria || "",
          seleccion: item.seleccion || "",
          metodoPreparacion: item.metodoPreparacion || "",
        }))
      : [filaAlimentoVacia()],
  );

  const [distribucionEquivalencias, setDistribucionEquivalencias] = useState(
    () =>
      Array.isArray(initialData?.distribucionEquivalencias) &&
      initialData.distribucionEquivalencias.length > 0
        ? initialData.distribucionEquivalencias.map((eq) => ({
            momento: eq.momento || "DESAYUNO_MERIENDA",
            rubro: eq.rubro || "",
            porcionesEquivalencias: eq.porcionesEquivalencias || "",
            opcionesOPreparaciones: eq.opcionesOPreparaciones || "",
          }))
        : [equivalenciaVacia()],
  );

  const [recetasEjemplos, setRecetasEjemplos] = useState(() =>
    Array.isArray(initialData?.recetasEjemplos) &&
    initialData.recetasEjemplos.length > 0
      ? initialData.recetasEjemplos.map((rec) => ({
          nombre: rec.nombre || "",
          ingredientes: rec.ingredientes || "",
          preparacion: rec.preparacion || "",
        }))
      : [],
  );

  const [recomendacionesGenerales, setRecomendacionesGenerales] = useState(
    () =>
      Array.isArray(initialData?.recomendacionesGenerales)
        ? initialData.recomendacionesGenerales
        : [],
  );
  const [nuevaRecomendacion, setNuevaRecomendacion] = useState("");

  const [advertencias, setAdvertencias] = useState(() =>
    Array.isArray(initialData?.advertencias) &&
    initialData.advertencias.length > 0
      ? initialData.advertencias
      : ADVERTENCIAS_DEFAULT,
  );
  const [nuevaAdvertencia, setNuevaAdvertencia] = useState("");
  const [errorLocal, setErrorLocal] = useState("");

  // 1. Cargar pacientes
  useEffect(() => {
    let activo = true;

    const cargarPacientes = async () => {
      try {
        const { data } = await clientesAxios.get("/pacientes");
        if (!activo) return;

        const lista = Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.pacientes)
            ? data.pacientes
            : Array.isArray(data)
              ? data
              : [];

        setPacientes(lista);
      } catch (err) {
        console.error("Error al cargar pacientes:", err);
      }
    };

    cargarPacientes();
    return () => {
      activo = false;
    };
  }, []);

  // 2. Cargar consultas del paciente seleccionado (opcional)
  useEffect(() => {
    if (!patientId) return;

    let activo = true;

    const cargarConsultasDelPaciente = async () => {
      try {
        const { data } = await clientesAxios.get("/consulta", {
          params: { pacienteId: patientId },
        });
        if (!activo) return;

        const lista = Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.consultas)
            ? data.consultas
            : Array.isArray(data)
              ? data
              : [];

        const filtradas = lista.filter(
          (c) => extraerId(c.paciente || c.pacienteId) === String(patientId),
        );

        setConsultasPaciente(filtradas);
      } catch (err) {
        if (!activo) return;
        console.warn("No se pudieron cargar consultas del paciente:", err);
        setConsultasPaciente([]);
      } finally {
        if (activo) setCargandoConsultas(false);
      }
    };

    cargarConsultasDelPaciente();
    return () => {
      activo = false;
    };
  }, [patientId]);

  const opcionesPacientes = useMemo(
    () =>
      pacientes.map((p) => ({
        value: String(p._id),
        label: `${p.apellido || ""}, ${p.nombre || ""}${
          p.dni ? ` (DNI: ${p.dni})` : ""
        }`,
      })),
    [pacientes],
  );

  const opcionesConsultas = useMemo(
    () =>
      consultasPaciente.map((c) => ({
        value: String(c._id),
        label: formatearEtiquetaConsulta(c),
      })),
    [consultasPaciente],
  );

  const handlePacienteChange = (e) => {
    const nuevoPacienteId = String(e.target.value || "");
    setPatientId(nuevoPacienteId);
    setConsultationId("");
    setConsultasPaciente([]);
    setCargandoConsultas(Boolean(nuevoPacienteId));
  };

  // --- Handlers: Grupos de alimentos ---
  const handleAlimentoChange = (index, campo, valor) => {
    setGrupoDeAlimentos((prev) =>
      prev.map((item, idx) =>
        idx === index ? { ...item, [campo]: valor } : item,
      ),
    );
  };

  const agregarFilaAlimento = () => {
    setGrupoDeAlimentos((prev) => [...prev, filaAlimentoVacia()]);
  };

  const quitarFilaAlimento = (index) => {
    setGrupoDeAlimentos((prev) =>
      prev.length > 1
        ? prev.filter((_, idx) => idx !== index)
        : [filaAlimentoVacia()],
    );
  };

  // --- Handlers: Distribución y equivalencias ---
  const handleEquivalenciaChange = (index, campo, valor) => {
    setDistribucionEquivalencias((prev) =>
      prev.map((item, idx) =>
        idx === index ? { ...item, [campo]: valor } : item,
      ),
    );
  };

  const agregarEquivalencia = () => {
    setDistribucionEquivalencias((prev) => [...prev, equivalenciaVacia()]);
  };

  const quitarEquivalencia = (index) => {
    setDistribucionEquivalencias((prev) =>
      prev.length > 1
        ? prev.filter((_, idx) => idx !== index)
        : [equivalenciaVacia()],
    );
  };

  // --- Handlers: Recetas / ejemplos ---
  const handleRecetaChange = (index, campo, valor) => {
    setRecetasEjemplos((prev) =>
      prev.map((item, idx) =>
        idx === index ? { ...item, [campo]: valor } : item,
      ),
    );
  };

  const agregarReceta = () => {
    setRecetasEjemplos((prev) => [...prev, recetaVacia()]);
  };

  const quitarReceta = (index) => {
    setRecetasEjemplos((prev) => prev.filter((_, idx) => idx !== index));
  };

  // --- Handlers: Recomendaciones generales ---
  const agregarRecomendacion = () => {
    const texto = nuevaRecomendacion.trim();
    if (!texto) return;
    setRecomendacionesGenerales((prev) => [...prev, texto]);
    setNuevaRecomendacion("");
  };

  const quitarRecomendacion = (index) => {
    setRecomendacionesGenerales((prev) =>
      prev.filter((_, idx) => idx !== index),
    );
  };

  // --- Handlers: Advertencias ---
  const agregarAdvertencia = () => {
    const texto = nuevaAdvertencia.trim();
    if (!texto) return;
    setAdvertencias((prev) => [...prev, texto]);
    setNuevaAdvertencia("");
  };

  const quitarAdvertencia = (index) => {
    setAdvertencias((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorLocal("");

    if (!patientId) {
      setErrorLocal("Seleccioná un paciente para el plan de comidas.");
      return;
    }

    if (!titulo.trim()) {
      setErrorLocal("Ingresá el título del plan de comidas.");
      return;
    }

    if (!fechaInicioVigencia) {
      setErrorLocal("Seleccioná la fecha de inicio de vigencia.");
      return;
    }

    const alimentosLimpios = grupoDeAlimentos
      .map((item) => ({
        categoria: item.categoria.trim().toUpperCase(),
        seleccion: item.seleccion.trim(),
        metodoPreparacion: item.metodoPreparacion.trim(),
      }))
      .filter((item) => item.categoria && item.seleccion);

    const equivalenciasLimpias = distribucionEquivalencias
      .map((eq) => ({
        momento: eq.momento,
        rubro: eq.rubro.trim().toUpperCase(),
        porcionesEquivalencias: eq.porcionesEquivalencias.trim(),
        opcionesOPreparaciones: eq.opcionesOPreparaciones.trim(),
      }))
      .filter((eq) => eq.rubro && eq.porcionesEquivalencias);

    const recetasLimpias = recetasEjemplos
      .map((rec) => ({
        nombre: rec.nombre.trim(),
        ingredientes: rec.ingredientes.trim(),
        preparacion: rec.preparacion.trim(),
      }))
      .filter((rec) => rec.nombre);

    const payload = {
      patientId,
      consultationId: consultationId || null,
      titulo: titulo.trim(),
      tipoPlan: tipoPlan.trim(),
      fechaEntrega: fechaEntrega || new Date().toISOString(),
      fechaInicioVigencia,
      fechaFinRevision: fechaFinRevision || null,
      planActivo,
      objetivosMacros: {
        caloriasDiarias: parsearNumeroOpcional(caloriasDiarias),
        proteinasGramos: parsearNumeroOpcional(proteinasGramos),
        carbohidratosGramos: parsearNumeroOpcional(carbohidratosGramos),
        grasasGramos: parsearNumeroOpcional(grasasGramos),
      },
      grupoDeAlimentos: alimentosLimpios,
      distribucionEquivalencias: equivalenciasLimpias,
      recetasEjemplos: recetasLimpias,
      recomendacionesGenerales,
      advertencias,
    };

    onSubmit(payload);
  };

  return (
    <div className="card shadow-sm border-0 p-4 rounded-4">
      <h4 className="fw-bold text-success mb-4">Registrar Plan de Comidas</h4>

      {errorLocal && (
        <div className="alert alert-danger py-2 small mb-3" role="alert">
          {errorLocal}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Paciente y Consulta asociada */}
        <div className="row g-3 mb-2">
          <div className="col-md-6">
            <CustomSelect
              id="patientId"
              name="patientId"
              label="Paciente *"
              value={patientId}
              onChange={handlePacienteChange}
              options={opcionesPacientes}
              placeholder="Escriba para buscar o seleccione..."
              required
            />
          </div>

          <div className="col-md-6">
            <CustomSelect
              id="consultationId"
              name="consultationId"
              label={
                cargandoConsultas
                  ? "Consulta asociada (cargando...)"
                  : "Consulta asociada (opcional)"
              }
              value={consultationId}
              onChange={(e) => setConsultationId(e.target.value)}
              options={opcionesConsultas}
              disabled={!patientId || cargandoConsultas}
              placeholder={
                !patientId
                  ? "Buscar consulta o dejar vacío..."
                  : opcionesConsultas.length === 0
                    ? "Sin consultas asociadas (opcional)"
                    : "Buscar consulta o dejar vacío..."
              }
            />
          </div>
        </div>

        {/* Título y Tipo de plan */}
        <div className="row g-3 mb-2">
          <div className="col-md-8">
            <CustomInput
              id="titulo"
              name="titulo"
              label="Título del plan *"
              placeholder="Ej: Plan alimentario hipercalórico..."
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              required
            />
          </div>

          <div className="col-md-4">
            <CustomInput
              id="tipoPlan"
              name="tipoPlan"
              label="Tipo de plan"
              placeholder="Ej: Hipercalórico, Hipocalórico..."
              value={tipoPlan}
              onChange={(e) => setTipoPlan(e.target.value)}
            />
          </div>
        </div>

        {/* Fechas */}
        <div className="row g-3 mb-2">
          <div className="col-md-4">
            <CustomInput
              id="fechaEntrega"
              name="fechaEntrega"
              label="Fecha de entrega"
              type="date"
              value={fechaEntrega}
              onChange={(e) => setFechaEntrega(e.target.value)}
            />
          </div>

          <div className="col-md-4">
            <CustomInput
              id="fechaInicioVigencia"
              name="fechaInicioVigencia"
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
              name="fechaFinRevision"
              label="Revisión / Fin estimado"
              type="date"
              value={fechaFinRevision}
              onChange={(e) => setFechaFinRevision(e.target.value)}
            />
          </div>
        </div>

        {/* Plan activo */}
        <div className="form-check mb-4">
          <input
            id="planActivo"
            name="planActivo"
            type="checkbox"
            className="form-check-input"
            checked={planActivo}
            onChange={(e) => setPlanActivo(e.target.checked)}
          />
          <label htmlFor="planActivo" className="form-check-label">
            Marcar como plan activo vigente del paciente
          </label>
        </div>

        <hr className="my-4" />

        {/* Objetivos diarios de macronutrientes */}
        <h6 className="fw-semibold text-secondary mb-3">
          Objetivos Diarios de Macronutrientes
        </h6>
        <div className="row g-3 mb-3">
          <div className="col-md-3">
            <CustomInput
              id="caloriasDiarias"
              name="caloriasDiarias"
              label="Calorías (kcal)"
              type="number"
              min="0"
              placeholder="Ej: 1800"
              value={caloriasDiarias}
              onChange={(e) => setCaloriasDiarias(e.target.value)}
            />
          </div>

          <div className="col-md-3">
            <CustomInput
              id="proteinasGramos"
              name="proteinasGramos"
              label="Proteínas (g)"
              type="number"
              min="0"
              placeholder="Ej: 95"
              value={proteinasGramos}
              onChange={(e) => setProteinasGramos(e.target.value)}
            />
          </div>

          <div className="col-md-3">
            <CustomInput
              id="carbohidratosGramos"
              name="carbohidratosGramos"
              label="Carbohidratos (g)"
              type="number"
              min="0"
              placeholder="Ej: 200"
              value={carbohidratosGramos}
              onChange={(e) => setCarbohidratosGramos(e.target.value)}
            />
          </div>

          <div className="col-md-3">
            <CustomInput
              id="grasasGramos"
              name="grasasGramos"
              label="Grasas (g)"
              type="number"
              min="0"
              placeholder="Ej: 55"
              value={grasasGramos}
              onChange={(e) => setGrasasGramos(e.target.value)}
            />
          </div>
        </div>

        <hr className="my-4" />

        {/* Selección y formas de preparación (Grupos de Alimentos) */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="fw-semibold text-secondary mb-0">
            Selección y Formas de Preparación (Grupos de Alimentos)
          </h6>
          <CustomButton
            type="button"
            variant="outline-success"
            onClick={agregarFilaAlimento}
          >
            + Agregar fila
          </CustomButton>
        </div>

        {grupoDeAlimentos.map((fila, index) => (
          <div className="row g-2 align-items-end mb-2" key={`fila-${index}`}>
            <div className="col-md-3">
              <CustomInput
                id={`categoria-${index}`}
                name={`categoria-${index}`}
                label={index === 0 ? "Categoría" : undefined}
                placeholder="LECHE/YOGURT, CARNE..."
                value={fila.categoria}
                onChange={(e) =>
                  handleAlimentoChange(index, "categoria", e.target.value)
                }
                className="mb-2"
              />
            </div>

            <div className="col-md-4">
              <CustomInput
                id={`seleccion-${index}`}
                name={`seleccion-${index}`}
                label={index === 0 ? "Selección" : undefined}
                placeholder="Preferentemente descremado..."
                value={fila.seleccion}
                onChange={(e) =>
                  handleAlimentoChange(index, "seleccion", e.target.value)
                }
                className="mb-2"
              />
            </div>

            <div className="col-md-4">
              <CustomInput
                id={`metodoPreparacion-${index}`}
                name={`metodoPreparacion-${index}`}
                label={index === 0 ? "Forma de preparación" : undefined}
                placeholder="Solo, con frutas, al horno..."
                value={fila.metodoPreparacion}
                onChange={(e) =>
                  handleAlimentoChange(
                    index,
                    "metodoPreparacion",
                    e.target.value,
                  )
                }
                className="mb-2"
              />
            </div>

            <div className="col-md-1 mb-2">
              <CustomButton
                type="button"
                variant="danger"
                fullWidth
                onClick={() => quitarFilaAlimento(index)}
                title="Quitar fila"
              >
                ✕
              </CustomButton>
            </div>
          </div>
        ))}

        <hr className="my-4" />

        {/* Distribución de alimentos y equivalencias */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="fw-semibold text-secondary mb-0">
            Distribución de Alimentos y Equivalencias
          </h6>
          <CustomButton
            type="button"
            variant="outline-success"
            onClick={agregarEquivalencia}
          >
            + Agregar equivalencia
          </CustomButton>
        </div>

        {distribucionEquivalencias.map((eq, index) => (
          <div
            className="border rounded-3 p-3 mb-2 bg-light"
            key={`eq-${index}`}
          >
            <div className="row g-2 align-items-end">
              <div className="col-md-3">
                <label
                  htmlFor={`momento-eq-${index}`}
                  className="form-label fw-semibold text-dark"
                >
                  Momento
                </label>
                <select
                  id={`momento-eq-${index}`}
                  name={`momento-eq-${index}`}
                  className="form-select"
                  value={eq.momento}
                  onChange={(e) =>
                    handleEquivalenciaChange(index, "momento", e.target.value)
                  }
                >
                  {OPCIONES_MOMENTO.map((op) => (
                    <option key={op.value} value={op.value}>
                      {op.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-3">
                <CustomInput
                  id={`rubro-eq-${index}`}
                  name={`rubro-eq-${index}`}
                  label="Rubro"
                  placeholder="LACTEOS, CEREALES..."
                  value={eq.rubro}
                  onChange={(e) =>
                    handleEquivalenciaChange(index, "rubro", e.target.value)
                  }
                  className="mb-0"
                />
              </div>

              <div className="col-md-5">
                <CustomInput
                  id={`porcion-eq-${index}`}
                  name={`porcion-eq-${index}`}
                  label="Porciones / Equivalencias"
                  placeholder="Ej: 1 taza, 3 tostadas mignón, 1½ plato"
                  value={eq.porcionesEquivalencias}
                  onChange={(e) =>
                    handleEquivalenciaChange(
                      index,
                      "porcionesEquivalencias",
                      e.target.value,
                    )
                  }
                  className="mb-0"
                />
              </div>

              <div className="col-md-1">
                <CustomButton
                  type="button"
                  variant="danger"
                  fullWidth
                  onClick={() => quitarEquivalencia(index)}
                  title="Quitar equivalencia"
                >
                  ✕
                </CustomButton>
              </div>
            </div>

            <div className="row g-2 mt-2">
              <div className="col-md-12">
                <CustomInput
                  id={`opciones-eq-${index}`}
                  name={`opciones-eq-${index}`}
                  label="Opciones / Preparaciones sugeridas"
                  placeholder="Ej: 1 cucharada sopera de aceite, puré enriquecido..."
                  value={eq.opcionesOPreparaciones}
                  onChange={(e) =>
                    handleEquivalenciaChange(
                      index,
                      "opcionesOPreparaciones",
                      e.target.value,
                    )
                  }
                  className="mb-0"
                />
              </div>
            </div>
          </div>
        ))}

        <hr className="my-4" />

        {/* Recetas / ejemplos prácticos */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="fw-semibold text-secondary mb-0">
            Recetas / Ejemplos Prácticos (opcional)
          </h6>
          <CustomButton
            type="button"
            variant="outline-success"
            onClick={agregarReceta}
          >
            + Agregar receta o ejemplo
          </CustomButton>
        </div>

        {recetasEjemplos.map((receta, index) => (
          <div
            className="border rounded-3 p-3 mb-2 bg-light"
            key={`receta-${index}`}
          >
            <div className="row g-2 align-items-end">
              <div className="col-md-5">
                <CustomInput
                  id={`nombre-receta-${index}`}
                  name={`nombre-receta-${index}`}
                  label="Nombre de la preparación *"
                  placeholder="Ej: Budín artesanal, Tortilla de avena y queso"
                  value={receta.nombre}
                  onChange={(e) =>
                    handleRecetaChange(index, "nombre", e.target.value)
                  }
                  className="mb-0"
                />
              </div>

              <div className="col-md-6">
                <CustomInput
                  id={`ingredientes-receta-${index}`}
                  name={`ingredientes-receta-${index}`}
                  label="Ingredientes / Cantidades"
                  placeholder="Ej: 2 huevos, 1½ taza de avena, queso..."
                  value={receta.ingredientes}
                  onChange={(e) =>
                    handleRecetaChange(index, "ingredientes", e.target.value)
                  }
                  className="mb-0"
                />
              </div>

              <div className="col-md-1">
                <CustomButton
                  type="button"
                  variant="danger"
                  fullWidth
                  onClick={() => quitarReceta(index)}
                  title="Quitar receta"
                >
                  ✕
                </CustomButton>
              </div>
            </div>

            <div className="row g-2 mt-2">
              <div className="col-md-12">
                <CustomInput
                  id={`preparacion-receta-${index}`}
                  name={`preparacion-receta-${index}`}
                  label="Paso a paso / Preparación"
                  placeholder="Indicaciones breves de elaboración..."
                  value={receta.preparacion}
                  onChange={(e) =>
                    handleRecetaChange(index, "preparacion", e.target.value)
                  }
                  className="mb-0"
                />
              </div>
            </div>
          </div>
        ))}

        <hr className="my-4" />

        {/* Recomendaciones generales */}
        <h6 className="fw-semibold text-secondary mb-3">
          Recomendaciones Generales / Higiénico-Dietéticas
        </h6>

        {recomendacionesGenerales.length > 0 && (
          <div className="d-flex flex-column gap-2 mb-3">
            {recomendacionesGenerales.map((rec, index) => (
              <div
                className="d-flex align-items-center gap-2 border rounded-2 p-2 bg-light"
                key={`rec-gen-${index}`}
              >
                <span className="flex-grow-1 small">{rec}</span>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => quitarRecomendacion(index)}
                  title="Quitar recomendación"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        <label
          htmlFor="nuevaRecomendacion"
          className="form-label fw-semibold text-dark"
        >
          Nueva recomendación general
        </label>
        <div className="input-group mb-4">
          <input
            id="nuevaRecomendacion"
            name="nuevaRecomendacion"
            type="text"
            className="form-control"
            placeholder="Ej: Realizar diariamente las 4 comidas principales y 2 colaciones..."
            value={nuevaRecomendacion}
            onChange={(e) => setNuevaRecomendacion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                agregarRecomendacion();
              }
            }}
          />
          <button
            type="button"
            className="btn btn-outline-success"
            onClick={agregarRecomendacion}
          >
            + Agregar
          </button>
        </div>

        <hr className="my-4" />

        {/* Advertencias y recomendaciones */}
        <h6 className="fw-semibold text-secondary mb-3">
          Advertencias y Recomendaciones
        </h6>

        <div className="d-flex flex-column gap-2 mb-3">
          {advertencias.map((adv, index) => (
            <div
              className="d-flex align-items-center gap-2 border rounded-2 p-2 bg-light"
              key={`adv-${index}`}
            >
              <span className="flex-grow-1 small">{adv}</span>
              <button
                type="button"
                className="btn btn-sm btn-outline-danger"
                onClick={() => quitarAdvertencia(index)}
                title="Quitar advertencia"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <label
          htmlFor="nuevaAdvertencia"
          className="form-label fw-semibold text-dark"
        >
          Nueva advertencia o recomendación
        </label>
        <div className="input-group mb-4">
          <input
            id="nuevaAdvertencia"
            name="nuevaAdvertencia"
            type="text"
            className="form-control"
            placeholder="Escriba una advertencia adicional..."
            value={nuevaAdvertencia}
            onChange={(e) => setNuevaAdvertencia(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                agregarAdvertencia();
              }
            }}
          />
          <button
            type="button"
            className="btn btn-outline-success"
            onClick={agregarAdvertencia}
          >
            + Agregar
          </button>
        </div>

        <div className="d-flex justify-content-end gap-2">
          {onCancel && (
            <CustomButton type="button" variant="secondary" onClick={onCancel}>
              Cancelar
            </CustomButton>
          )}
          <CustomButton type="submit" loading={submitting}>
            {submitLabel}
          </CustomButton>
        </div>
      </form>
    </div>
  );
};
