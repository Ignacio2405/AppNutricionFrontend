import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { crearMetaObjetivo } from "../../services/metaObjetivo.service.js";
import { FormularioMetaObjetivo } from "./FormularioMetaObjetivo.jsx";

export const CrearMetaObjetivo = () => {
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const handleCrear = async (payload) => {
    setSubmitting(true);
    setErrorMsg("");
    try {
      await crearMetaObjetivo(payload);
      navigate("/metas-objetivos");
    } catch (err) {
      console.error("Error al crear metas y objetivos:", err);
      const datosError = err.response?.data;
      const detalle = Array.isArray(datosError?.errores)
        ? datosError.errores.join(" ")
        : datosError?.error;

      setErrorMsg(
        [datosError?.mensaje, detalle].filter(Boolean).join(" — ") ||
          "No se pudieron guardar las metas y objetivos.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {errorMsg && (
        <div className="container pt-3">
          <div className="alert alert-danger py-2 small mb-0">{errorMsg}</div>
        </div>
      )}
      <FormularioMetaObjetivo
        tituloFormulario="Registrar Metas y Objetivos"
        onSubmit={handleCrear}
        onCancel={() => navigate("/metas-objetivos")}
        submitting={submitting}
        submitLabel="Guardar Metas"
      />
    </>
  );
};
