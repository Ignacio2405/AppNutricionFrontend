import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CustomButton } from "../ui/CustomButton";
import clientesAxios from "../../config/axios.js";

export const DetalleConsulta = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [consulta, setConsulta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorServer, setErrorServer] = useState("");

  useEffect(() => {
    let cancelado = false;

    const fetchDetalle = async () => {
      setLoading(true);
      setErrorServer("");
      try {
        const { data } = await clientesAxios.get(`/consulta/${id}`);
        if (cancelado) return;
        setConsulta(data.data || data.consulta || data);
      } catch (err) {
        console.error("Error al obtener consulta:", err);
        if (!cancelado) {
          setErrorServer(
            err.response?.data?.mensaje || "No se pudo cargar la consulta.",
          );
        }
      } finally {
        if (!cancelado) {
          setLoading(false);
        }
      }
    };

    if (id) fetchDetalle();
    return () => {
      cancelado = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-success" role="status" />
        <p className="text-muted mt-2">Cargando detalle de consulta...</p>
      </div>
    );
  }

  if (errorServer || !consulta) {
    return (
      <div className="container py-4" style={{ maxWidth: "760px" }}>
        <div className="alert alert-danger">
          {errorServer || "Consulta no encontrada."}
        </div>
        <CustomButton variant="secondary" onClick={() => navigate("/consulta")}>
          Volver al listado
        </CustomButton>
      </div>
    );
  }

  const consultaId = consulta._id || consulta.id || id;
  const mediciones = consulta.antropometria?.mediciones || {};
  const resultados = consulta.antropometria?.resultados || {};

  const nombrePaciente =
    typeof consulta.paciente === "object" && consulta.paciente
      ? `${consulta.paciente.apellido || ""} ${consulta.paciente.nombre || ""}`.trim()
      : consulta.paciente || "-";

  const nombreMedico =
    typeof consulta.medico === "object" && consulta.medico
      ? `${consulta.medico.apellido || ""} ${consulta.medico.nombre || ""}`.trim()
      : consulta.medico || "-";

  return (
    <div className="container py-4" style={{ maxWidth: "820px" }}>
      <div className="card shadow-sm border-0 p-4 rounded-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="fw-bold text-success m-0">Detalle de Consulta</h3>
          <div className="d-flex gap-2">
            <CustomButton
              variant="secondary"
              onClick={() => navigate("/consulta")}
            >
              Volver
            </CustomButton>
            <CustomButton
              variant="success"
              onClick={() => navigate(`/consulta/${consultaId}/editar`)}
            >
              Editar Consulta
            </CustomButton>
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-md-6">
            <p className="mb-1 text-muted small">Paciente</p>
            <p className="fw-semibold">{nombrePaciente}</p>
          </div>
          <div className="col-md-6">
            <p className="mb-1 text-muted small">Médico</p>
            <p className="fw-semibold">{nombreMedico}</p>
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-md-4">
            <p className="mb-1 text-muted small">Fecha</p>
            <p className="fw-semibold">
              {consulta.fecha
                ? new Date(consulta.fecha).toLocaleDateString("es-AR", {
                    timeZone: "UTC",
                  })
                : "-"}
            </p>
          </div>
          <div className="col-md-4">
            <p className="mb-1 text-muted small">Hora</p>
            <p className="fw-semibold">{consulta.hora || "-"}</p>
          </div>
          <div className="col-md-4">
            <p className="mb-1 text-muted small">Turno</p>
            <p className="fw-semibold">
              {consulta.turno || "Sin turno asociado"}
            </p>
          </div>
        </div>

        <hr />
        <h6 className="fw-semibold text-secondary mb-3">Mediciones</h6>
        <div className="row g-2 mb-3">
          <div className="col-6 col-md-3">
            Peso: <strong>{mediciones.peso ?? "-"}</strong>
          </div>
          <div className="col-6 col-md-3">
            Talla: <strong>{mediciones.talla ?? "-"}</strong>
          </div>
          <div className="col-6 col-md-3">
            Cuello: <strong>{mediciones.cuello ?? "-"}</strong>
          </div>
          <div className="col-6 col-md-3">
            Brazo: <strong>{mediciones.brazo ?? "-"}</strong>
          </div>
          <div className="col-6 col-md-3">
            Cintura: <strong>{mediciones.cintura ?? "-"}</strong>
          </div>
          <div className="col-6 col-md-3">
            Cadera: <strong>{mediciones.cadera ?? "-"}</strong>
          </div>
          <div className="col-6 col-md-3">
            P. Tricipital: <strong>{mediciones.pTricipital ?? "-"}</strong>
          </div>
          <div className="col-6 col-md-3">
            P. Bicipital: <strong>{mediciones.pBicipital ?? "-"}</strong>
          </div>
          <div className="col-6 col-md-3">
            P. Subescapular: <strong>{mediciones.pSubescapular ?? "-"}</strong>
          </div>
          <div className="col-6 col-md-3">
            P. Suprailíaco: <strong>{mediciones.pSuprailiaco ?? "-"}</strong>
          </div>
        </div>

        <hr />
        <h6 className="fw-semibold text-secondary mb-3">
          Resultados Antropométricos
        </h6>
        <div className="row g-2 mb-3">
          <div className="col-6 col-md-3">
            IMC: <strong>{resultados.imc ?? "-"}</strong>
          </div>
          <div className="col-6 col-md-3">
            % MG: <strong>{resultados.porcentajeMG ?? "-"}</strong>
          </div>
          <div className="col-6 col-md-3">
            % MM: <strong>{resultados.porcentajeMM ?? "-"}</strong>
          </div>
          <div className="col-6 col-md-3">
            Met. Basal: <strong>{resultados.mBasal ?? "-"}</strong>
          </div>
          <div className="col-6 col-md-4">
            Body Age: <strong>{resultados.bodyAge ?? "-"}</strong>
          </div>
          <div className="col-6 col-md-4">
            Gr. Visceral: <strong>{resultados.grVisceral ?? "-"}</strong>
          </div>
          <div className="col-6 col-md-4">
            ICC: <strong>{resultados.icc ?? "-"}</strong>
          </div>
        </div>

        <hr />
        <h6 className="fw-semibold text-secondary mb-2">Observaciones</h6>
        <p className="mb-0">{consulta.observaciones || "Sin observaciones."}</p>
      </div>
    </div>
  );
};
