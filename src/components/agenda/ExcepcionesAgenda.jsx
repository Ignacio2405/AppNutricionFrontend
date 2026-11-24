import { useCallback, useEffect, useState } from "react";
import { BsTrash } from "react-icons/bs";
import clientesAxios from "../../config/axios.js";
import {
  crearExcepcionAgenda,
  desactivarExcepcionAgenda,
  obtenerExcepcionesAgenda,
} from "../../services/excepcionAgenda.service.js";
import { CustomButton } from "../ui/CustomButton.jsx";
import { FormularioExcepcionAgenda } from "./FormularioExcepcionAgenda.jsx";

const formatearFecha = (fecha) => {
  if (!fecha) return "—";
  if (typeof fecha === "string") {
    const matchSoloFecha = fecha.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (matchSoloFecha) {
      return `${matchSoloFecha[3]}/${matchSoloFecha[2]}/${matchSoloFecha[1]}`;
    }
  }
  const d = new Date(fecha);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("es-AR", { timeZone: "UTC" });
};

const formatearMedico = (medico) => {
  if (!medico) return "—";
  if (typeof medico === "string") return medico;
  const nombre = `${medico.apellido || ""}, ${medico.nombre || ""}`.trim();
  return nombre.replace(/^,\s*|,\s*$/g, "") || "—";
};

const etiquetaTipo = (tipo) => {
  if (tipo === "BLOQUEO_TOTAL") return "Bloqueo total";
  if (tipo === "MODIFICACION_HORARIO") return "Modificación de horario";
  return tipo || "—";
};

