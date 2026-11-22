import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { BsEye, BsPencilSquare, BsTrash } from "react-icons/bs";
import { CustomInput } from "../ui/CustomInput.jsx";
import { CustomButton } from "../ui/CustomButton.jsx";
import clientesAxios from "../../config/axios.js";

export const ListarConsultas = () => {
  const [consultas, setConsultas] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let cancelado = false;

    const ejecutarCarga = async () => {
      try {
        const { data } = await clientesAxios.get("/consulta");
        if (cancelado) return;
        const lista = Array.isArray(data)
          ? data
          : data.data || data.consultas || data.docs || [];
        setConsultas(lista);
      } catch (err) {
        console.error("Error al cargar consultas:", err);
        if (!cancelado) {
          setErrorMsg(
            err.response?.data?.mensaje ||
              "No se pudieron cargar las consultas.",
          );
        }
      } finally {
        if (!cancelado) {
          setLoading(false);
        }
      }
    };

    ejecutarCarga();
    return () => {
      cancelado = true;
    };
  }, []);

  const handleEliminar = async (id) => {
    const confirmar = window.confirm(
      "¿Deseás desactivar esta consulta médica?",
    );
    if (!confirmar) return;

    try {
      await clientesAxios.delete(`/consulta/${id}`);
      setConsultas((prev) => prev.filter((c) => (c._id || c.id) !== id));
    } catch (err) {
      console.error("Error al desactivar consulta:", err);
      setErrorMsg(
        err.response?.data?.mensaje || "Error al desactivar la consulta.",
      );
    }
  };

  const formatearPersona = (persona) => {
    if (!persona) return "-";
    if (typeof persona === "string") return persona;
    return `${persona.apellido || ""} ${persona.nombre || ""}`.trim() || "-";
  };

  const consultasFiltradas = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();
    if (!termino) return consultas;

    return consultas.filter((row) => {
      const pac =
        typeof row.paciente === "object"
          ? `${row.paciente?.apellido || ""} ${row.paciente?.nombre || ""} ${row.paciente?.dni || ""}`
          : String(row.paciente || "");
      const med =
        typeof row.medico === "object"
          ? `${row.medico?.apellido || ""} ${row.medico?.nombre || ""}`
          : String(row.medico || "");
      const obs = row.observaciones || "";

      return `${pac} ${med} ${obs}`.toLowerCase().includes(termino);
    });
  }, [consultas, busqueda]);

  return (
    <div className="container py-4">
      <div className="card shadow-sm border-0 p-4 rounded-4">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
          <h3 className="fw-bold text-success mb-0">Consultas Médicas</h3>
          <CustomButton
            type="button"
            onClick={() => navigate("/consulta/nueva")}
          >
            + Nueva Consulta
          </CustomButton>
        </div>

        <div className="row mb-3">
          <div className="col-md-6">
            <CustomInput
              name="busquedaConsultas"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por paciente, DNI, médico u observaciones..."
            />
          </div>
        </div>

        {errorMsg && (
          <div className="alert alert-danger py-2 small">{errorMsg}</div>
        )}

        {loading ? (
          <p className="text-muted mb-0">Cargando consultas médicas...</p>
        ) : consultasFiltradas.length === 0 ? (
          <p className="text-muted mb-0">
            No hay consultas médicas registradas.
          </p>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th>Fecha / Hora</th>
                  <th>Paciente</th>
                  <th>Médico</th>
                  <th>Peso (kg)</th>
                  <th>IMC</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {consultasFiltradas.map((row) => {
                  const id = row._id || row.id;
                  const fechaStr = row.fecha
                    ? new Date(row.fecha).toLocaleDateString("es-AR")
                    : "-";
                  return (
                    <tr key={id}>
                      <td>{`${fechaStr} ${row.hora ? `· ${row.hora}` : ""}`}</td>
                      <td>{formatearPersona(row.paciente)}</td>
                      <td>{formatearPersona(row.medico)}</td>
                      <td>{row.antropometria?.mediciones?.peso ?? "-"}</td>
                      <td>
                        {row.antropometria?.resultados?.imc ?? "Pendiente"}
                      </td>
                      <td>
                        <div className="d-flex flex-wrap gap-2">
                          <CustomButton
                            type="button"
                            variant="outline-success"
                            title="Ver consulta"
                            aria-label="Ver consulta"
                            onClick={() => navigate(`/consulta/${id}`)}
                          >
                            <BsEye size={16} />
                          </CustomButton>
                          <CustomButton
                            type="button"
                            variant="outline-primary"
                            title="Editar consulta"
                            aria-label="Editar consulta"
                            onClick={() => navigate(`/consulta/${id}/editar`)}
                          >
                            <BsPencilSquare size={16} />
                          </CustomButton>
                          <CustomButton
                            type="button"
                            variant="outline-danger"
                            title="Eliminar consulta"
                            aria-label="Eliminar consulta"
                            onClick={() => handleEliminar(id)}
                          >
                            <BsTrash size={16} />
                          </CustomButton>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
