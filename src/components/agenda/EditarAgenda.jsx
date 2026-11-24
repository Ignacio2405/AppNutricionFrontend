import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  actualizarAgenda,
  obtenerAgenda,
} from "../../services/agenda.service.js";
import { FormularioAgenda } from "./FormularioAgenda.jsx";

export const EditarAgenda = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [bloque, setBloque] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    const cargarBloque = async () => {
      try {
        const res = await obtenerAgenda();
        if (ignore) return;
        const lista = Array.isArray(res?.data) ? res.data : [];
        const encontrado = lista.find(
          (item) => String(item._id) === String(id),
        );
        if (!encontrado) {
          setError("Horario de agenda no encontrado.");
        } else {
          setBloque(encontrado);
        }
      } catch (err) {
        if (!ignore) {
          setError(
            err.response?.data?.mensaje || "No se pudo cargar el horario.",
          );
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    cargarBloque();
    return () => {
      ignore = true;
    };
  }, [id]);

  const handleUpdate = async (payload) => {
    setSubmitting(true);
    setError("");
    try {
      await actualizarAgenda(id, payload);
      navigate("/agenda");
    } catch (err) {
      const datosError = err.response?.data;
      const detalle = Array.isArray(datosError?.error)
        ? datosError.error.join(" ")
        : datosError?.error;
      setError(
        [datosError?.mensaje, detalle].filter(Boolean).join(" — ") ||
          "No se pudo actualizar el horario.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-success" role="status" />
        <p className="text-muted mt-2">Cargando horario de agenda...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Editar Agenda</h2>
        <Link to="/agenda" className="btn btn-outline-secondary">
          Volver al listado
        </Link>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {bloque && (
        <FormularioAgenda
          initialData={bloque}
          onSubmit={handleUpdate}
          onCancel={() => navigate("/agenda")}
          submitting={submitting}
          submitLabel="Guardar Cambios"
          esEdicion
        />
      )}
    </div>
  );
};
