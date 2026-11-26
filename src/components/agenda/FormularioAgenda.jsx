import { useEffect, useMemo, useState } from "react";
import clientesAxios from "../../config/axios.js";
import { CustomInput } from "../ui/CustomInput.jsx";
import { CustomSelect } from "../ui/CustomSelect.jsx";
import { CustomButton } from "../ui/CustomButton.jsx";
import { PARAMETROS_LISTADO_COMPLETO } from "../../utils/paginacion.js";

const DIAS_SEMANA_OPCIONES = [
  { value: "lunes", label: "lunes" },
  { value: "martes", label: "martes" },
  { value: "miercoles", label: "miércoles" },
  { value: "jueves", label: "jueves" },
  { value: "viernes", label: "viernes" },
  { value: "sabado", label: "sábado" },
  { value: "domingo", label: "domingo" },
];

const leerValor = (valOrEvent) => {
  if (
    valOrEvent &&
    typeof valOrEvent === "object" &&
    "target" in valOrEvent &&
    valOrEvent.target
  ) {
    return valOrEvent.target.value;
  }
  return valOrEvent ?? "";
};

const extraerId = (campo) => {
  if (!campo) return "";
  return typeof campo === "object"
    ? String(campo._id || campo.id || "")
    : String(campo);
};

const normalizarDia = (dia) => {
  if (!dia) return "lunes";
  return String(dia).trim().toLowerCase();
};

const horaAMinutos = (hora) => {
  if (typeof hora !== "string" || !hora.includes(":")) return NaN;
  const [h = 0, m = 0] = hora.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return NaN;
  return h * 60 + m;
};

const validarRangoBloque = ({
  nombreBloque,
  horaInicio,
  horaFin,
  duracionTurnoMinutos,
}) => {
  const minInicio = horaAMinutos(horaInicio);
  const minFin = horaAMinutos(horaFin);
  const duracionNum = Number(duracionTurnoMinutos);

  if (Number.isNaN(minInicio) || Number.isNaN(minFin)) {
    return `Ingresá horas de inicio y fin válidas en el bloque ${nombreBloque}.`;
  }

  if (minFin <= minInicio) {
    return `En el bloque ${nombreBloque}, la hora de fin debe ser posterior a la hora de inicio.`;
  }

  if (!Number.isFinite(duracionNum) || duracionNum <= 0) {
    return `En el bloque ${nombreBloque}, la duración del turno debe ser mayor a 0 minutos.`;
  }

  if ((minFin - minInicio) % duracionNum !== 0) {
    return `En el bloque ${nombreBloque}, el rango horario debe ser múltiplo exacto de la duración del turno (${duracionNum} min).`;
  }

  return null;
};

