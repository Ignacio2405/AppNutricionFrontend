import { useCallback, useEffect, useState } from "react";
import { BsTrash } from "react-icons/bs";
import clientesAxios from "../../config/axios.js";
import {
  anularPago,
  obtenerPagos,
  registrarPago,
} from "../../services/pago.service.js";
import { CustomButton } from "../ui/CustomButton.jsx";
import { FormularioPago } from "./FormularioPago.jsx";

const METODO_LABEL = {
  EFECTIVO: "Efectivo",
  TRANSFERENCIA: "Transferencia",
  TARJETA_DEBITO: "Tarjeta de débito",
  TARJETA_CREDITO: "Tarjeta de crédito",
  OBRA_SOCIAL: "Obra social",
  OTRO: "Otro",
};

const formatearFecha = (fecha) => {
  if (!fecha) return "—";
  const d = new Date(fecha);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("es-AR", { timeZone: "UTC" });
};

const formatearMoneda = (valor) => {
  const num = Number(valor) || 0;
  return num.toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
  });
};

const formatearPaciente = (paciente) => {
  if (!paciente) return "—";
  if (typeof paciente === "string") return paciente;
  const nombre = `${paciente.apellido || ""}, ${paciente.nombre || ""}`.trim();
  return nombre.replace(/^,\s*|,\s*$/g, "") || "—";
};

const badgeEstadoPago = (estado) => {
  switch (estado) {
    case "PAGADO":
      return "bg-success";
    case "ANULADO":
      return "bg-danger";
    default:
      return "bg-warning text-dark";
  }
};

const extraerListaPacientes = (data) => {
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.data?.pacientes)) return data.data.pacientes;
  if (Array.isArray(data?.pacientes)) return data.pacientes;
  if (Array.isArray(data)) return data;
  return [];
};

