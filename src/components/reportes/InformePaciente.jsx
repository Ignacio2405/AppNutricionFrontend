import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { BsPrinter } from "react-icons/bs";
import clientesAxios from "../../config/axios.js";
import { obtenerInformePaciente } from "../../services/reporte.service.js";
import { CustomButton } from "../ui/CustomButton.jsx";
import { PARAMETROS_LISTADO_COMPLETO } from "../../utils/paginacion.js";

const formatearFecha = (fecha) => {
  if (!fecha) return "—";
  const d = new Date(fecha);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("es-AR", { timeZone: "UTC" });
};

const formatearNombrePaciente = (p) => {
  if (!p) return "Paciente";
  const base = `${p.apellido || ""}, ${p.nombre || ""}`.trim();
  return base.replace(/^,\s*|,\s*$/g, "") || p.email || p.dni || "Paciente";
};

const extraerListaPacientes = (data) => {
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.data?.pacientes)) return data.data.pacientes;
  if (Array.isArray(data?.pacientes)) return data.pacientes;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data)) return data;
  return [];
};

const obtenerIdPaciente = (paciente) =>
  paciente?._id || paciente?.id || paciente?.pacienteId || "";

const extraerInforme = (res) =>
  res?.informe || res?.data?.informe || res?.data || res || null;

