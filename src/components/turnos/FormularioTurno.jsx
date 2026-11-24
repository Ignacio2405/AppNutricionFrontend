import { useEffect, useMemo, useState } from "react";
import clientesAxios from "../../config/axios.js";
import { obtenerTurnosDisponibles } from "../../services/turno.service.js";
import { CustomInput } from "../ui/CustomInput.jsx";
import { CustomSelect } from "../ui/CustomSelect.jsx";
import { CustomButton } from "../ui/CustomButton.jsx";

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
  if (typeof campo === "object") {
    return String(campo._id || campo.id || campo.value || "");
  }
  return String(campo);
};

// Parsea YYYY-MM-DD en fecha local sin corrimiento por UTC
const parseFechaLocal = (fechaStr) => {
  if (!fechaStr) return null;
  if (typeof fechaStr === "string" && /^\d{4}-\d{2}-\d{2}$/.test(fechaStr)) {
    const [anio, mes, dia] = fechaStr.split("-").map(Number);
    return new Date(anio, mes - 1, dia);
  }
  const d = new Date(fechaStr);
  return Number.isNaN(d.getTime()) ? null : d;
};

const toInputDate = (valor) => {
  const d = parseFechaLocal(valor);
  if (!d) return "";
  const anio = d.getFullYear();
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${anio}-${mes}-${dia}`;
};

const obtenerHoyStr = () => {
  const hoy = new Date();
  const anio = hoy.getFullYear();
  const mes = String(hoy.getMonth() + 1).padStart(2, "0");
  const dia = String(hoy.getDate()).padStart(2, "0");
  return `${anio}-${mes}-${dia}`;
};

const extraerSlotsDeRespuesta = (res) => {
  const payload = res?.data ?? res;
  if (Array.isArray(payload)) {
    return payload
      .map((item) => (typeof item === "string" ? item : item?.hora))
      .filter(Boolean);
  }
  const candidata =
    payload?.horariosDisponibles ??
    payload?.slots ??
    payload?.disponibles ??
    payload?.data?.horariosDisponibles ??
    payload?.data?.slots ??
    [];

  if (!Array.isArray(candidata)) return [];
  return candidata
    .map((item) => (typeof item === "string" ? item : item?.hora))
    .filter(Boolean);
};

export const FormularioTurno = ({
  initialData = null,
  onSubmit,
  onCancel,
  submitting = false,
  submitLabel = "Guardar Turno",
  esEdicion = false,
}) => {
  const [medicos, setMedicos] = useState([]);
  const [pacientes, setPacientes] = useState([]);

  const pacienteInicial = extraerId(initialData?.paciente);
  const [paciente, setPaciente] = useState(pacienteInicial);
  const [medico, setMedico] = useState(() => extraerId(initialData?.medico));
  const [fecha, setFecha] = useState(
    () => toInputDate(initialData?.fecha) || obtenerHoyStr(),
  );
  const [hora, setHora] = useState(() => initialData?.hora || "");
  const [observaciones, setObservaciones] = useState(
    () => initialData?.observaciones || "",
  );
  const [urgencia, setUrgencia] = useState(false);

  const [slotsDisponibles, setSlotsDisponibles] = useState([]);
  const [mensajeDisponibilidad, setMensajeDisponibilidad] = useState("");
  const [cargandoSlots, setCargandoSlots] = useState(false);
  const [errorLocal, setErrorLocal] = useState("");

  // Cargar médicos y pacientes
  useEffect(() => {
    let activo = true;

    const cargarCatalogos = async () => {
      try {
        const [resMedicos, resPacientes] = await Promise.allSettled([
          clientesAxios.get("/medicos"),
          clientesAxios.get("/pacientes"),
        ]);

        if (!activo) return;

        if (resMedicos.status === "fulfilled") {
          const rawM = resMedicos.value.data;
          const listaM = Array.isArray(rawM?.data)
            ? rawM.data
            : Array.isArray(rawM?.medicos)
              ? rawM.medicos
              : Array.isArray(rawM)
                ? rawM
                : [];
          setMedicos(listaM);
        }

        if (resPacientes.status === "fulfilled") {
          const rawP = resPacientes.value.data;
          const listaP = Array.isArray(rawP?.data)
            ? rawP.data
            : Array.isArray(rawP?.pacientes)
              ? rawP.pacientes
              : Array.isArray(rawP)
                ? rawP
                : [];
          setPacientes(listaP);
        }
      } catch (err) {
        console.error("Error al cargar médicos o pacientes:", err);
      }
    };

    cargarCatalogos();
    return () => {
      activo = false;
    };
  }, []);

  // Consultar horarios disponibles al cambiar médico o fecha
  useEffect(() => {
    if (!medico || !fecha) return;

    let activo = true;

    const buscarDisponibilidad = async () => {
      setCargandoSlots(true);
      try {
        const res = await obtenerTurnosDisponibles({ medico, fecha });
        if (!activo) return;

        const libres = extraerSlotsDeRespuesta(res);
        setSlotsDisponibles(libres);
        setMensajeDisponibilidad(
          res?.mensaje ||
            (libres.length === 0
              ? "Sin horarios libres cargados o podés ingresar la hora manualmente."
              : ""),
        );
      } catch (err) {
        if (!activo) return;
        setSlotsDisponibles([]);
        setMensajeDisponibilidad(
          err.response?.data?.mensaje ||
            "No se pudo verificar la agenda para esa fecha.",
        );
      } finally {
        if (activo) setCargandoSlots(false);
      }
    };

    buscarDisponibilidad();
    return () => {
      activo = false;
    };
  }, [medico, fecha]);

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

  const handleMedicoChange = (val) => {
    const nuevoMedico = extraerId(leerValor(val));
    setMedico(nuevoMedico);
    setHora("");
    setSlotsDisponibles([]);
    setMensajeDisponibilidad("");
  };

  const handleFechaChange = (val) => {
    const nuevaFecha = String(leerValor(val) || "");
    setFecha(nuevaFecha);
    setHora("");
    setSlotsDisponibles([]);
    setMensajeDisponibilidad("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorLocal("");

    if (!paciente) {
      setErrorLocal("Seleccioná un paciente para el turno.");
      return;
    }

    if (!medico) {
      setErrorLocal("Seleccioná un médico para el turno.");
      return;
    }

    if (!fecha) {
      setErrorLocal("Seleccioná la fecha del turno.");
      return;
    }

    if (!String(hora || "").trim()) {
      setErrorLocal("Seleccioná o ingresá la hora del turno.");
      return;
    }

    const payload = {
      paciente,
      medico,
      fecha,
      hora: String(hora).trim(),
      observaciones: String(observaciones || "").trim(),
    };

    onSubmit(payload, { urgencia: !esEdicion && urgencia });
  };

  return (
    <div className="card shadow-sm border-0 p-4 rounded-4">
      <h4 className="fw-bold text-success mb-4">
        {esEdicion ? "Editar Turno" : "Registrar Turno"}
      </h4>

      {errorLocal && (
        <div className="alert alert-danger py-2 small mb-3" role="alert">
          {errorLocal}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="row g-3 mb-2">
          <div className="col-md-6">
            <CustomSelect
              id="paciente"
              name="paciente"
              label="Paciente *"
              value={paciente}
              onChange={(val) => setPaciente(extraerId(leerValor(val)))}
              options={opcionesPacientes}
              placeholder="Escriba para buscar o seleccione..."
              required
            />
          </div>

          <div className="col-md-6">
            <CustomSelect
              id="medico"
              name="medico"
              label="Médico / Profesional *"
              value={medico}
              onChange={handleMedicoChange}
              options={opcionesMedicos}
              placeholder="Escriba para buscar o seleccione..."
              required
            />
          </div>
        </div>

        <div className="row g-3 mb-2">
          <div className="col-md-4">
            <CustomInput
              id="fecha"
              name="fecha"
              label="Fecha *"
              type="date"
              value={fecha}
              onChange={handleFechaChange}
              required
            />
          </div>

          <div className="col-md-4">
            <CustomInput
              id="hora"
              name="hora"
              label={cargandoSlots ? "Hora * (consultando...)" : "Hora *"}
              type="time"
              value={hora}
              onChange={(val) => setHora(String(leerValor(val) || ""))}
              required
            />
          </div>

          <div className="col-md-4">
            <CustomInput
              id="observaciones"
              name="observaciones"
              label="Observaciones"
              placeholder="Motivo o nota del turno..."
              value={observaciones}
              onChange={(val) => setObservaciones(String(leerValor(val) || ""))}
            />
          </div>
        </div>

        {/* Horarios disponibles del médico en la fecha elegida */}
        {medico && fecha && (
          <div className="mb-3 p-3 rounded-3 bg-light border">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="small fw-semibold text-secondary">
                Horarios disponibles en agenda
              </span>
              {cargandoSlots && (
                <span className="spinner-border spinner-border-sm text-success" />
              )}
            </div>

            {slotsDisponibles.length > 0 ? (
              <div className="d-flex flex-wrap gap-2">
                {slotsDisponibles.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    className={`btn btn-sm ${
                      hora === slot ? "btn-success" : "btn-outline-success"
                    }`}
                    onClick={() => setHora(slot)}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            ) : (
              <div className="small text-muted">
                {mensajeDisponibilidad ||
                  "Sin horarios libres cargados o podés ingresar la hora manualmente."}
              </div>
            )}
          </div>
        )}

        {!esEdicion && (
          <div className="form-check mb-4">
            <input
              id="urgencia"
              name="urgencia"
              type="checkbox"
              className="form-check-input"
              checked={urgencia}
              onChange={(e) => setUrgencia(e.target.checked)}
            />
            <label htmlFor="urgencia" className="form-check-label">
              Registrar como ingreso urgente / guardia (marca como atendido)
            </label>
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
