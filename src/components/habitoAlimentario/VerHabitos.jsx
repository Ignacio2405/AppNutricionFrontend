import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CustomButton } from "../ui/CustomButton";
import clientesAxios from "../../config/axios.js";

export const VerHabitos = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [habitos, setHabitos] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    let activo = true;

    const cargarDetalle = async () => {
      try {
        const { data } = await clientesAxios.get(`/habitos/${id}`);
        if (!activo) return;
        setHabitos(data.data || data);
      } catch (err) {
        if (!activo) return;
        console.error("Error al obtener hábitos alimentarios:", err);
        setErrorMsg(
          err.response?.data?.mensaje ||
            "No se pudo cargar el detalle de hábitos alimentarios.",
        );
      } finally {
        if (activo) setLoading(false);
      }
    };

    cargarDetalle();
    return () => {
      activo = false;
    };
  }, [id]);

  const nombrePaciente = () => {
    const p = habitos?.pacienteId;
    if (!p) return "Sin paciente";
    if (typeof p === "object") {
      return [p.apellido, p.nombre].filter(Boolean).join(", ");
    }
    return p;
  };

  if (loading) {
    return (
      <div className="container py-4">
        <div className="card shadow-sm border-0 p-4 rounded-4">
          <p className="text-muted mb-0">Cargando detalle...</p>
        </div>
      </div>
    );
  }

  if (errorMsg || !habitos) {
    return (
      <div className="container py-4">
        <div className="card shadow-sm border-0 p-4 rounded-4">
          <div className="alert alert-danger py-2 small">
            {errorMsg || "Registro no encontrado."}
          </div>
          <div>
            <CustomButton
              type="button"
              variant="secondary"
              onClick={() => navigate("/habitos-alimentarios")}
            >
              Volver al listado
            </CustomButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="card shadow-sm border-0 p-4 rounded-4">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
          <div>
            <h3 className="fw-bold text-success mb-1">Hábitos Alimentarios</h3>
            <p className="text-muted mb-0">
              Paciente: <strong>{nombrePaciente()}</strong>
            </p>
          </div>

          <div className="d-flex gap-2">
            <CustomButton
              type="button"
              variant="secondary"
              onClick={() => navigate("/habitos-alimentarios")}
            >
              Volver
            </CustomButton>
            <CustomButton
              type="button"
              onClick={() => navigate(`/habitos-alimentarios/editar/${id}`)}
            >
              Editar
            </CustomButton>
          </div>
        </div>

        {/* Métricas principales */}
        <div className="row g-3 mb-4">
          <div className="col-sm-6 col-md-3">
            <div className="p-3 rounded-3 bg-light border h-100">
              <small className="text-muted d-block">Comidas diarias</small>
              <strong className="fs-5 text-dark">
                {habitos.cantidadComidasDiarias}
              </strong>
            </div>
          </div>

          <div className="col-sm-6 col-md-3">
            <div className="p-3 rounded-3 bg-light border h-100">
              <small className="text-muted d-block">Consumo de agua</small>
              <strong className="fs-5 text-dark">
                {habitos.consumoAguaDiarioLitros} L / día
              </strong>
            </div>
          </div>

          <div className="col-sm-6 col-md-3">
            <div className="p-3 rounded-3 bg-light border h-100">
              <small className="text-muted d-block">Actividad física</small>
              <strong className="fs-5 text-dark text-capitalize">
                {habitos.nivelActividadFisica || "-"}
              </strong>
            </div>
          </div>

          <div className="col-sm-6 col-md-3">
            <div className="p-3 rounded-3 bg-light border h-100">
              <small className="text-muted d-block">Sueño / Estrés</small>
              <strong className="fs-5 text-dark text-capitalize">
                {habitos.horasSuenoNocturno ?? "-"} hs · {habitos.nivelEstres}
              </strong>
            </div>
          </div>
        </div>

        {/* Preferencias alimentarias */}
        <div className="row g-3 mb-4">
          <div className="col-md-6">
            <div className="p-3 rounded-3 border h-100">
              <h6 className="fw-bold text-success mb-2">
                Alimentos preferidos
              </h6>
              {habitos.alimentosPreferidos?.length ? (
                <div className="d-flex flex-wrap gap-1">
                  {habitos.alimentosPreferidos.map((item, idx) => (
                    <span
                      key={idx}
                      className="badge bg-success-subtle text-success px-2 py-1"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-muted small mb-0">
                  No se registraron alimentos preferidos.
                </p>
              )}
            </div>
          </div>

          <div className="col-md-6">
            <div className="p-3 rounded-3 border h-100">
              <h6 className="fw-bold text-danger mb-2">
                Alimentos que rechaza
              </h6>
              {habitos.alimentosRechazados?.length ? (
                <div className="d-flex flex-wrap gap-1">
                  {habitos.alimentosRechazados.map((item, idx) => (
                    <span
                      key={idx}
                      className="badge bg-danger-subtle text-danger px-2 py-1"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-muted small mb-0">
                  No se registraron alimentos rechazados.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Historial y resultados de dietas previas */}
        <div className="row g-3">
          <div className="col-md-6">
            <div className="p-3 rounded-3 border h-100">
              <h6 className="fw-bold text-secondary mb-2">
                Historial de dietas previas
              </h6>
              <p className="mb-0 text-dark">
                {habitos.historialDietasPrevias ||
                  "Sin antecedentes registrados."}
              </p>
            </div>
          </div>

          <div className="col-md-6">
            <div className="p-3 rounded-3 border h-100">
              <h6 className="fw-bold text-secondary mb-2">
                Resultados de dietas previas
              </h6>
              <p className="mb-0 text-dark">
                {habitos.resultadosDietasPrevias ||
                  "Sin resultados registrados."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
