import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BsEye, BsPencilSquare, BsTrash } from "react-icons/bs";
import { CustomInput } from "../ui/CustomInput.jsx";
import { CustomButton } from "../ui/CustomButton.jsx";
import {
  obtenerPlanesComidas,
  eliminarPlanComidas,
} from "../../services/planComidas.service.js";

const formatearFecha = (fecha) => {
  if (!fecha) return "-";
  const d = new Date(fecha);
  return Number.isNaN(d.getTime()) ? "-" : d.toLocaleDateString("es-AR");
};

const formatearPaciente = (paciente) => {
  if (!paciente) return "Sin paciente";
  if (typeof paciente === "object") {
    const partes = [paciente.apellido, paciente.nombre].filter(Boolean);
    return partes.length ? partes.join(", ") : paciente.dni || "Sin nombre";
  }
  return paciente;
};

export const ListarPlanesComidas = () => {
  const [planes, setPlanes] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let activo = true;

    const cargarPlanes = async () => {
      try {
        const res = await obtenerPlanesComidas();
        if (!activo) return;
        const lista = Array.isArray(res) ? res : res?.data || res?.planes || [];
        setPlanes(lista);
      } catch (err) {
        if (!activo) return;
        console.error("Error al cargar planes de comidas:", err);
        setErrorMsg(
          err.response?.data?.mensaje ||
            "No se pudieron cargar los planes de comidas.",
        );
      } finally {
        if (activo) setLoading(false);
      }
    };

    cargarPlanes();
    return () => {
      activo = false;
    };
  }, []);

  const handleEliminar = async (id) => {
    const confirmar = window.confirm(
      "¿Deseás desactivar este plan de comidas?",
    );
    if (!confirmar) return;

    try {
      await eliminarPlanComidas(id);
      setPlanes((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      console.error("Error al desactivar plan de comidas:", err);
      setErrorMsg(
        err.response?.data?.mensaje ||
          "Error al desactivar el plan de comidas.",
      );
    }
  };

  const planesFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();
    if (!termino) return planes;

    return planes.filter((plan) => {
      const pac =
        typeof plan.patientId === "object"
          ? `${plan.patientId?.apellido || ""} ${plan.patientId?.nombre || ""} ${plan.patientId?.dni || ""}`
          : String(plan.patientId || "");
      const titulo = plan.titulo || "";
      const estado = plan.planActivo ? "activo vigente" : "anterior inactivo";

      return `${pac} ${titulo} ${estado}`.toLowerCase().includes(termino);
    });
  }, [planes, busqueda]);

  return (
    <div className="container py-4">
      <div className="card shadow-sm border-0 p-4 rounded-4">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
          <h3 className="fw-bold text-success mb-0">Planes de Comidas</h3>
          <CustomButton
            type="button"
            onClick={() => navigate("/planes-comidas/nuevo")}
          >
            + Nuevo Plan
          </CustomButton>
        </div>

        <div className="row mb-3">
          <div className="col-md-6">
            <CustomInput
              name="busquedaPlanes"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por paciente, DNI, título o estado..."
            />
          </div>
        </div>

        {errorMsg && (
          <div className="alert alert-danger py-2 small">{errorMsg}</div>
        )}

        {loading ? (
          <p className="text-muted mb-0">Cargando planes de comidas...</p>
        ) : planesFiltrados.length === 0 ? (
          <p className="text-muted mb-0">
            No hay registros de planes de comidas.
          </p>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th>Paciente</th>
                  <th>Título</th>
                  <th>Vigencia</th>
                  <th>Calorías</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {planesFiltrados.map((row) => (
                  <tr key={row._id}>
                    <td>{formatearPaciente(row.patientId)}</td>
                    <td>{row.titulo || "-"}</td>
                    <td>
                      {formatearFecha(row.fechaInicioVigencia)} —{" "}
                      {formatearFecha(row.fechaFinRevision)}
                    </td>
                    <td>
                      {row.objetivosMacros?.caloriasDiarias != null
                        ? `${row.objetivosMacros.caloriasDiarias} kcal`
                        : "-"}
                    </td>
                    <td>
                      <span
                        className={`badge rounded-pill px-2 py-1 ${
                          row.planActivo
                            ? "bg-success-subtle text-success"
                            : "bg-secondary-subtle text-secondary"
                        }`}
                      >
                        {row.planActivo ? "Activo" : "Anterior"}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex flex-wrap gap-2">
                        <CustomButton
                          type="button"
                          variant="outline-success"
                          title="Ver plan / PDF"
                          aria-label="Ver plan / PDF"
                          onClick={() => navigate(`/planes-comidas/${row._id}`)}
                        >
                          <BsEye size={16} />
                        </CustomButton>
                        <CustomButton
                          type="button"
                          variant="outline-primary"
                          title="Editar plan"
                          aria-label="Editar plan"
                          onClick={() =>
                            navigate(`/planes-comidas/editar/${row._id}`)
                          }
                        >
                          <BsPencilSquare size={16} />
                        </CustomButton>
                        <CustomButton
                          type="button"
                          variant="outline-danger"
                          title="Eliminar plan"
                          aria-label="Eliminar plan"
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
