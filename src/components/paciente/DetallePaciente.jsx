import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CustomButton } from "../ui/CustomButton";
import clientesAxios from "../../config/axios.js";

const formatearFecha = (fecha) => {
  if (!fecha) return "-";
  const d = new Date(fecha);
  return Number.isNaN(d.getTime()) ? "-" : d.toLocaleDateString("es-AR");
};

export const DetallePaciente = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [paciente, setPaciente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    let activo = true;

    const cargarPaciente = async () => {
      try {
        const { data } = await clientesAxios.get(`/pacientes/${id}`);
        if (!activo) return;
        setPaciente(data?.data || null);
      } catch (err) {
        if (!activo) return;
        console.error("Error al obtener paciente:", err);
        setErrorMsg(
          err.response?.data?.mensaje ||
            "No se pudo obtener el detalle del paciente.",
        );
      } finally {
        if (activo) setLoading(false);
      }
    };

    cargarPaciente();
    return () => {
      activo = false;
    };
  }, [id]);

  const formatearSexo = (sexo) => {
    if (sexo === "F") return "Femenino";
    if (sexo === "M") return "Masculino";
    return "-";
  };

  const formatearTelefono = (telefono) => {
    if (!telefono) return "-";
    if (typeof telefono === "string") return telefono || "-";
    const partes = [telefono.codigoArea, telefono.numero]
      .filter(Boolean)
      .join("-");
    return telefono.tipo
      ? `${partes || "-"} (${String(telefono.tipo).toLowerCase()})`
      : partes || "-";
  };

  if (loading) {
    return (
      <div className="container py-4" style={{ maxWidth: "800px" }}>
        <div className="card shadow-sm border-0 p-4 rounded-4 text-center">
          <div className="spinner-border text-success mx-auto" role="status" />
          <p className="text-muted mt-2 mb-0">Cargando datos del paciente...</p>
        </div>
      </div>
    );
  }

  if (errorMsg || !paciente) {
    return (
      <div className="container py-4" style={{ maxWidth: "800px" }}>
        <div className="card shadow-sm border-0 p-4 rounded-4">
          <div className="alert alert-danger mb-3">
            {errorMsg || "Paciente no encontrado."}
          </div>
          <div>
            <CustomButton
              type="button"
              variant="secondary"
              onClick={() => navigate("/pacientes")}
            >
              ← Volver al listado
            </CustomButton>
          </div>
        </div>
      </div>
    );
  }

  const obraSocialNombre =
    typeof paciente.obraSocial === "object"
      ? paciente.obraSocial?.razonSocial || "-"
      : paciente.obraSocial || "Sin obra social";

  return (
    <div className="container py-4" style={{ maxWidth: "800px" }}>
      <div className="card shadow-sm border-0 p-4 rounded-4">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 border-bottom pb-3 mb-4">
          <div>
            <h3 className="fw-bold text-success mb-1">
              {`${paciente.nombre || ""} ${paciente.apellido || ""}`.trim() ||
                "Paciente"}
            </h3>
            <p className="text-muted small mb-0">DNI: {paciente.dni || "-"}</p>
          </div>

          <div className="d-flex flex-wrap gap-2">
            <CustomButton
              type="button"
              variant="secondary"
              onClick={() => navigate("/pacientes")}
            >
              ← Volver
            </CustomButton>
            <CustomButton
              type="button"
              variant="outline-primary"
              onClick={() => navigate(`/pacientes/editar/${paciente._id}`)}
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
                {`${paciente.nombre || ""} ${paciente.apellido || ""}`.trim() ||
                  "-"}
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="border rounded-3 p-3 bg-light h-100">
              <div className="small text-muted">DNI</div>
              <div className="fw-semibold">{paciente.dni || "-"}</div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="border rounded-3 p-3 bg-light h-100">
              <div className="small text-muted">Fecha de Nacimiento</div>
              <div className="fw-semibold">
                {formatearFecha(paciente.fechaNacimiento)}
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="border rounded-3 p-3 bg-light h-100">
              <div className="small text-muted">Sexo</div>
              <div className="fw-semibold">{formatearSexo(paciente.sexo)}</div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="border rounded-3 p-3 bg-light h-100">
              <div className="small text-muted">Correo Electrónico</div>
              <div className="fw-semibold">{paciente.email || "-"}</div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="border rounded-3 p-3 bg-light h-100">
              <div className="small text-muted">Ocupación</div>
              <div className="fw-semibold">{paciente.ocupacion || "-"}</div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="border rounded-3 p-3 bg-light h-100">
              <div className="small text-muted">Teléfono</div>
              <div className="fw-semibold">
                {formatearTelefono(paciente.telefono)}
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="border rounded-3 p-3 bg-light h-100">
              <div className="small text-muted">Obra Social</div>
              <div className="fw-semibold">{obraSocialNombre}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
