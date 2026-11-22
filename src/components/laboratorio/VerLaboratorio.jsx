import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CustomButton } from "../ui/CustomButton.jsx";
import clientesAxios from "../../config/axios.js";

export const VerLaboratorio = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [registro, setRegistro] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    let activo = true;

    const cargarDetalle = async () => {
      try {
        const { data } = await clientesAxios.get(
          `/resultados-laboratorio/${id}`,
        );
        if (!activo) return;
        setRegistro(data.data || data);
      } catch (err) {
        if (!activo) return;
        console.error("Error al obtener detalle de laboratorio:", err);
        setErrorMsg(
          err.response?.data?.mensaje ||
            "No se pudo cargar el detalle de resultados de laboratorio.",
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
    const p = registro?.pacienteId;
    if (!p) return "Sin paciente";
    if (typeof p === "object") {
      const base = [p.apellido, p.nombre].filter(Boolean).join(", ");
      return p.dni ? `${base} (DNI: ${p.dni})` : base;
    }
    return p;
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return "-";
    const d = new Date(fecha);
    return Number.isNaN(d.getTime()) ? "-" : d.toLocaleDateString("es-AR");
  };

  const mostrarValor = (val, unidad = "") => {
    if (val === null || val === undefined || val === "") return "-";
    return unidad ? `${val} ${unidad}` : `${val}`;
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

  if (errorMsg || !registro) {
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
              onClick={() => navigate("/resultados-laboratorio")}
            >
              Volver al listado
            </CustomButton>
          </div>
        </div>
      </div>
    );
  }

  const indicadores = [
    {
      label: "Glucemia",
      valor: mostrarValor(registro.glucemia, "mg/dL"),
    },
    {
      label: "Colesterol total",
      valor: mostrarValor(registro.colesterolTotal, "mg/dL"),
    },
    {
      label: "Colesterol HDL",
      valor: mostrarValor(registro.colesterolHdl, "mg/dL"),
    },
    {
      label: "Colesterol LDL",
      valor: mostrarValor(registro.colesterolLdl, "mg/dL"),
    },
    {
      label: "Triglicéridos",
      valor: mostrarValor(registro.trigliceridos, "mg/dL"),
    },
    {
      label: "Hemoglobina glicosilada",
      valor: mostrarValor(registro.hemoglobinaGlicosilada, "%"),
    },
    {
      label: "TSH (Tiroides)",
      valor: mostrarValor(registro.tsh, "mUI/L"),
    },
  ];

  return (
    <div className="container py-4">
      <div className="card shadow-sm border-0 p-4 rounded-4">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
          <div>
            <h3 className="fw-bold text-success mb-1">
              Resultados de Laboratorio
            </h3>
            <p className="text-muted mb-0">
              Paciente: <strong>{nombrePaciente()}</strong> · Fecha:{" "}
              <strong>{formatearFecha(registro.fechaEstudio)}</strong>
            </p>
          </div>

          <div className="d-flex gap-2">
            <CustomButton
              type="button"
              variant="secondary"
              onClick={() => navigate("/resultados-laboratorio")}
            >
              Volver
            </CustomButton>
            <CustomButton
              type="button"
              onClick={() => navigate(`/resultados-laboratorio/editar/${id}`)}
            >
              Editar
            </CustomButton>
          </div>
        </div>

        {/* Marcadores clínicos */}
        <div className="row g-3 mb-4">
          {indicadores.map((item) => (
            <div key={item.label} className="col-sm-6 col-md-4 col-lg-3">
              <div className="p-3 rounded-3 bg-light border h-100">
                <small className="text-muted d-block">{item.label}</small>
                <strong className="fs-5 text-dark">{item.valor}</strong>
              </div>
            </div>
          ))}
        </div>

        {/* Observaciones generales del laboratorio */}
        <div className="p-3 rounded-3 border mb-4">
          <h6 className="fw-bold text-secondary mb-2">
            Observaciones generales del laboratorio
          </h6>
          <p className="mb-0 text-dark">
            {registro.observacionesLaboratorio ||
              "Sin observaciones de laboratorio registradas."}
          </p>
        </div>

        {/* Recordatorio 24h y notas clínicas */}
        <div className="row g-3">
          <div className="col-md-6">
            <div className="p-3 rounded-3 border h-100">
              <h6 className="fw-bold text-success mb-2">
                Recordatorio de 24 horas (Dietary Recall 24h)
              </h6>
              <p className="mb-0 text-dark" style={{ whiteSpace: "pre-line" }}>
                {registro.dietaryRecall24h ||
                  "Sin recordatorio de 24 horas registrado."}
              </p>
            </div>
          </div>

          <div className="col-md-6">
            <div className="p-3 rounded-3 border h-100">
              <h6 className="fw-bold text-secondary mb-2">
                Notas clínicas y observaciones del nutricionista
              </h6>
              <p className="mb-0 text-dark" style={{ whiteSpace: "pre-line" }}>
                {registro.notasNutricionista ||
                  "Sin notas clínicas registradas."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
