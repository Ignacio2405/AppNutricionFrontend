import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { crearTurno } from "../../services/turno.service.js";
import { FormularioTurno } from "./FormularioTurno.jsx";

export const CrearTurno = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async (payload, opciones) => {
    setSubmitting(true);
    setError("");
    try {
      await crearTurno(payload, opciones);
      navigate("/turnos");
    } catch (err) {
      const datosError = err.response?.data;
      const detalles = Array.isArray(datosError?.error)
        ? datosError.error.join(" ")
        : datosError?.error;
      setError(
        [datosError?.mensaje, detalles].filter(Boolean).join(" — ") ||
          "Error al registrar el turno.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Nuevo Turno</h2>
        <Link to="/turnos" className="btn btn-outline-secondary">
          Volver al listado
        </Link>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <FormularioTurno
        onSubmit={handleCreate}
        onCancel={() => navigate("/turnos")}
        submitting={submitting}
        submitLabel="Crear Turno"
      />
    </div>
  );
};
