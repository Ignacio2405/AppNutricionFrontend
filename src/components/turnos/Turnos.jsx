import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BsPencilSquare, BsTrash } from "react-icons/bs";
import clientesAxios from "../../config/axios.js";
import {
  cancelarTurno,
  marcarTurnoAtendido,
  obtenerTurnos,
} from "../../services/turno.service.js";
import { CustomButton } from "../ui/CustomButton.jsx";

const obtenerFechaUtcStr = (fecha) => {
  if (!fecha) return "";
  if (typeof fecha === "string" && /^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    return fecha;
  }
  const d = new Date(fecha);
  if (Number.isNaN(d.getTime())) return "";
  const anio = d.getUTCFullYear();
  const mes = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dia = String(d.getUTCDate()).padStart(2, "0");
  return `${anio}-${mes}-${dia}`;
};

const obtenerHoyLocalStr = () => {
  const hoy = new Date();
  const anio = hoy.getFullYear();
  const mes = String(hoy.getMonth() + 1).padStart(2, "0");
  const dia = String(hoy.getDate()).padStart(2, "0");
  return `${anio}-${mes}-${dia}`;
};

const esTurnoDelDia = (fecha) => {
  const fechaTurno = obtenerFechaUtcStr(fecha);
  if (!fechaTurno) return false;
  return fechaTurno === obtenerHoyLocalStr();
};

const formatearFecha = (fecha) => {
  if (!fecha) return "—";
  const d = new Date(fecha);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("es-AR", { timeZone: "UTC" });
};

const formatearPersona = (persona, mapaPorId) => {
  if (!persona) return "—";

  if (typeof persona === "object") {
    const nombreCompleto = `${persona.apellido || ""}, ${
      persona.nombre || ""
    }`.trim();
    return nombreCompleto.replace(/^,\s*|,\s*$/g, "") || "—";
  }

  const idStr = String(persona);
  const encontrada = mapaPorId.get(idStr);
  if (encontrada) {
    const nombreCompleto = `${encontrada.apellido || ""}, ${
      encontrada.nombre || ""
    }`.trim();
    return nombreCompleto.replace(/^,\s*|,\s*$/g, "") || idStr;
  }

  return idStr;
};

const badgeEstado = (estado) => {
  switch (estado) {
    case "ATENDIDO":
      return "bg-success";
    case "CANCELADO":
      return "bg-danger";
    default:
      return "bg-warning text-dark";
  }
};

const obtenerUsuarioToken = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const partes = token.split(".");
    if (partes.length !== 3) return null;

    const base64 = partes[1].replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join(""),
    );

    const payload = JSON.parse(jsonPayload);
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
};

const extraerLista = (raw) => {
  if (Array.isArray(raw?.data)) return raw.data;
  if (Array.isArray(raw)) return raw;
  return [];
};