export const InformePaciente = () => {
  const { pacienteId: pacienteIdParam } = useParams();

  const [pacientes, setPacientes] = useState([]);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(
    () => pacienteIdParam || "",
  );
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");

  const [informe, setInforme] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [errorCatalogo, setErrorCatalogo] = useState("");

  useEffect(() => {
    let activo = true;

    const cargarPacientes = async () => {
      setErrorCatalogo("");
      try {
        let res;
        try {
          res = await clientesAxios.get("/pacientes", {
            params: PARAMETROS_LISTADO_COMPLETO,
          });
        } catch (err) {
          if (err.response?.status === 404) {
            res = await clientesAxios.get("/paciente", {
              params: PARAMETROS_LISTADO_COMPLETO,
            });
          } else {
            throw err;
          }
        }

        if (!activo) return;
        const lista = extraerListaPacientes(res.data);
        setPacientes(lista);

        if (!pacienteIdParam && lista.length > 0) {
          setPacienteSeleccionado((prev) => {
            if (prev) return prev;
            setLoading(true);
            return String(obtenerIdPaciente(lista[0]) || "");
          });
        }
      } catch (err) {
        if (!activo) return;
        const status = err.response?.status;
        const msg =
          err.response?.data?.mensaje ||
          "No se pudieron cargar los pacientes desde la base de datos.";
        setErrorCatalogo(status ? `${msg} (HTTP ${status})` : msg);
      }
    };

    cargarPacientes();
    return () => {
      activo = false;
    };
  }, [pacienteIdParam]);

  useEffect(() => {
    if (!pacienteSeleccionado) return;

    let activo = true;

    const fetchInforme = async () => {
      try {
        const params = {};
        if (desde) params.desde = desde;
        if (hasta) params.hasta = hasta;
        const res = await obtenerInformePaciente(pacienteSeleccionado, params);
        if (!activo) return;
        setInforme(extraerInforme(res));
        setError("");
      } catch (err) {
        if (!activo) return;
        setError(
          err.response?.data?.mensaje ||
            "No se pudo generar el informe del paciente.",
        );
        setInforme(null);
      } finally {
        if (activo) setLoading(false);
      }
    };

    fetchInforme();
    return () => {
      activo = false;
    };
  }, [pacienteSeleccionado, desde, hasta]);

  const handlePacienteChange = (e) => {
    const nuevoId = e.target.value;
    setPacienteSeleccionado(nuevoId);
    if (nuevoId) {
      setLoading(true);
    } else {
      setInforme(null);
      setLoading(false);
    }
  };

  const handleDesdeChange = (e) => {
    setDesde(e.target.value);
    if (pacienteSeleccionado) setLoading(true);
  };

  const handleHastaChange = (e) => {
    setHasta(e.target.value);
    if (pacienteSeleccionado) setLoading(true);
  };

  const handleLimpiarFechas = () => {
    setDesde("");
    setHasta("");
    if (pacienteSeleccionado) setLoading(true);
  };

  const resumen = informe?.resumen || {
    totalConsultas: 0,
    pesoInicial: null,
    pesoActual: null,
    variacionPeso: null,
    totalMetas: 0,
    metasCompletadas: 0,
    porcentajeMetas: 0,
  };

  const variacionTexto = useMemo(() => {
    if (resumen.variacionPeso === null || resumen.variacionPeso === undefined) {
      return "—";
    }
    const signo = resumen.variacionPeso > 0 ? "+" : "";
    return `${signo}${resumen.variacionPeso} kg`;
  }, [resumen.variacionPeso]);

  return (
    <div className="container py-4 informe-printable">
      <div className="card shadow-sm border-0 p-4 rounded-4 mb-4 no-print">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
          <h3 className="fw-bold text-success mb-0">
            Informe de Evolución y Resumen Clínico
          </h3>
          <CustomButton
            type="button"
            variant="outline-success"
            onClick={() => window.print()}
            disabled={!informe}
          >
            <BsPrinter className="me-2" size={16} />
            Imprimir / Guardar PDF
          </CustomButton>
        </div>

        {errorCatalogo && (
          <div className="alert alert-warning py-2 small mb-3" role="alert">
            {errorCatalogo}
          </div>
        )}

        <div className="row g-3 align-items-end">
          <div className="col-md-5">
            <label
              htmlFor="selectPacienteInforme"
              className="form-label small fw-semibold mb-1"
            >
              Paciente
            </label>
            <select
              id="selectPacienteInforme"
              className="form-select"
              value={pacienteSeleccionado}
              onChange={handlePacienteChange}
            >
              <option value="">
                {pacientes.length === 0
                  ? "Sin pacientes disponibles..."
                  : "Seleccioná un paciente..."}
              </option>
              {pacientes.map((p) => (
                <option
                  key={obtenerIdPaciente(p)}
                  value={obtenerIdPaciente(p)}
                >
                  {formatearNombrePaciente(p)} {p.dni ? `(DNI: ${p.dni})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="col-sm-6 col-md-3">
            <label
              htmlFor="desdeInforme"
              className="form-label small fw-semibold mb-1"
            >
              Desde
            </label>
            <input
              id="desdeInforme"
              type="date"
              className="form-control"
              value={desde}
              onChange={handleDesdeChange}
            />
          </div>

          <div className="col-sm-6 col-md-3">
            <label
              htmlFor="hastaInforme"
              className="form-label small fw-semibold mb-1"
            >
              Hasta
            </label>
            <input
              id="hastaInforme"
              type="date"
              className="form-control"
              value={hasta}
              onChange={handleHastaChange}
            />
          </div>

          <div className="col-md-1 d-grid">
            <CustomButton
              type="button"
              variant="outline-secondary"
              onClick={handleLimpiarFechas}
              title="Limpiar fechas"
            >
              Limpiar
            </CustomButton>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger py-2 small" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <div className="card shadow-sm border-0 p-4 rounded-4 text-center py-5">
          <div
            className="spinner-border spinner-border-sm text-success me-2"
            role="status"
          />
          Generando informe...
        </div>
      ) : !informe ? (
        <div className="card shadow-sm border-0 p-4 rounded-4 text-muted">
          Seleccioná un paciente para visualizar su informe.
        </div>
      ) : (
        <>
          {/* Cabecera del reporte */}
          <div className="card shadow-sm border-0 p-4 rounded-4 mb-4">
            <div className="d-flex flex-wrap justify-content-between align-items-start gap-2">
              <div>
                <h4 className="fw-bold mb-1">
                  {formatearNombrePaciente(informe.paciente)}
                </h4>
                <div className="small text-muted">
                  {informe.paciente?.dni
                    ? `DNI: ${informe.paciente.dni} • `
                    : ""}
                  {informe.paciente?.email || ""}
                </div>
              </div>
              <div className="text-md-end small text-muted">
                <div>Emitido: {formatearFecha(informe.generadoEn)}</div>
                {(informe.rango?.desde || informe.rango?.hasta) && (
                  <div>
                    Período: {formatearFecha(informe.rango.desde)} al{" "}
                    {formatearFecha(informe.rango.hasta)}
                  </div>
                )}
              </div>
            </div>

            {/* KPIs */}
            <div className="row g-3 mt-3">
              <div className="col-6 col-md-3">
                <div className="p-3 rounded-3 bg-light border">
                  <div className="small text-muted">Consultas en período</div>
                  <div className="fs-5 fw-bold text-success">
                    {resumen.totalConsultas}
                  </div>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="p-3 rounded-3 bg-light border">
                  <div className="small text-muted">Peso actual</div>
                  <div className="fs-5 fw-bold">
                    {resumen.pesoActual != null
                      ? `${resumen.pesoActual} kg`
                      : "—"}
                  </div>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="p-3 rounded-3 bg-light border">
                  <div className="small text-muted">Variación de peso</div>
                  <div className="fs-5 fw-bold text-primary">
                    {variacionTexto}
                  </div>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="p-3 rounded-3 bg-light border">
                  <div className="small text-muted">Metas cumplidas</div>
                  <div className="fs-5 fw-bold text-success">
                    {resumen.metasCompletadas}/{resumen.totalMetas} (
                    {resumen.porcentajeMetas}%)
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Evolución cronológica */}
          <div className="card shadow-sm border-0 p-4 rounded-4 mb-4">
            <h5 className="fw-bold text-success mb-3">
              Evolución en Consultas
            </h5>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Peso</th>
                    <th>IMC</th>
                    <th>Motivo / Observaciones</th>
                  </tr>
                </thead>
                <tbody>
                  {(informe.evolucion || []).length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center text-muted py-3">
                        No hay consultas registradas en este rango.
                      </td>
                    </tr>
                  ) : (
                    informe.evolucion.map((fila) => (
                      <tr key={fila._id}>
                        <td>{formatearFecha(fila.fecha)}</td>
                        <td className="fw-medium">
                          {fila.peso != null ? `${fila.peso} kg` : "—"}
                        </td>
                        <td>{fila.imc != null ? fila.imc : "—"}</td>
                        <td className="small text-muted">
                          {fila.motivo || fila.diagnostico || "—"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Plan vigente y Metas */}
          <div className="row g-4">
            <div className="col-md-6">
              <div className="card shadow-sm border-0 p-4 rounded-4 h-100">
                <h5 className="fw-bold text-success mb-3">
                  Plan de Comidas Vigente
                </h5>
                {informe.planVigente ? (
                  <div>
                    <div className="fw-semibold">
                      {informe.planVigente.titulo ||
                        informe.planVigente.nombre ||
                        "Plan nutricional"}
                    </div>
                    <p className="small text-muted mt-2 mb-0">
                      {informe.planVigente.descripcion ||
                        informe.planVigente.observaciones ||
                        "Plan activo registrado en el sistema."}
                    </p>
                  </div>
                ) : (
                  <p className="text-muted small mb-0">
                    Sin plan de comidas registrado.
                  </p>
                )}
              </div>
            </div>

            <div className="col-md-6">
              <div className="card shadow-sm border-0 p-4 rounded-4 h-100">
                <h5 className="fw-bold text-success mb-3">Metas y Objetivos</h5>
                {(informe.metasObjetivos || []).length === 0 ? (
                  <p className="text-muted small mb-0">
                    Sin metas cargadas para el paciente.
                  </p>
                ) : (
                  <ul className="list-group list-group-flush">
                    {informe.metasObjetivos.map((meta) => (
                      <li
                        key={meta._id}
                        className="list-group-item px-0 d-flex justify-content-between align-items-center"
                      >
                        <span className="small">
                          {meta.titulo ||
                            meta.descripcion ||
                            meta.objetivo ||
                            "Objetivo"}
                        </span>
                        <span className="badge bg-success-subtle text-success border border-success-subtle">
                          {meta.estado ||
                            (meta.completada ? "COMPLETADA" : "ACTIVA")}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
