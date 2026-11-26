import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { crearPlanComidas } from "../../services/planComidas.service.js";
import { FormularioPlanComidas } from "./FormularioPlanComidas";
import { CustomButton } from "../ui/CustomButton.jsx";

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
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold text-success mb-0">Nuevo Plan de Comidas</h3>
        <CustomButton
          type="button"
          variant="secondary"
          onClick={() => navigate("/planes-comidas")}
        >
          Volver al listado
        </CustomButton>
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
