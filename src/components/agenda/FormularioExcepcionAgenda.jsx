import { useEffect, useMemo, useState } from "react";
import clientesAxios from "../../config/axios.js";
import { CustomInput } from "../ui/CustomInput.jsx";
import { CustomSelect } from "../ui/CustomSelect.jsx";
import { CustomButton } from "../ui/CustomButton.jsx";

const TIPO_EXCEPCION_OPCIONES = [
  { value: "BLOQUEO_TOTAL", label: "Bloqueo total del día" },
  { value: "MODIFICACION_HORARIO", label: "Modificación de horario" },
];

const MOTIVO_OPCIONES = [
  { value: "Licencia médica", label: "Licencia médica" },
  { value: "Feriado", label: "Feriado" },
  { value: "Congreso", label: "Congreso" },
  { value: "Motivos personales", label: "Motivos personales" },
  { value: "Capacitación", label: "Capacitación" },
  { value: "Otro", label: "Otro" },
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

const obtenerHoyStr = () => {
  const hoy = new Date();
  const anio = hoy.getFullYear();
  const mes = String(hoy.getMonth() + 1).padStart(2, "0");
  const dia = String(hoy.getDate()).padStart(2, "0");
  return `${anio}-${mes}-${dia}`;
};

const normalizarFechaInput = (valor) => {
  const str = String(valor || "").trim();
  const match = str.match(/^(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : "";
};

export const FormularioExcepcionAgenda = ({
  onSubmit,
  onCancel,
  submitting = false,
  submitLabel = "Registrar Excepción",
}) => {
  const [medicos, setMedicos] = useState([]);

  const [medico, setMedico] = useState("");
  const [fecha, setFecha] = useState(() => obtenerHoyStr());
  const [tipo, setTipo] = useState("BLOQUEO_TOTAL");
  const [motivo, setMotivo] = useState("Licencia médica");
  const [horaInicio, setHoraInicio] = useState("08:00");
  const [horaFin, setHoraFin] = useState("12:00");
  const [duracionTurnoMinutos, setDuracionTurnoMinutos] = useState("30");
  const [errorLocal, setErrorLocal] = useState("");

  useEffect(() => {
    let activo = true;

    const cargarMedicos = async () => {
      try {
        const { data } = await clientesAxios.get("/medicos");
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

  const esModificacion = tipo === "MODIFICACION_HORARIO";

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorLocal("");

    const fechaLimpia = normalizarFechaInput(fecha);

    if (!medico) {
      setErrorLocal("Seleccioná un médico para la excepción.");
      return;
    }

    if (!fechaLimpia) {
      setErrorLocal("Seleccioná una fecha válida para la excepción.");
      return;
    }

    if (!tipo) {
      setErrorLocal("Seleccioná el tipo de excepción.");
      return;
    }

    if (!motivo) {
      setErrorLocal("Seleccioná el motivo de la excepción.");
      return;
    }

    if (esModificacion) {
      if (!horaInicio || !horaFin) {
        setErrorLocal(
          "Indicá hora de inicio y fin para la modificación de horario.",
        );
        return;
      }

      if (horaFin <= horaInicio) {
        setErrorLocal("La hora de fin debe ser posterior a la hora de inicio.");
        return;
      }

      const duracionNum = Number(duracionTurnoMinutos);
      if (!Number.isFinite(duracionNum) || duracionNum <= 0) {
        setErrorLocal("La duración del turno debe ser mayor a 0 minutos.");
        return;
      }
    }

    const payload = {
      medico,
      fecha: fechaLimpia,
      tipo,
      motivo,
      ...(esModificacion
        ? {
            horaInicio,
            horaFin,
            duracionTurnoMinutos: Number(duracionTurnoMinutos) || 30,
          }
        : {}),
    };

    onSubmit(payload);
  };

  return (
    <div className="card shadow-sm border-0 p-4 rounded-4">
      <h4 className="fw-bold text-success mb-4">Nueva Excepción de Agenda</h4>

      {errorLocal && (
        <div className="alert alert-danger py-2 small mb-3" role="alert">
          {errorLocal}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="row g-3 mb-2">
          <div className="col-md-6">
            <CustomSelect
              id="medicoExcepcion"
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
            <CustomInput
              id="fechaExcepcion"
              name="fecha"
              label="Fecha *"
              type="date"
              value={fecha}
              onChange={(val) => setFecha(String(leerValor(val) || ""))}
              required
            />
          </div>
        </div>

        <div className="row g-3 mb-2">
          <div className="col-md-6">
            <CustomSelect
              id="tipoExcepcion"
              name="tipo"
              label="Tipo de excepción *"
              value={tipo}
              onChange={(val) => setTipo(String(leerValor(val) || ""))}
              options={TIPO_EXCEPCION_OPCIONES}
              required
            />
          </div>

          <div className="col-md-6">
            <CustomSelect
              id="motivoExcepcion"
              name="motivo"
              label="Motivo *"
              value={motivo}
              onChange={(val) => setMotivo(String(leerValor(val) || ""))}
              options={MOTIVO_OPCIONES}
              required
            />
          </div>
        </div>

        {esModificacion && (
          <div className="p-3 rounded-3 bg-light border mb-3">
            <span className="d-block fw-semibold text-success mb-2">
              Horario alternativo para la fecha
            </span>
            <div className="row g-3">
              <div className="col-md-4">
                <CustomInput
                  id="horaInicioExcepcion"
                  name="horaInicio"
                  label="Hora de inicio *"
                  type="time"
                  value={horaInicio}
                  onChange={(val) =>
                    setHoraInicio(String(leerValor(val) || ""))
                  }
                  required
                />
              </div>

              <div className="col-md-4">
                <CustomInput
                  id="horaFinExcepcion"
                  name="horaFin"
                  label="Hora de fin *"
                  type="time"
                  value={horaFin}
                  onChange={(val) => setHoraFin(String(leerValor(val) || ""))}
                  required
                />
              </div>

              <div className="col-md-4">
                <CustomInput
                  id="duracionExcepcion"
                  name="duracionTurnoMinutos"
                  label="Duración turno (min) *"
                  type="number"
                  min="5"
                  step="5"
                  value={duracionTurnoMinutos}
                  onChange={(val) =>
                    setDuracionTurnoMinutos(String(leerValor(val) || ""))
                  }
                  required
                />
              </div>
            </div>
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