export const FormularioAgenda = ({
  initialData = null,
  onSubmit,
  onCancel,
  submitting = false,
  submitLabel = "Guardar Horario",
  esEdicion = false,
}) => {
  const [medicos, setMedicos] = useState([]);

  const [medico, setMedico] = useState(() => extraerId(initialData?.medico));
  const [diaSemana, setDiaSemana] = useState(() =>
    normalizarDia(initialData?.diaSemana || "lunes"),
  );

  // Bloque Mañana
  const [usarManana, setUsarManana] = useState(true);
  const [horaInicioManana, setHoraInicioManana] = useState(
    () => initialData?.horaInicio || "08:00",
  );
  const [horaFinManana, setHoraFinManana] = useState(
    () => initialData?.horaFin || "12:00",
  );
  const [duracionManana, setDuracionManana] = useState(() =>
    initialData?.duracionTurnoMinutos != null
      ? String(initialData.duracionTurnoMinutos)
      : "30",
  );

  // Bloque Tarde (solo en creación de múltiples bloques)
  const [usarTarde, setUsarTarde] = useState(false);
  const [horaInicioTarde, setHoraInicioTarde] = useState("16:00");
  const [horaFinTarde, setHoraFinTarde] = useState("20:00");
  const [duracionTarde, setDuracionTarde] = useState("30");

  const [errorLocal, setErrorLocal] = useState("");

  useEffect(() => {
    let activo = true;

    const cargarMedicos = async () => {
      try {
        const { data } = await clientesAxios.get("/medicos", {
          params: PARAMETROS_LISTADO_COMPLETO,
        });
        if (!activo) return;
        const lista = Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.medicos)
            ? data.medicos
            : Array.isArray(data)
              ? data
              : [];
        setMedicos(lista);
      } catch (err) {
        console.error("Error al cargar médicos:", err);
      }
    };

    cargarMedicos();
    return () => {
      activo = false;
    };
  }, []);

  const opcionesMedicos = useMemo(
    () =>
      medicos.map((m) => ({
        value: String(m._id),
        label: `${m.apellido || ""}, ${m.nombre || ""}${
          m.especialidad ? ` — ${m.especialidad}` : ""
        }`,
      })),
    [medicos],
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorLocal("");

    const medicoId = String(medico || "").trim();
    const dia = normalizarDia(diaSemana);

    if (!medicoId) {
      setErrorLocal("Seleccioná un médico para el horario.");
      return;
    }

    if (!dia) {
      setErrorLocal("Seleccioná el día de la semana.");
      return;
    }

    const hIniM = String(horaInicioManana || "").trim();
    const hFinM = String(horaFinManana || "").trim();
    const hIniT = String(horaInicioTarde || "").trim();
    const hFinT = String(horaFinTarde || "").trim();

    if (esEdicion) {
      const errorEdicion = validarRangoBloque({
        nombreBloque: "horario",
        horaInicio: hIniM,
        horaFin: hFinM,
        duracionTurnoMinutos: duracionManana,
      });
      if (errorEdicion) {
        setErrorLocal(errorEdicion);
        return;
      }

      onSubmit([
        {
          medico: medicoId,
          diaSemana: dia,
          horaInicio: hIniM,
          horaFin: hFinM,
          duracionTurnoMinutos: Number(duracionManana),
        },
      ]);
      return;
    }

    if (!usarManana && !usarTarde) {
      setErrorLocal(
        "Activá al menos un bloque horario (mañana o tarde) para guardar.",
      );
      return;
    }

    const bloquesAEnviar = [];

    if (usarManana) {
      const errManana = validarRangoBloque({
        nombreBloque: "de la mañana",
        horaInicio: hIniM,
        horaFin: hFinM,
        duracionTurnoMinutos: duracionManana,
      });
      if (errManana) {
        setErrorLocal(errManana);
        return;
      }
      bloquesAEnviar.push({
        medico: medicoId,
        diaSemana: dia,
        horaInicio: hIniM,
        horaFin: hFinM,
        duracionTurnoMinutos: Number(duracionManana),
        turno: "MAÑANA",
      });
    }

    if (usarTarde) {
      const errTarde = validarRangoBloque({
        nombreBloque: "de la tarde",
        horaInicio: hIniT,
        horaFin: hFinT,
        duracionTurnoMinutos: duracionTarde,
      });
      if (errTarde) {
        setErrorLocal(errTarde);
        return;
      }
      bloquesAEnviar.push({
        medico: medicoId,
        diaSemana: dia,
        horaInicio: hIniT,
        horaFin: hFinT,
        duracionTurnoMinutos: Number(duracionTarde),
        turno: "TARDE",
      });
    }

    if (usarManana && usarTarde) {
      const iniM = horaAMinutos(hIniM);
      const finM = horaAMinutos(hFinM);
      const iniT = horaAMinutos(hIniT);
      const finT = horaAMinutos(hFinT);

      if (iniM < finT && finM > iniT) {
        setErrorLocal(
          "El bloque de la mañana y el de la tarde no pueden superponerse.",
        );
        return;
      }
    }

    onSubmit(bloquesAEnviar);
  };

  return (
    <div className="card shadow-sm border-0 p-4 rounded-4">
      <h4 className="fw-bold text-success mb-4">
        {esEdicion ? "Editar Bloque de Agenda" : "Nuevo Bloque de Agenda"}
      </h4>

      {errorLocal && (
        <div className="alert alert-danger py-2 small mb-3" role="alert">
          {errorLocal}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="row g-3 mb-3">
          <div className="col-md-6">
            <CustomSelect
              id="medico"
              name="medico"
              label="Médico / Profesional *"
              value={medico}
              onChange={(val) => setMedico(String(leerValor(val) || ""))}
              options={opcionesMedicos}
              placeholder="Escriba para buscar o seleccione..."
              required
            />
          </div>

          <div className="col-md-6">
            <CustomSelect
              id="diaSemana"
              name="diaSemana"
              label="Día de la semana *"
              value={diaSemana}
              onChange={(val) => setDiaSemana(String(leerValor(val) || ""))}
              options={DIAS_SEMANA_OPCIONES}
              required
            />
          </div>
        </div>

        {/* Bloque Mañana */}
        <div className="p-3 rounded-3 bg-light border mb-3">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="fw-semibold text-success">Turno Mañana</span>
            {!esEdicion && (
              <div className="form-check form-switch mb-0">
                <input
                  id="usarManana"
                  type="checkbox"
                  className="form-check-input"
                  checked={usarManana}
                  onChange={(e) => setUsarManana(e.target.checked)}
                />
                <label htmlFor="usarManana" className="form-check-label small">
                  Habilitar mañana
                </label>
              </div>
            )}
          </div>

          {(esEdicion || usarManana) && (
            <div className="row g-3">
              <div className="col-md-4">
                <CustomInput
                  id="horaInicioManana"
                  name="horaInicioManana"
                  label="Hora de inicio *"
                  type="time"
                  value={horaInicioManana}
                  onChange={(val) => setHoraInicioManana(leerValor(val))}
                  required
                />
              </div>

              <div className="col-md-4">
                <CustomInput
                  id="horaFinManana"
                  name="horaFinManana"
                  label="Hora de fin *"
                  type="time"
                  value={horaFinManana}
                  onChange={(val) => setHoraFinManana(leerValor(val))}
                  required
                />
              </div>

              <div className="col-md-4">
                <CustomInput
                  id="duracionManana"
                  name="duracionManana"
                  label="Duración turno (min) *"
                  type="number"
                  min="5"
                  step="5"
                  value={duracionManana}
                  onChange={(val) => setDuracionManana(leerValor(val))}
                  required
                />
              </div>
            </div>
          )}
        </div>

        {/* Bloque Tarde */}
        {!esEdicion && (
          <div className="p-3 rounded-3 bg-light border mb-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="fw-semibold text-success">Turno Tarde</span>
              <div className="form-check form-switch mb-0">
                <input
                  id="usarTarde"
                  type="checkbox"
                  className="form-check-input"
                  checked={usarTarde}
                  onChange={(e) => setUsarTarde(e.target.checked)}
                />
                <label htmlFor="usarTarde" className="form-check-label small">
                  Agregar bloque de tarde
                </label>
              </div>
            </div>

            {usarTarde && (
              <div className="row g-3">
                <div className="col-md-4">
                  <CustomInput
                    id="horaInicioTarde"
                    name="horaInicioTarde"
                    label="Hora de inicio *"
                    type="time"
                    value={horaInicioTarde}
                    onChange={(val) => setHoraInicioTarde(leerValor(val))}
                    required
                  />
                </div>

                <div className="col-md-4">
                  <CustomInput
                    id="horaFinTarde"
                    name="horaFinTarde"
                    label="Hora de fin *"
                    type="time"
                    value={horaFinTarde}
                    onChange={(val) => setHoraFinTarde(leerValor(val))}
                    required
                  />
                </div>

                <div className="col-md-4">
                  <CustomInput
                    id="duracionTarde"
                    name="duracionTarde"
                    label="Duración turno (min) *"
                    type="number"
                    min="5"
                    step="5"
                    value={duracionTarde}
                    onChange={(val) => setDuracionTarde(leerValor(val))}
                    required
                  />
                </div>
              </div>
            )}
          </div>
        )}

        <div className="d-flex justify-content-end gap-2 mt-3">
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
