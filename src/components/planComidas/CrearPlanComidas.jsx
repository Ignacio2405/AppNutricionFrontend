import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { crearPlanComidas } from "../../services/planComidas.service.js";
import { FormularioPlanComidas } from "./FormularioPlanComidas";

export const CrearPlanComidas = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async (payload) => {
    setSubmitting(true);
    setError("");
    try {
      await crearPlanComidas(payload);
      navigate("/planes-comidas");
    } catch (err) {
      const datosError = err.response?.data;
      const detalles = Array.isArray(datosError?.errores)
        ? datosError.errores.join(" ")
        : datosError?.error;
      setError(
        [datosError?.mensaje, detalles].filter(Boolean).join(" ") ||
          err.message ||
          "Error al crear el plan de comidas.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Nuevo Plan de Comidas</h2>
        <Link to="/planes-comidas" className="btn btn-outline-secondary">
          Volver al listado
        </Link>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <FormularioPlanComidas
        onSubmit={handleCreate}
        submitting={submitting}
        submitLabel="Crear Plan de Comidas"
      />
    </div>
  );
};