export const ExcepcionesAgenda = () => {
  const [excepciones, setExcepciones] = useState([]);
  const [medicos, setMedicos] = useState([]);
  const [medicoFiltro, setMedicoFiltro] = useState("");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [accionId, setAccionId] = useState("");
  const [error, setError] = useState("");
  const [mensajeExito, setMensajeExito] = useState("");

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

  const recargarExcepciones = useCallback(async (idMedico = "") => {
    setError("");
    try {
      const params = idMedico ? { medico: idMedico } : {};
      const res = await obtenerExcepcionesAgenda(params);
      setExcepciones(Array.isArray(res?.data) ? res.data : []);
    } catch (err) {
      setError(
        err.response?.data?.mensaje ||
          "No se pudieron cargar las excepciones de agenda.",
      );
    }
  }, []);

  useEffect(() => {
    let activo = true;

    const fetchExcepciones = async () => {
      try {
        const params = medicoFiltro ? { medico: medicoFiltro } : {};
        const res = await obtenerExcepcionesAgenda(params);
        if (!activo) return;
        setExcepciones(Array.isArray(res?.data) ? res.data : []);
        setError("");
      } catch (err) {
        if (!activo) return;
        setError(
          err.response?.data?.mensaje ||
            "No se pudieron cargar las excepciones de agenda.",
        );
      } finally {
        if (activo) setLoading(false);
      }
    };

    fetchExcepciones();
    return () => {
      activo = false;
    };
  }, [medicoFiltro]);

  const handleFiltroMedicoChange = (e) => {
    setLoading(true);
    setMedicoFiltro(e.target.value);
  };

  const handleLimpiarFiltro = () => {
    setLoading(true);
    setMedicoFiltro("");
  };

  const handleCrear = async (payload) => {
    setSubmitting(true);
    setError("");
    setMensajeExito("");
    try {
      const res = await crearExcepcionAgenda(payload);
      setMensajeExito(
        res?.mensaje || "Excepción de agenda registrada correctamente.",
      );
      setMostrarFormulario(false);
      await recargarExcepciones(medicoFiltro);
    } catch (err) {
      setError(
        err.response?.data?.mensaje ||
          "No se pudo registrar la excepción de agenda.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDesactivar = async (id) => {
    setAccionId(id);
    setError("");
    setMensajeExito("");
    try {
      const res = await desactivarExcepcionAgenda(id);
      setMensajeExito(
        res?.mensaje ||
          "Excepción desactivada. El médico recupera su horario habitual.",
      );
      await recargarExcepciones(medicoFiltro);
    } catch (err) {
      setError(
        err.response?.data?.mensaje ||
          "No se pudo desactivar la excepción de agenda.",
      );
    } finally {
      setAccionId("");
    }
  };

  return (
    <div className="container py-4">
      <div className="card shadow-sm border-0 p-4 rounded-4 mb-4">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
          <h3 className="fw-bold text-success mb-0">Excepciones de Agenda</h3>
          <CustomButton
            type="button"
            onClick={() => {
              setError("");
              setMensajeExito("");
              setMostrarFormulario((prev) => !prev);
            }}
          >
            {mostrarFormulario ? "Cerrar formulario" : "+ Nueva Excepción"}
          </CustomButton>
        </div>

        {/* Filtro por médico */}
        <div className="row g-2 align-items-end">
          <div className="col-sm-6 col-md-4">
            <label
              htmlFor="filtroMedicoExcepcion"
              className="form-label small fw-semibold mb-1"
            >
              Filtrar por médico
            </label>
            <select
              id="filtroMedicoExcepcion"
              className="form-select"
              value={medicoFiltro}
              onChange={handleFiltroMedicoChange}
            >
              <option value="">Todos los médicos</option>
              {medicos.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.apellido || ""}, {m.nombre || ""}
                </option>
              ))}
            </select>
          </div>

          {medicoFiltro && (
            <div className="col-auto">
              <CustomButton
                type="button"
                variant="outline-secondary"
                onClick={handleLimpiarFiltro}
              >
                Limpiar filtro
              </CustomButton>
            </div>
          )}
        </div>
      </div>

      {mensajeExito && (
        <div className="alert alert-success py-2 small" role="alert">
          {mensajeExito}
        </div>
      )}

      {error && (
        <div className="alert alert-danger py-2 small" role="alert">
          {error}
        </div>
      )}

      {mostrarFormulario && (
        <div className="mb-4">
          <FormularioExcepcionAgenda
            onSubmit={handleCrear}
            onCancel={() => setMostrarFormulario(false)}
            submitting={submitting}
          />
        </div>
      )}

      <div className="card shadow-sm border-0 p-4 rounded-4">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead>
              <tr>
                <th>Médico</th>
                <th>Fecha</th>
                <th>Tipo</th>
                <th>Motivo</th>
                <th>Horario alternativo</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-4">
                    <div
                      className="spinner-border spinner-border-sm text-success me-2"
                      role="status"
                    />
                    Cargando excepciones...
                  </td>
                </tr>
              ) : excepciones.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center text-muted py-4">
                    No hay excepciones de agenda activas para mostrar.
                  </td>
                </tr>
              ) : (
                excepciones.map((exc) => {
                  const rango =
                    exc.tipo === "MODIFICACION_HORARIO" &&
                    exc.horaInicio &&
                    exc.horaFin
                      ? `${exc.horaInicio} - ${exc.horaFin} (${exc.duracionTurnoMinutos || 30} min)`
                      : "Día completo bloqueado";

                  return (
                    <tr key={exc._id}>
                      <td className="fw-medium">
                        {formatearMedico(exc.medico)}
                      </td>
                      <td>{formatearFecha(exc.fecha)}</td>
                      <td>
                        <span
                          className={`badge ${
                            exc.tipo === "BLOQUEO_TOTAL"
                              ? "bg-danger"
                              : "bg-warning text-dark"
                          }`}
                        >
                          {etiquetaTipo(exc.tipo)}
                        </span>
                      </td>
                      <td>{exc.motivo || "—"}</td>
                      <td className="small text-muted">{rango}</td>
                      <td>
                        <CustomButton
                          type="button"
                          variant="outline-danger"
                          title="Desactivar excepción"
                          aria-label="Desactivar excepción"
                          disabled={accionId === exc._id}
                          onClick={() => handleDesactivar(exc._id)}
                        >
                          <BsTrash size={16} />
                        </CustomButton>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
