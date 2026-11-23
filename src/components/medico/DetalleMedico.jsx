import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CustomButton } from "../ui/CustomButton.jsx";
import clientesAxios from "../../config/axios.js";

export const DetalleMedico = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [medico, setMedico] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    let activo = true;

    const cargarMedico = async () => {
      try {
        const { data } = await clientesAxios.get(`/medicos/${id}`);
        if (!activo) return;
        setMedico(data?.data || null);
      } catch (err) {
        if (!activo) return;
        console.error("Error al obtener detalle del médico:", err);
        setErrorMsg(
          err.response?.data?.mensaje ||
            "No se pudo obtener el detalle del médico.",
        );
      } finally {
        if (activo) setLoading(false);
      }
    };

    cargarMedico();
    return () => {
      activo = false;
    };
  }, [id]);

  const formatearTelefono = (telefono) => {
    if (!telefono) return "—";
    if (typeof telefono === "string") return telefono || "—";
    const partes = [telefono.codigoArea, telefono.numero]
      .filter(Boolean)
      .join("-");
    return telefono.tipo
      ? `${partes || "—"} (${String(telefono.tipo).toLowerCase()})`
      : partes || "—";
  };

  const formatearObrasSociales = (obraSocial) => {
    if (!obraSocial) return "Ninguna asignada";
    const lista = Array.isArray(obraSocial) ? obraSocial : [obraSocial];
    const nombres = lista
      .map((os) => (typeof os === "object" ? os?.razonSocial : os))
      .filter(Boolean);
    return nombres.length ? nombres.join(", ") : "Ninguna asignada";
  };

  if (loading) {
    return (
      <div className="container py-4" style={{ maxWidth: "800px" }}>
        <div className="card shadow-sm border-0 p-4 rounded-4 text-center">
          <div className="spinner-border text-success mx-auto" role="status" />
          <p className="text-muted mt-2 mb-0">Cargando datos del médico...</p>
        </div>
      </div>
    );
  }

  if (errorMsg || !medico) {
    return (
      <div className="container py-4" style={{ maxWidth: "800px" }}>
        <div className="card shadow-sm border-0 p-4 rounded-4">
          <div className="alert alert-danger mb-3">
            {errorMsg || "Médico no encontrado."}
          </div>
          <div>
            <CustomButton
              type="button"
              variant="secondary"
              onClick={() => navigate("/medicos")}
            >
              ← Volver al listado
            </CustomButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4" style={{ maxWidth: "800px" }}>
      <div className="card shadow-sm border-0 p-4 rounded-4">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 border-bottom pb-3 mb-4">
          <div>
            <h3 className="fw-bold text-success mb-1">
              {`${medico.nombre || ""} ${medico.apellido || ""}`.trim() ||
                "Médico"}
            </h3>
            <p className="text-muted small mb-0">DNI: {medico.dni || "—"}</p>
          </div>

          <div className="d-flex flex-wrap gap-2">
            <CustomButton
              type="button"
              variant="secondary"
              onClick={() => navigate("/medicos")}
            >
              ← Volver
            </CustomButton>
            <CustomButton
              type="button"
              variant="outline-primary"
              onClick={() => navigate(`/medicos/editar/${medico._id}`)}
            >
              Editar
            </CustomButton>
          </div>
        </div>

        <div className="row g-3">
          <div className="col-md-6">
            <div className="border rounded-3 p-3 bg-light h-100">
              <div className="small text-muted">Nombre y Apellido</div>
              <div className="fw-semibold">
                {`${medico.nombre || ""} ${medico.apellido || ""}`.trim() ||
                  "—"}
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="border rounded-3 p-3 bg-light h-100">
              <div className="small text-muted">DNI</div>
              <div className="fw-semibold">{medico.dni || "—"}</div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="border rounded-3 p-3 bg-light h-100">
              <div className="small text-muted">Correo Electrónico</div>
              <div className="fw-semibold">{medico.email || "—"}</div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="border rounded-3 p-3 bg-light h-100">
              <div className="small text-muted">Teléfono</div>
              <div className="fw-semibold">
                {formatearTelefono(medico.telefono)}
              </div>
            </div>
          </div>

          <div className="col-12">
            <div className="border rounded-3 p-3 bg-light h-100">
              <div className="small text-muted">Obras Sociales</div>
              <div className="fw-semibold">
                {formatearObrasSociales(medico.obraSocial)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
