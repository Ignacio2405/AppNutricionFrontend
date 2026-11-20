import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CustomButton } from "../ui/CustomButton";
import clientesAxios from "../../config/axios.js";

export const DetalleHistorial = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [historial, setHistorial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchDetalle = async () => {
      try {
        setLoading(true);
        const { data } = await clientesAxios.get(`/historial-medico/${id}`);
        setHistorial(data?.data || data);
      } catch (err) {
        console.error("Error al obtener detalle del historial:", err);
        setErrorMsg("No se pudo cargar el detalle del historial médico.");
      } finally {
        setLoading(false);
      }
    };
    fetchDetalle();
  }, [id]);

  if (loading) {
    return (
      <div className="container py-4">
        <p className="text-muted">Cargando detalle del historial...</p>
      </div>
    );
  }

  if (errorMsg || !historial) {
    return (
      <div className="container py-4">
        <div className="alert alert-danger">
          {errorMsg || "Historial no encontrado."}
        </div>
        <CustomButton variant="secondary" onClick={() => navigate(-1)}>
          Volver
        </CustomButton>
      </div>
    );
  }

  const pac =
    typeof historial.pacienteId === "object" ? historial.pacienteId : null;

  return (
    <div className="container py-4" style={{ maxWidth: "860px" }}>
      <div className="card shadow-sm border-0 p-4 rounded-4">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
          <h3 className="fw-bold text-success mb-0">
            Detalle de Historial Médico
          </h3>
          <div className="d-flex gap-2">
            <CustomButton
              type="button"
              variant="outline-primary"
              onClick={() =>
                navigate(`/historial-medico/editar/${historial._id}`)
              }
            >
              Editar
            </CustomButton>
            <CustomButton
              type="button"
              variant="secondary"
              onClick={() => navigate("/historial-medico")}
            >
              Volver
            </CustomButton>
          </div>
        </div>

        <p className="mb-3">
          <strong>Paciente:</strong>{" "}
          {pac
            ? `${pac.apellido}, ${pac.nombre} ${pac.dni ? `(DNI: ${pac.dni})` : ""}`
            : historial.pacienteId}
        </p>

        <hr />
        <h6 className="fw-semibold text-secondary">Patologías y Alergias</h6>
        <p className="mb-1">
          <strong>Patologías actuales:</strong>{" "}
          {historial.patologiasActuales?.length
            ? historial.patologiasActuales.join(", ")
            : "Ninguna registrada"}
        </p>
        <p className="mb-3">
          <strong>Alergias e intolerancias:</strong>{" "}
          {historial.alergiasIntolerancias?.length
            ? historial.alergiasIntolerancias.join(", ")
            : "Ninguna registrada"}
        </p>

        <hr />
        <h6 className="fw-semibold text-secondary">Antecedentes</h6>
        <div className="row mb-2">
          <div className="col-6 col-md-3">
            <strong>Obesidad:</strong>{" "}
            {historial.antecedentes?.obesidad ? "Sí" : "No"}
          </div>
          <div className="col-6 col-md-3">
            <strong>Diabetes:</strong>{" "}
            {historial.antecedentes?.diabetes ? "Sí" : "No"}
          </div>
          <div className="col-6 col-md-3">
            <strong>Cardiopatías:</strong>{" "}
            {historial.antecedentes?.cardiopatias ? "Sí" : "No"}
          </div>
          <div className="col-6 col-md-3">
            <strong>Cáncer:</strong>{" "}
            {historial.antecedentes?.cancer ? "Sí" : "No"}
          </div>
        </div>
        {historial.antecedentes?.observaciones && (
          <p className="mb-3">
            <strong>Observaciones:</strong>{" "}
            {historial.antecedentes.observaciones}
          </p>
        )}

        <hr />
        <h6 className="fw-semibold text-secondary">
          Medicamentos y Suplementos
        </h6>
        {historial.medicamentosSuplementos?.length ? (
          <ul className="list-group mb-3">
            {historial.medicamentosSuplementos.map((m, idx) => (
              <li className="list-group-item" key={idx}>
                <strong>{m.nombre}</strong>
                {m.dosis ? ` — Dosis: ${m.dosis}` : ""}
                {m.frecuencia ? ` — Frecuencia: ${m.frecuencia}` : ""}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted mb-3">
            Sin medicamentos ni suplementos registrados.
          </p>
        )}

        <hr />
        <h6 className="fw-semibold text-secondary">Salud Digestiva</h6>
        <p className="mb-1">
          <strong>Acidez:</strong>{" "}
          {historial.saludDigestiva?.acidez ? "Sí" : "No"} |{" "}
          <strong>Distensión:</strong>{" "}
          {historial.saludDigestiva?.distension ? "Sí" : "No"}
        </p>
        <p className="mb-1">
          <strong>Tránsito intestinal:</strong>{" "}
          {historial.saludDigestiva?.transitoIntestinal || "No especificado"}
        </p>
        {historial.saludDigestiva?.observaciones && (
          <p className="mb-3">
            <strong>Observaciones digestivas:</strong>{" "}
            {historial.saludDigestiva.observaciones}
          </p>
        )}

        {historial.observacionesGinecoObstetricas && (
          <>
            <hr />
            <h6 className="fw-semibold text-secondary">
              Observaciones Gineco-Obstétricas
            </h6>
            <p className="mb-0">{historial.observacionesGinecoObstetricas}</p>
          </>
        )}
      </div>
    </div>
  );
};