export const Pagos = () => {
  const [pagos, setPagos] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [pacienteFiltro, setPacienteFiltro] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [pagoAEliminar, setPagoAEliminar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [accionId, setAccionId] = useState("");
  const [error, setError] = useState("");
  const [mensajeExito, setMensajeExito] = useState("");

  useEffect(() => {
    let activo = true;
    const cargarPacientes = async () => {
      try {
        const { data } = await clientesAxios.get("/pacientes");
        if (!activo) return;
        setPacientes(extraerListaPacientes(data));
      } catch (err) {
        console.error("Error al cargar pacientes:", err);
      }
    };
    cargarPacientes();
    return () => {
      activo = false;
    };
  }, []);

  const recargarPagos = useCallback(async (idPaciente = "", estado = "") => {
    setError("");
    try {
      const params = {};
      if (idPaciente) params.paciente = idPaciente;
      if (estado) params.estado = estado;
      const res = await obtenerPagos(params);
      setPagos(Array.isArray(res?.data) ? res.data : []);
    } catch (err) {
      setError(
        err.response?.data?.mensaje || "No se pudieron cargar los pagos.",
      );
    }
  }, []);

  useEffect(() => {
    let activo = true;

    const fetchPagos = async () => {
      try {
        const params = {};
        if (pacienteFiltro) params.paciente = pacienteFiltro;
        if (estadoFiltro) params.estado = estadoFiltro;
        const res = await obtenerPagos(params);
        if (!activo) return;
        setPagos(Array.isArray(res?.data) ? res.data : []);
        setError("");
      } catch (err) {
        if (!activo) return;
        setError(
          err.response?.data?.mensaje || "No se pudieron cargar los pagos.",
        );
      } finally {
        if (activo) setLoading(false);
      }
    };

    fetchPagos();
    return () => {
      activo = false;
    };
  }, [pacienteFiltro, estadoFiltro]);

  const handleCrearPago = async (payload) => {
    setSubmitting(true);
    setError("");
    setMensajeExito("");
    try {
      const res = await registrarPago(payload);
      setMensajeExito(res?.mensaje || "Pago registrado correctamente.");
      setMostrarFormulario(false);
      await recargarPagos(pacienteFiltro, estadoFiltro);
    } catch (err) {
      setError(err.response?.data?.mensaje || "No se pudo registrar el pago.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmarEliminar = async () => {
    if (!pagoAEliminar?._id) return;
    const id = pagoAEliminar._id;
    setAccionId(id);
    setError("");
    setMensajeExito("");
    try {
      const res = await anularPago(id);
      setMensajeExito(res?.mensaje || "Pago eliminado correctamente.");
      setPagoAEliminar(null);
      await recargarPagos(pacienteFiltro, estadoFiltro);
    } catch (err) {
      setError(err.response?.data?.mensaje || "No se pudo eliminar el pago.");
    } finally {
      setAccionId("");
    }
  };

  const totalPagadoFiltrado = pagos
    .filter((p) => p.estado === "PAGADO")
    .reduce((acc, p) => acc + (Number(p.monto) || 0), 0);

  return (
    <div className="container py-4">
      <div className="card shadow-sm border-0 p-4 rounded-4 mb-4">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
          <div>
            <h3 className="fw-bold text-success mb-0">Registro de Pagos</h3>
            <small className="text-muted">
              Total cobrado (filtrados):{" "}
              <strong className="text-success">
                {formatearMoneda(totalPagadoFiltrado)}
              </strong>
            </small>
          </div>
          <CustomButton
            type="button"
            onClick={() => {
              setError("");
              setMensajeExito("");
              setPagoAEliminar(null);
              setMostrarFormulario((prev) => !prev);
            }}
          >
            {mostrarFormulario ? "Cerrar formulario" : "+ Registrar Pago"}
          </CustomButton>
        </div>

        {/* Filtros */}
        <div className="row g-2 align-items-end">
          <div className="col-sm-6 col-md-4">
            <label
              htmlFor="filtroPacientePago"
              className="form-label small fw-semibold mb-1"
            >
              Paciente
            </label>
            <select
              id="filtroPacientePago"
              className="form-select"
              value={pacienteFiltro}
              onChange={(e) => {
                setLoading(true);
                setPacienteFiltro(e.target.value);
              }}
            >
              <option value="">Todos los pacientes</option>
              {pacientes.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.apellido || ""}, {p.nombre || ""}
                </option>
              ))}
            </select>
          </div>

          <div className="col-sm-6 col-md-3">
            <label
              htmlFor="filtroEstadoPago"
              className="form-label small fw-semibold mb-1"
            >
              Estado
            </label>
            <select
              id="filtroEstadoPago"
              className="form-select"
              value={estadoFiltro}
              onChange={(e) => {
                setLoading(true);
                setEstadoFiltro(e.target.value);
              }}
            >
              <option value="">Todos los estados</option>
              <option value="PAGADO">Pagado</option>
              <option value="PENDIENTE">Pendiente</option>
              <option value="ANULADO">Anulado</option>
            </select>
          </div>

          {(pacienteFiltro || estadoFiltro) && (
            <div className="col-auto">
              <CustomButton
                type="button"
                variant="outline-secondary"
                onClick={() => {
                  setLoading(true);
                  setPacienteFiltro("");
                  setEstadoFiltro("");
                }}
              >
                Limpiar filtros
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

      {pagoAEliminar && (
        <div
          className="alert alert-warning border-warning d-flex flex-wrap justify-content-between align-items-center gap-3 rounded-4 shadow-sm mb-4"
          role="alert"
        >
          <div>
            <strong className="d-block">¿Querés eliminar este pago?</strong>
            <span className="small">
              Paciente:{" "}
              <strong>{formatearPaciente(pagoAEliminar.paciente)}</strong> —
              Monto: <strong>{formatearMoneda(pagoAEliminar.monto)}</strong> (
              {pagoAEliminar.concepto || "Consulta nutricional"}).
            </span>
          </div>
          <div className="d-flex gap-2">
            <CustomButton
              type="button"
              variant="secondary"
              disabled={accionId === pagoAEliminar._id}
              onClick={() => setPagoAEliminar(null)}
            >
              Cancelar
            </CustomButton>
            <CustomButton
              type="button"
              variant="danger"
              loading={accionId === pagoAEliminar._id}
              onClick={handleConfirmarEliminar}
            >
              Sí, eliminar
            </CustomButton>
          </div>
        </div>
      )}

      {mostrarFormulario && (
        <div className="mb-4">
          <FormularioPago
            onSubmit={handleCrearPago}
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
                <th>Fecha</th>
                <th>Paciente</th>
                <th>Concepto</th>
                <th>Método</th>
                <th>Monto</th>
                <th>Estado</th>
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
                    Cargando pagos...
                  </td>
                </tr>
              ) : pagos.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center text-muted py-4">
                    No hay pagos registrados para mostrar.
                  </td>
                </tr>
              ) : (
                pagos.map((pago) => {
                  const yaAnulado = pago.estado === "ANULADO";
                  const ocupado = accionId === pago._id;

                  return (
                    <tr key={pago._id}>
                      <td>{formatearFecha(pago.fecha)}</td>
                      <td className="fw-medium">
                        {formatearPaciente(pago.paciente)}
                      </td>
                      <td>
                        <div>{pago.concepto || "Consulta nutricional"}</div>
                        {pago.observaciones && (
                          <div className="small text-muted">
                            {pago.observaciones}
                          </div>
                        )}
                      </td>
                      <td>
                        {METODO_LABEL[pago.metodoPago] || pago.metodoPago}
                      </td>
                      <td className="fw-semibold">
                        {formatearMoneda(pago.monto)}
                      </td>
                      <td>
                        <span
                          className={`badge ${badgeEstadoPago(pago.estado)}`}
                        >
                          {pago.estado}
                        </span>
                      </td>
                      <td>
                        {!yaAnulado && (
                          <CustomButton
                            type="button"
                            variant="outline-danger"
                            title="Eliminar pago"
                            aria-label="Eliminar pago"
                            disabled={ocupado}
                            onClick={() => {
                              setError("");
                              setMensajeExito("");
                              setPagoAEliminar(pago);
                            }}
                          >
                            <BsTrash size={16} />
                          </CustomButton>
                        )}
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
