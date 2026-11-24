import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BsPencilSquare, BsTrash } from "react-icons/bs";
import clientesAxios from "../../config/axios.js";
import {
  eliminarAgenda,
  obtenerAgenda,
} from "../../services/agenda.service.js";
import { CustomButton } from "../ui/CustomButton.jsx";

const DIAS_LABEL = {
  LUNES: "Lunes",
  MARTES: "Martes",
  MIERCOLES: "Miércoles",
  JUEVES: "Jueves",
  VIERNES: "Viernes",
  SABADO: "Sábado",
  DOMINGO: "Domingo",
};

const formatearDia = (dia) => {
  if (!dia) return "—";
  const clave = String(dia).trim().toUpperCase();
  return DIAS_LABEL[clave] || dia;
};

const formatearMedico = (medico) => {
  if (!medico) return "—";
  if (typeof medico === "string") return medico;
  const nombre = `${medico.apellido || ""}, ${medico.nombre || ""}`.trim();
  return nombre.replace(/^,\s*|,\s*$/g, "") || "—";
};

export const Agenda = () => {
  const navigate = useNavigate();

  const [horarios, setHorarios] = useState([]);
  const [medicos, setMedicos] = useState([]);
  const [medicoFiltro, setMedicoFiltro] = useState("");
  const [diaFiltro, setDiaFiltro] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [eliminandoId, setEliminandoId] = useState("");

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

  useEffect(() => {
    let activo = true;

    const fetchHorarios = async () => {
      try {
        const params = {};
        if (medicoFiltro) params.medico = medicoFiltro;
        if (diaFiltro) params.diaSemana = diaFiltro;

        const res = await obtenerAgenda(params);
        if (!activo) return;
        setHorarios(Array.isArray(res?.data) ? res.data : []);
        setError("");
      } catch (err) {
        if (!activo) return;
        setError(
          err.response?.data?.mensaje ||
            "No se pudieron cargar los horarios de agenda.",
        );
      } finally {
        if (activo) setLoading(false);
      }
    };

    fetchHorarios();
    return () => {
      activo = false;
    };
  }, [medicoFiltro, diaFiltro]);

  const recargar = useCallback(async () => {
    setError("");
    try {
      const params = {};
      if (medicoFiltro) params.medico = medicoFiltro;
      if (diaFiltro) params.diaSemana = diaFiltro;
      const res = await obtenerAgenda(params);
      setHorarios(Array.isArray(res?.data) ? res.data : []);
    } catch (err) {
      setError(
        err.response?.data?.mensaje || "No se pudo actualizar la agenda.",
      );
    }
  }, [medicoFiltro, diaFiltro]);

  const handleEliminar = async (id) => {
    setEliminandoId(id);
    setError("");
    try {
      await eliminarAgenda(id);
      await recargar();
    } catch (err) {
      setError(
        err.response?.data?.mensaje || "No se pudo dar de baja el horario.",
      );
    } finally {
      setEliminandoId("");
    }
  };

  const hayFiltros = useMemo(
    () => Boolean(medicoFiltro || diaFiltro),
    [medicoFiltro, diaFiltro],
  );

  return (
    <div className="container py-4">
      <div className="card shadow-sm border-0 p-4 rounded-4">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
          <h3 className="fw-bold text-success mb-0">Agenda y Horarios</h3>
          <CustomButton type="button" onClick={() => navigate("/agenda/nuevo")}>
            + Nuevo Horario
          </CustomButton>
        </div>

        {/* Filtros */}
        <div className="row g-2 align-items-end mb-3">
          <div className="col-sm-6 col-md-4">
            <label
              htmlFor="filtroMedicoAgenda"
              className="form-label small fw-semibold mb-1"
            >
              Médico
            </label>
            <select
              id="filtroMedicoAgenda"
              className="form-select"
              value={medicoFiltro}
              onChange={(e) => {
                setLoading(true);
                setMedicoFiltro(e.target.value);
              }}
            >
              <option value="">Todos los médicos</option>
              {medicos.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.apellido || ""}, {m.nombre || ""}
                </option>
              ))}
            </select>
          </div>

          <div className="col-sm-6 col-md-3">
            <label
              htmlFor="filtroDiaAgenda"
              className="form-label small fw-semibold mb-1"
            >
              Día de la semana
            </label>
            <select
              id="filtroDiaAgenda"
              className="form-select"
              value={diaFiltro}
              onChange={(e) => {
                setLoading(true);
                setDiaFiltro(e.target.value);
              }}
            >
              <option value="">Todos los días</option>
              {Object.entries(DIAS_LABEL).map(([val, label]) => (
                <option key={val} value={val}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {hayFiltros && (
            <div className="col-auto">
              <CustomButton
                type="button"
                variant="outline-secondary"
                onClick={() => {
                  setLoading(true);
                  setMedicoFiltro("");
                  setDiaFiltro("");
                }}
              >
                Limpiar filtros
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
                <th>Médico</th>
                <th>Día</th>
                <th>Desde</th>
                <th>Hasta</th>
                <th>Duración</th>
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
                    Cargando horarios...
                  </td>
                </tr>
              ) : horarios.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center text-muted py-4">
                    No hay horarios de agenda registrados.
                  </td>
                </tr>
              ) : (
                horarios.map((item) => (
                  <tr key={item._id}>
                    <td className="fw-medium">
                      {formatearMedico(item.medico)}
                    </td>
                    <td>
                      <span className="badge bg-success-subtle text-success border border-success-subtle">
                        {formatearDia(item.diaSemana)}
                      </span>
                    </td>
                    <td>{item.horaInicio}</td>
                    <td>{item.horaFin}</td>
                    <td>{item.duracionTurnoMinutos} min</td>
                    <td>
                      <div className="d-flex flex-wrap gap-2">
                        <CustomButton
                          type="button"
                          variant="outline-primary"
                          title="Editar horario"
                          aria-label="Editar horario"
                          disabled={eliminandoId === item._id}
                          onClick={() => navigate(`/agenda/${item._id}/editar`)}
                        >
                          <BsPencilSquare size={16} />
                        </CustomButton>
                        <CustomButton
                          type="button"
                          variant="outline-danger"
                          title="Dar de baja horario"
                          aria-label="Dar de baja horario"
                          disabled={eliminandoId === item._id}
                          onClick={() => handleEliminar(item._id)}
                        >
                          <BsTrash size={16} />
                        </CustomButton>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
