import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  actualizarTurno,
  obtenerTurnoPorId,
} from "../../services/turno.service.js";
import { FormularioTurno } from "./FormularioTurno.jsx";

export const EditarTurno = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [turno, setTurno] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    const cargarTurno = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await obtenerTurnoPorId(id);
        if (!ignore) {
          setTurno(res?.data || res);
        }
      } catch (err) {
        if (!ignore) {
          setError(
            err.response?.data?.mensaje || "No se pudo cargar el turno.",
          );
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    cargarTurno();
    return () => {
      ignore = true;
    };
  }, [id]);

  const handleUpdate = async (payload) => {
    setSubmitting(true);
    setError("");
    try {
      await actualizarTurno(id, payload);
      navigate("/turnos");
    } catch (err) {
      const datosError = err.response?.data;
      const detalles = Array.isArray(datosError?.error)
        ? datosError.error.join(" ")
        : datosError?.error;
      setError(
        [datosError?.mensaje, detalles].filter(Boolean).join(" — ") ||
          "Error al actualizar el turno.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-success" role="status" />
        <p className="text-muted mt-2">Cargando turno...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Editar Turno</h2>
        <Link to="/turnos" className="btn btn-outline-secondary">
          Volver al listado
        </Link>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {turno && (
        <FormularioTurno
          initialData={turno}
          onSubmit={handleUpdate}
          onCancel={() => navigate("/turnos")}
          submitting={submitting}
          submitLabel="Guardar Cambios"
          esEdicion
        />
      )}
    </div>
  );
};
