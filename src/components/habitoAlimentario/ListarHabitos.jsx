import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { BsEye, BsPencilSquare, BsTrash } from "react-icons/bs";
import { CustomInput } from "../ui/CustomInput.jsx";
import { CustomButton } from "../ui/CustomButton";
import clientesAxios from "../../config/axios.js";

export const ListarHabitos = () => {
  const [habitos, setHabitos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let activo = true;

    const cargarHabitos = async () => {
      try {
        const { data } = await clientesAxios.get("/habitos");
        if (!activo) return;

        const lista = Array.isArray(data)
          ? data
          : data.data || data.habitos || [];
        setHabitos(lista);
      } catch (err) {
        if (!activo) return;
        console.error("Error al cargar hábitos alimentarios:", err);
        setErrorMsg("No se pudieron cargar los hábitos alimentarios.");
      } finally {
        if (activo) setLoading(false);
      }
    };

    cargarHabitos();

    return () => {
      activo = false;
    };
  }, []);

  const handleEliminar = async (id) => {
    const confirmar = window.confirm(
      "¿Deseás desactivar este registro de hábitos alimentarios?",
    );
    if (!confirmar) return;

    try {
      await clientesAxios.delete(`/habitos/${id}`);
      setHabitos((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      console.error("Error al desactivar hábitos alimentarios:", err);
      setErrorMsg(
        err.response?.data?.mensaje ||
          "Error al desactivar los hábitos alimentarios.",
      );
    }
  };

  const formatearPaciente = (paciente) => {
    if (!paciente) return "Sin paciente";
    if (typeof paciente === "object") {
      const partes = [paciente.apellido, paciente.nombre].filter(Boolean);
      return partes.length ? partes.join(", ") : "Sin nombre";
    }
    return paciente;
  };

  const badgeEstres = (nivel) => {
    const estilos = {
      bajo: "bg-success-subtle text-success",
      medio: "bg-warning-subtle text-warning-emphasis",
      alto: "bg-danger-subtle text-danger",
    };
    return (
      <span
        className={`badge rounded-pill text-capitalize px-2 py-1 ${
          estilos[nivel] || "bg-secondary-subtle text-secondary"
        }`}
      >
        {nivel || "No indicado"}
      </span>
    );
  };

  const habitosFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();
    if (!termino) return habitos;

    return habitos.filter((h) => {
      const pac =
        typeof h.pacienteId === "object"
          ? `${h.pacienteId?.apellido || ""} ${h.pacienteId?.nombre || ""} ${h.pacienteId?.dni || ""}`
          : String(h.pacienteId || "");
      const actividad = h.nivelActividadFisica || "";
      const estres = h.nivelEstres || "";

      return `${pac} ${actividad} ${estres}`.toLowerCase().includes(termino);
    });
  }, [habitos, busqueda]);

  return (
    <div className="container py-4">
      <div className="card shadow-sm border-0 p-4 rounded-4">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
          <h3 className="fw-bold text-success mb-0">Hábitos Alimentarios</h3>
          <CustomButton
            type="button"
            onClick={() => navigate("/habitos-alimentarios/nuevo")}
          >
            + Nuevos Hábitos
          </CustomButton>
        </div>

        <div className="row mb-3">
          <div className="col-md-6">
            <CustomInput
              name="busquedaHabitos"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por paciente, actividad física o estrés..."
            />
          </div>
        </div>

        {errorMsg && (
          <div className="alert alert-danger py-2 small">{errorMsg}</div>
        )}

        {loading ? (
          <p className="text-muted mb-0">Cargando hábitos alimentarios...</p>
        ) : habitosFiltrados.length === 0 ? (
          <p className="text-muted mb-0">
            No hay registros de hábitos alimentarios.
          </p>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th>Paciente</th>
                  <th>Comidas / Día</th>
                  <th>Agua (L)</th>
                  <th>Actividad Física</th>
                  <th>Sueño (hs)</th>
                  <th>Estrés</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {habitosFiltrados.map((row) => (
                  <tr key={row._id}>
                    <td>{formatearPaciente(row.pacienteId)}</td>
                    <td>{row.cantidadComidasDiarias}</td>
                    <td>{row.consumoAguaDiarioLitros} L</td>
                    <td className="text-capitalize">
                      {row.nivelActividadFisica || "-"}
                    </td>
                    <td>{row.horasSuenoNocturno ?? "-"} hs</td>
                    <td>{badgeEstres(row.nivelEstres)}</td>
                    <td>
                      <div className="d-flex flex-wrap gap-2">
                        <CustomButton
                          type="button"
                          variant="outline-success"
                          title="Ver hábitos"
                          aria-label="Ver hábitos"
                          onClick={() =>
                            navigate(`/habitos-alimentarios/${row._id}`)
                          }
                        >
                          <BsEye size={16} />
                        </CustomButton>
                        <CustomButton
                          type="button"
                          variant="outline-primary"
                          title="Editar hábitos"
                          aria-label="Editar hábitos"
                          onClick={() =>
                            navigate(`/habitos-alimentarios/editar/${row._id}`)
                          }
                        >
                          <BsPencilSquare size={16} />
                        </CustomButton>
                        <CustomButton
                          type="button"
                          variant="outline-danger"
                          title="Eliminar hábitos"
                          aria-label="Eliminar hábitos"
                          onClick={() => handleEliminar(row._id)}
                        >
                          <BsTrash size={16} />
                        </CustomButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
