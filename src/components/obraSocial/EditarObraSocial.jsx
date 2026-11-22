import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import clientesAxios from "../../config/axios.js";
import { FormularioObraSocial } from "./FormularioObraSocial.jsx";

export const EditarObraSocial = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [obraSocial, setObraSocial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    let activo = true;

    const cargarObraSocial = async () => {
      try {
        const { data } = await clientesAxios.get(`/obraSocial/${id}`);
        if (!activo) return;
        setObraSocial(data?.data || null);
      } catch (err) {
        if (!activo) return;
        console.error("Error al obtener obra social:", err);
        setErrorMsg(
          err.response?.data?.mensaje ||
            "No se pudo cargar la obra social para editar.",
        );
      } finally {
        if (activo) setLoading(false);
      }
    };

    cargarObraSocial();
    return () => {
      activo = false;
    };
  }, [id]);

  const handleActualizar = async (payload) => {
    setSubmitting(true);
    setErrorMsg("");
    try {
      await clientesAxios.put(`/obraSocial/${id}`, payload);
      navigate("/obras-sociales");
    } catch (err) {
      console.error("Error al actualizar obra social:", err);
      setErrorMsg(
        err.response?.data?.mensaje || "Error al actualizar la obra social.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-4">
        <p className="text-muted">Cargando obra social...</p>
      </div>
    );
  }

  if (errorMsg && !obraSocial) {
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
      <FormularioObraSocial
        key={obraSocial?._id || id}
        titulo="Editar Obra Social"
        initialData={obraSocial}
        onSubmit={handleActualizar}
        onCancel={() => navigate("/obras-sociales")}
        submitting={submitting}
        submitLabel="Actualizar Obra Social"
      />
    </>
  );
};