export const Turnos = () => {
  const navigate = useNavigate();

  const usuario = useMemo(() => obtenerUsuarioToken(), []);
  const rolUsuario = String(usuario?.rol || "").toUpperCase();
  const esPaciente = rolUsuario === "PACIENTE";
  const puedeAtender =
    rolUsuario === "ADMIN" ||
    rolUsuario === "RECEPCIONISTA" ||
    rolUsuario === "MEDICO";

  const [turnos, setTurnos] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [medicos, setMedicos] = useState([]);
  const [fechaFiltro, setFechaFiltro] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [accionId, setAccionId] = useState("");

  const mapaPacientes = useMemo(() => {
    const map = new Map();
    for (const p of pacientes) {
      if (p?._id) map.set(String(p._id), p);
    }
    return map;
  }, [pacientes]);

  const mapaMedicos = useMemo(() => {
    const map = new Map();
    for (const m of medicos) {
      if (m?._id) map.set(String(m._id), m);
    }
    return map;
  }, [medicos]);

  const recargarTurnos = useCallback(async (fecha = "") => {
    setError("");
    try {
      const params = fecha ? { fecha } : {};
      const res = await obtenerTurnos(params);
      setTurnos(extraerLista(res));
    } catch (err) {
      setError(
        err.response?.data?.mensaje || "No se pudieron cargar los turnos.",
      );
    }
  }, []);

  useEffect(() => {
    let activo = true;

    const cargarCatalogos = async () => {
      try {
        const [resPacientes, resMedicos] = await Promise.allSettled([
          clientesAxios.get("/pacientes"),
          clientesAxios.get("/medicos"),
        ]);

        if (!activo) return;

        if (resPacientes.status === "fulfilled") {
          setPacientes(extraerLista(resPacientes.value.data));
        }

        if (resMedicos.status === "fulfilled") {
          setMedicos(extraerLista(resMedicos.value.data));
        }
      } catch (err) {
        console.error("Error al cargar catálogos de pacientes/médicos:", err);
      }
    };

    cargarCatalogos();
    return () => {
      activo = false;
    };
  }, []);

  useEffect(() => {
    let activo = true;

    const fetchTurnos = async () => {
      try {
        const params = fechaFiltro ? { fecha: fechaFiltro } : {};
        const res = await obtenerTurnos(params);
        if (!activo) return;
        setTurnos(extraerLista(res));
        setError("");
      } catch (err) {
        if (!activo) return;
        setError(
          err.response?.data?.mensaje || "No se pudieron cargar los turnos.",
        );
      } finally {
        if (activo) setLoading(false);
      }
    };

    fetchTurnos();
    return () => {
      activo = false;
    };
  }, [fechaFiltro]);

  const handleFiltroFechaChange = (e) => {
    setLoading(true);
    setFechaFiltro(e.target.value);
  };

  const handleLimpiarFiltro = () => {
    setLoading(true);
    setFechaFiltro("");
  };

  const handleMarcarAtendido = async (turno) => {
    if (!esTurnoDelDia(turno.fecha)) {
      setError("Solo podés marcar como atendidos los turnos del día de hoy.");
      return;
    }

    setAccionId(turno._id);
    setError("");
    try {
      await marcarTurnoAtendido(turno._id);
      await recargarTurnos(fechaFiltro);
    } catch (err) {
      setError(
        err.response?.data?.mensaje || "No se pudo marcar como atendido.",
      );
    } finally {
      setAccionId("");
    }
  };

  const handleCancelar = async (id) => {
    setAccionId(id);
    setError("");
    try {
      await cancelarTurno(id);
      await recargarTurnos(fechaFiltro);
    } catch (err) {
      setError(err.response?.data?.mensaje || "No se pudo cancelar el turno.");
    } finally {
      setAccionId("");
    }
  };

  return (
    <div className="container py-4">
      <div className="card shadow-sm border-0 p-4 rounded-4">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
          <h3 className="fw-bold text-success mb-0">
            {esPaciente ? "Mis Turnos" : "Listado de Turnos"}
          </h3>
          <CustomButton type="button" onClick={() => navigate("/turnos/nuevo")}>
            + Nuevo Turno
          </CustomButton>
        </div>

        {/* Filtro por fecha */}
        <div className="row g-2 align-items-end mb-3">
          <div className="col-sm-4 col-md-3">
            <label
              htmlFor="filtroFechaTurno"
              className="form-label small fw-semibold mb-1"
            >
              Filtrar por fecha
            </label>
            <input
              id="filtroFechaTurno"
              type="date"
              className="form-control"
              value={fechaFiltro}
              onChange={handleFiltroFechaChange}
            />
          </div>
          {fechaFiltro && (
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

        {error && (
          <div className="alert alert-danger py-2 small" role="alert">
            {error}
          </div>
        )}

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Hora</th>
                <th>Paciente</th>
                <th>Médico</th>
                <th>Estado</th>
                <th>Observaciones</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-4">
                    <div
                      className="spinner-border spinner-border-sm text-success me-2"
                      role="status"
                    />
                    Cargando turnos...
                  </td>
                </tr>
              ) : turnos.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center text-muted py-4">
                    No hay turnos registrados para mostrar.
                  </td>
                </tr>
              ) : (
                turnos.map((turno) => {
                  const bloqueado =
                    turno.estado === "ATENDIDO" || turno.estado === "CANCELADO";
                  const ocupado = accionId === turno._id;
                  const esHoy = esTurnoDelDia(turno.fecha);

                  return (
                    <tr key={turno._id}>
                      <td>{formatearFecha(turno.fecha)}</td>
                      <td className="fw-semibold">{turno.hora}</td>
                      <td>{formatearPersona(turno.paciente, mapaPacientes)}</td>
                      <td>{formatearPersona(turno.medico, mapaMedicos)}</td>
                      <td>
                        <span className={`badge ${badgeEstado(turno.estado)}`}>
                          {turno.estado}
                        </span>
                      </td>
                      <td className="small text-muted">
                        {turno.observaciones || "—"}
                      </td>
                      <td>
                        <div className="d-flex flex-wrap gap-2">
                          {puedeAtender && (
                            <CustomButton
                              type="button"
                              variant="outline-success"
                              title={
                                esHoy
                                  ? "Atender turno"
                                  : "Solo se pueden atender turnos del día"
                              }
                              aria-label="Atender turno"
                              disabled={bloqueado || ocupado || !esHoy}
                              onClick={() => handleMarcarAtendido(turno)}
                            >
                              Atender
                            </CustomButton>
                          )}

                          {!esPaciente && !bloqueado && (
                            <CustomButton
                              type="button"
                              variant="outline-primary"
                              title="Editar turno"
                              aria-label="Editar turno"
                              disabled={ocupado}
                              onClick={() =>
                                navigate(`/turnos/${turno._id}/editar`)
                              }
                            >
                              <BsPencilSquare size={16} />
                            </CustomButton>
                          )}

                          {!bloqueado && (
                            <CustomButton
                              type="button"
                              variant="outline-danger"
                              title="Cancelar turno"
                              aria-label="Cancelar turno"
                              disabled={ocupado}
                              onClick={() => handleCancelar(turno._id)}
                            >
                              <BsTrash size={16} />
                            </CustomButton>
                          )}
                        </div>
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
