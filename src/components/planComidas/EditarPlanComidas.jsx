import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  obtenerPlanComidasPorId,
  actualizarPlanComidas,
} from "../../services/planComidas.service.js";
import { FormularioPlanComidas } from "./FormularioPlanComidas";
import { CustomButton } from "../ui/CustomButton.jsx";

export const EditarPlanComidas = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargarPlan = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await obtenerPlanComidasPorId(id);
        setPlan(res?.data || res);
      } catch (err) {
        setError(
          err.response?.data?.mensaje ||
            "No se pudo cargar el plan de comidas.",
        );
      } finally {
        setLoading(false);
      }
    };
    cargarPlan();
  }, [id]);

  const handleUpdate = async (payload) => {
    setSubmitting(true);
    setError("");
    try {
      await actualizarPlanComidas(id, payload);
      navigate("/planes-comidas");
    } catch (err) {
      const datosError = err.response?.data;
      const detalles = Array.isArray(datosError?.errores)
        ? datosError.errores.join(" ")
        : datosError?.error;
      setError(
        [datosError?.mensaje, detalles].filter(Boolean).join(" ") ||
          err.message ||
          "Error al actualizar el plan de comidas.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold text-success mb-0">Editar Plan de Comidas</h3>
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

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-success" role="status" />
        </div>
      ) : (
        plan && (
          <FormularioPlanComidas
            initialData={plan}
            onSubmit={handleUpdate}
            submitting={submitting}
            submitLabel="Guardar Cambios"
          />
        )
      )}
    </div>
  );
};
