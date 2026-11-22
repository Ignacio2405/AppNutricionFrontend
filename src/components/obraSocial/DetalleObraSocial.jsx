import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import clientesAxios from "../../config/axios.js";
import { CustomButton } from "../ui/CustomButton.jsx";

export const DetalleObraSocial = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [obraSocial, setObraSocial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    let activo = true;

    const cargarDetalle = async () => {
      try {
        const { data } = await clientesAxios.get(`/obraSocial/${id}`);
        if (!activo) return;
        setObraSocial(data?.data || null);
      } catch (err) {
        if (!activo) return;
        console.error("Error al obtener detalle de obra social:", err);
        setErrorMsg(
          err.response?.data?.mensaje ||
            "No se pudo obtener el detalle de la obra social.",
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

  const formatearTelefono = (telefono) => {
    if (!telefono) return "—";
    if (typeof telefono === "string") return telefono || "—";
    return (
      [telefono.codigoArea, telefono.numero].filter(Boolean).join("-") || "—"
    );
  };

  if (loading) {
    return (
      <div className="container py-4">
        <div className="card shadow-sm border-0 p-4 rounded-4 text-center">
          <div className="spinner-border text-success mx-auto" role="status" />
          <p className="text-muted mt-2 mb-0">
            Cargando detalle de la obra social...
          </p>
        </div>
      </div>
    );
  }

  if (errorMsg || !obraSocial) {
    return (
      <div className="container py-4">
        <div className="card shadow-sm border-0 p-4 rounded-4">
          <div className="alert alert-danger mb-3">
            {errorMsg || "Obra social no encontrada."}
          </div>
          <div>
            <CustomButton
              type="button"
              variant="secondary"
              onClick={() => navigate("/obras-sociales")}
            >
              ← Volver al listado
            </CustomButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="card shadow-sm border-0 p-4 rounded-4">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 border-bottom pb-3 mb-4">
          <div>
            <h3 className="fw-bold text-success mb-1">
              {obraSocial.razonSocial || "Obra Social"}
            </h3>
            <span
              className={`badge rounded-pill px-2 py-1 ${
                obraSocial.activo !== false
                  ? "bg-success-subtle text-success"
                  : "bg-secondary-subtle text-secondary"
              }`}
            >
              {obraSocial.activo !== false ? "Activa" : "Inactiva"}
            </span>
          </div>

          <div className="d-flex flex-wrap gap-2">
            <CustomButton
              type="button"
              variant="secondary"
              onClick={() => navigate("/obras-sociales")}
            >
              ← Volver
            </CustomButton>
            <CustomButton
              type="button"
              variant="outline-primary"
              onClick={() =>
                navigate(`/obras-sociales/editar/${obraSocial._id}`)
              }
            >
              Editar
            </CustomButton>
          </div>
        </div>

        <div className="row g-3">
          <div className="col-md-6">
            <div className="border rounded-3 p-3 bg-light h-100">
              <div className="small text-muted">Razón Social</div>
              <div className="fw-semibold fs-6">
                {obraSocial.razonSocial || "—"}
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="border rounded-3 p-3 bg-light h-100">
              <div className="small text-muted">CUIT</div>
              <div className="fw-semibold fs-6">{obraSocial.cuit || "—"}</div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="border rounded-3 p-3 bg-light h-100">
              <div className="small text-muted">Dirección</div>
              <div className="fw-semibold fs-6">
                {obraSocial.direccion || "—"}
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="border rounded-3 p-3 bg-light h-100">
              <div className="small text-muted">Teléfono</div>
              <div className="fw-semibold fs-6">
                {formatearTelefono(obraSocial.telefono)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
