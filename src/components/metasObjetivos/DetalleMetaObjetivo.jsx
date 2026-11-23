import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { obtenerMetaObjetivoPorId } from "../../services/metaObjetivo.service.js";
import { CustomButton } from "../ui/CustomButton.jsx";

const formatearFecha = (fecha) => {
  if (!fecha) return "-";
  const d = new Date(fecha);
  return Number.isNaN(d.getTime()) ? "-" : d.toLocaleDateString("es-AR");
};

const formatearCumplimiento = (completed) => {
  if (typeof completed === "boolean") {
    return completed ? "Cumplido" : "No cumplido";
  }
  if (typeof completed === "number") {
    return `${completed}%`;
  }
  if (completed === null || completed === undefined || completed === "") {
    return "-";
  }
  return String(completed);
};

export const DetalleMetaObjetivo = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    let activo = true;

    const cargar = async () => {
      try {
        const data = await obtenerMetaObjetivoPorId(id);
        if (!activo) return;
        setMeta(data || null);
      } catch (err) {
        if (!activo) return;
        console.error("Error al cargar detalle de metas:", err);
        setErrorMsg(
          err.response?.data?.mensaje ||
            "No se pudo obtener el detalle de metas y objetivos.",
        );
      } finally {
        if (activo) setLoading(false);
      }
    };

    cargar();
    return () => {
      activo = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="container py-4">
        <div className="card shadow-sm border-0 p-4 rounded-4 text-center">
          <div className="spinner-border text-success mx-auto" role="status" />
          <p className="text-muted mt-2 mb-0">Cargando detalle...</p>
        </div>
      </div>
    );
  }

  if (errorMsg || !meta) {
    return (
      <div className="container py-4">
        <div className="card shadow-sm border-0 p-4 rounded-4">
          <div className="alert alert-danger mb-3">
            {errorMsg || "Registro no encontrado."}
          </div>
          <div>
            <CustomButton
              type="button"
              variant="secondary"
              onClick={() => navigate("/metas-objetivos")}
            >
              ← Volver al listado
            </CustomButton>
          </div>
        </div>
      </div>
    );
  }

  const pac = typeof meta.pacienteId === "object" ? meta.pacienteId : null;
  const cons = typeof meta.consultaId === "object" ? meta.consultaId : null;
  const objetivos = Array.isArray(meta.objetivos) ? meta.objetivos : [];

  return (
    <div className="container py-4">
      <div className="card shadow-sm border-0 p-4 rounded-4">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 border-bottom pb-3 mb-4">
          <div>
            <h3 className="fw-bold text-success mb-1">
              Metas y Objetivos del Paciente
            </h3>
            <div className="text-muted small">
              <strong>Paciente:</strong>{" "}
              {pac
                ? `${pac.apellido || ""}, ${pac.nombre || ""}`.trim()
                : "Sin paciente"}
              {pac?.dni ? ` · DNI ${pac.dni}` : ""}
            </div>
            {cons && (
              <div className="text-muted small">
                <strong>Consulta pautada:</strong> {formatearFecha(cons.fecha)}
                {cons.motivo ? ` — ${cons.motivo}` : ""}
              </div>
            )}
          </div>

          <div className="d-flex flex-wrap gap-2">
            <CustomButton
              type="button"
              variant="secondary"
              onClick={() => navigate("/metas-objetivos")}
            >
              ← Volver
            </CustomButton>
            <CustomButton
              type="button"
              variant="outline-primary"
              onClick={() => navigate(`/metas-objetivos/editar/${meta._id}`)}
            >
              Editar
            </CustomButton>
          </div>
        </div>

        {objetivos.length === 0 ? (
          <p className="text-muted mb-0">Sin objetivos registrados.</p>
        ) : (
          <div className="row g-3">
            {objetivos.map((obj, idx) => (
              <div className="col-12" key={obj._id || idx}>
                <div className="border rounded-3 p-3 bg-light">
                  <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2">
                    <h6 className="fw-bold mb-0">{obj.description}</h6>
                    <div className="d-flex gap-2">
                      <span className="badge bg-secondary-subtle text-secondary text-capitalize">
                        {obj.frecuenciaEsperada || "diaria"}
                      </span>
                      <span
                        className={`badge text-capitalize ${
                          obj.status === "cumplido"
                            ? "bg-success-subtle text-success"
                            : obj.status === "pausado"
                              ? "bg-warning-subtle text-warning-emphasis"
                              : "bg-primary-subtle text-primary"
                        }`}
                      >
                        {obj.status || "activo"}
                      </span>
                    </div>
                  </div>

                  {Array.isArray(obj.registro) && obj.registro.length > 0 && (
                    <div className="table-responsive mt-2">
                      <table className="table table-sm table-bordered bg-white mb-0">
                        <thead>
                          <tr>
                            <th>Fecha de control</th>
                            <th>Cumplimiento / Logro</th>
                          </tr>
                        </thead>
                        <tbody>
                          {obj.registro.map((reg, rIdx) => (
                            <tr key={reg._id || rIdx}>
                              <td>{formatearFecha(reg.date)}</td>
                              <td>{formatearCumplimiento(reg.completed)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
