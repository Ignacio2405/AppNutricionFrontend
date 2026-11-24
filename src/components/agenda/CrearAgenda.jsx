import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { crearAgenda } from "../../services/agenda.service.js";
import { FormularioAgenda } from "./FormularioAgenda.jsx";

export const CrearAgenda = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async (payload) => {
    setSubmitting(true);
    setError("");
    try {
      const bloques = Array.isArray(payload) ? payload : [payload];

      for (const bloque of bloques) {
        await crearAgenda(bloque);
      }

      navigate("/agenda");
    } catch (err) {
      const datosError = err.response?.data;
      const detalle = Array.isArray(datosError?.error)
        ? datosError.error.join(" ")
        : datosError?.error;
      setError(
        [datosError?.mensaje, detalle].filter(Boolean).join(" — ") ||
          "No se pudo crear el horario de agenda.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Nueva Agenda</h2>
        <Link to="/agenda" className="btn btn-outline-secondary">
          Volver al listado
        </Link>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <FormularioAgenda
        onSubmit={handleCreate}
        onCancel={() => navigate("/agenda")}
        submitting={submitting}
        submitLabel="Guardar Horario"
      />
    </div>
  );
};
