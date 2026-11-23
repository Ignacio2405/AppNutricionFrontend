import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  obtenerMetaObjetivoPorId,
  actualizarMetaObjetivo,
} from "../../services/metaObjetivo.service.js";
import { FormularioMetaObjetivo } from "./FormularioMetaObjetivo.jsx";

export const EditarMetaObjetivo = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    let activo = true;

    const cargar = async () => {
      try {
        const data = await obtenerMetaObjetivoPorId(id);
        if (!activo) return;
        setMeta(data || null);
      } catch (err) {
        if (!activo) return;
        console.error("Error al cargar meta para editar:", err);
        setErrorMsg(
          err.response?.data?.mensaje ||
            "No se pudo cargar el registro para editar.",
        );
      } finally {
        if (activo) setLoading(false);
      }
    };

    cargar();
    return () => {
      activo = false;
    };
  }, [id]);

  const handleActualizar = async (payload) => {
    setSubmitting(true);
    setErrorMsg("");
    try {
      await actualizarMetaObjetivo(id, payload);
      navigate("/metas-objetivos");
    } catch (err) {
      console.error("Error al actualizar metas y objetivos:", err);
      setErrorMsg(
        err.response?.data?.mensaje ||
          "No se pudieron actualizar las metas y objetivos.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-4">
        <p className="text-muted">Cargando metas y objetivos...</p>
      </div>
    );
  }

  if (errorMsg && !meta) {
    return (
      <div className="container py-4">
        <div className="alert alert-danger">{errorMsg}</div>
      </div>
    );
  }

  return (
    <>
      {errorMsg && (
        <div className="container pt-3">
          <div className="alert alert-danger py-2 small mb-0">{errorMsg}</div>
        </div>
      )}
      <FormularioMetaObjetivo
        key={meta?._id || id}
        tituloFormulario="Editar Metas y Objetivos"
        initialData={meta}
        onSubmit={handleActualizar}
        onCancel={() => navigate("/metas-objetivos")}
        submitting={submitting}
        submitLabel="Actualizar Metas"
      />
    </>
  );
};
