import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { BsEye, BsPencilSquare, BsTrash } from "react-icons/bs";
import { CustomInput } from "../ui/CustomInput.jsx";
import { CustomButton } from "../ui/CustomButton";
import clientesAxios from "../../config/axios.js";

export const ListarHistorial = () => {
  const [historiales, setHistoriales] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let activo = true;

    const cargarHistoriales = async () => {
      try {
        const { data } = await clientesAxios.get("/historial-medico");
        console.log("Respuesta /historial-medico:", data);
        if (!activo) return;

        const lista = Array.isArray(data)
          ? data
          : data.data || data.historiales || [];
        setHistoriales(lista);
      } catch (err) {
        if (!activo) return;
        console.error("Error al cargar historiales médicos:", err);
        setErrorMsg("No se pudieron cargar los historiales médicos.");
      } finally {
        if (activo) setLoading(false);
      }
    };

    cargarHistoriales();

    return () => {
      activo = false;
    };
  }, []);

  const handleEliminar = async (id) => {
    const confirmar = window.confirm(
      "¿Deseás desactivar este historial médico?",
    );
    if (!confirmar) return;

    try {
      await clientesAxios.delete(`/historial-medico/${id}`);
      setHistoriales((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      console.error("Error al desactivar historial:", err);
      setErrorMsg(
        err.response?.data?.mensaje ||
          "Error al desactivar el historial médico.",
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

  const historialesFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();
    if (!termino) return historiales;

    return historiales.filter((h) => {
      const pac =
        typeof h.pacienteId === "object"
          ? `${h.pacienteId?.apellido || ""} ${h.pacienteId?.nombre || ""} ${h.pacienteId?.dni || ""}`
          : String(h.pacienteId || "");
      const patologias = (h.patologiasActuales || []).join(" ");
      const alergias = (h.alergiasIntolerancias || []).join(" ");

      return `${pac} ${patologias} ${alergias}`.toLowerCase().includes(termino);
    });
  }, [historiales, busqueda]);

  return (
    <div className="container py-4">
      <div className="card shadow-sm border-0 p-4 rounded-4">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
          <h3 className="fw-bold text-success mb-0">Historiales Médicos</h3>
          <CustomButton
            type="button"
            onClick={() => navigate("/historial-medico/nuevo")}
          >
            + Nuevo Historial
          </CustomButton>
        </div>

        <div className="row mb-2">
          <div className="col-md-6">
            <CustomInput
              name="busquedaHistorial"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por paciente, DNI, patología o alergia..."
            />
          </div>
        </div>

        {errorMsg && (
          <div className="alert alert-danger py-2 small">{errorMsg}</div>
        )}

        {loading ? (
          <p className="text-muted mb-0">Cargando historiales médicos...</p>
        ) : historialesFiltrados.length === 0 ? (
          <p className="text-muted mb-0">
            No hay historiales médicos registrados.
          </p>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th>Paciente</th>
                  <th>Patologías </th>
                  <th>Alergias / Intolerancias</th>
                  <th>Medicamentos</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {historialesFiltrados.map((row) => (
                  <tr key={row._id}>
                    <td>{formatearPaciente(row.pacienteId)}</td>
                    <td>
                      {row.patologiasActuales?.length
                        ? row.patologiasActuales.join(", ")
                        : "Ninguna registrada"}
                    </td>
                    <td>
                      {row.alergiasIntolerancias?.length
                        ? row.alergiasIntolerancias.join(", ")
                        : "Ninguna"}
                    </td>
                    <td>{row.medicamentosSuplementos?.length || 0}</td>
                    <td>
                      <div className="d-flex flex-wrap gap-2">
                        <CustomButton
                          type="button"
                          variant="outline-success"
                          title="Ver historial"
                          aria-label="Ver historial"
                          onClick={() =>
                            navigate(`/historial-medico/${row._id}`)
                          }
                        >
                          <BsEye size={16} />
                        </CustomButton>
                        <CustomButton
                          type="button"
                          variant="outline-primary"
                          title="Editar historial"
                          aria-label="Editar historial"
                          onClick={() =>
                            navigate(`/historial-medico/editar/${row._id}`)
                          }
                        >
                          <BsPencilSquare size={16} />
                        </CustomButton>
                        <CustomButton
                          type="button"
                          variant="outline-danger"
                          title="Eliminar historial"
                          aria-label="Eliminar historial"
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
