import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { BsEye, BsPencilSquare, BsTrash } from "react-icons/bs";
import { CustomInput } from "../ui/CustomInput.jsx";
import { CustomButton } from "../ui/CustomButton.jsx";
import clientesAxios from "../../config/axios.js";

export const ListarLaboratorio = () => {
  const [registros, setRegistros] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let activo = true;

    const cargarRegistros = async () => {
      try {
        const { data } = await clientesAxios.get("/resultados-laboratorio");
        if (!activo) return;
        const lista = Array.isArray(data)
          ? data
          : data.data || data.resultados || [];
        setRegistros(lista);
      } catch (err) {
        if (!activo) return;
        console.error("Error al cargar resultados de laboratorio:", err);
        setErrorMsg("No se pudieron cargar los resultados de laboratorio.");
      } finally {
        if (activo) setLoading(false);
      }
    };

    cargarRegistros();
    return () => {
      activo = false;
    };
  }, []);

  const handleEliminar = async (id) => {
    const confirmar = window.confirm(
      "¿Deseás desactivar este registro de resultados de laboratorio?",
    );
    if (!confirmar) return;

    try {
      await clientesAxios.delete(`/resultados-laboratorio/${id}`);
      setRegistros((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      console.error("Error al desactivar laboratorio:", err);
      setErrorMsg(
        err.response?.data?.mensaje ||
          "Error al desactivar el registro de laboratorio.",
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

  const formatearFecha = (fecha) => {
    if (!fecha) return "-";
    const d = new Date(fecha);
    return Number.isNaN(d.getTime()) ? "-" : d.toLocaleDateString("es-AR");
  };

  const formatearValor = (valor, unidad = "") => {
    if (valor === null || valor === undefined || valor === "") return "-";
    return unidad ? `${valor} ${unidad}` : `${valor}`;
  };

  const registrosFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();
    if (!termino) return registros;

    return registros.filter((r) => {
      const pac =
        typeof r.pacienteId === "object"
          ? `${r.pacienteId?.apellido || ""} ${r.pacienteId?.nombre || ""} ${r.pacienteId?.dni || ""}`
          : String(r.pacienteId || "");
      const obs = r.observacionesLaboratorio || "";
      const notas = r.notasNutricionista || "";

      return `${pac} ${obs} ${notas}`.toLowerCase().includes(termino);
    });
  }, [registros, busqueda]);

  return (
    <div className="container py-4">
      <div className="card shadow-sm border-0 p-4 rounded-4">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
          <h3 className="fw-bold text-success mb-0">
            Resultados de Laboratorio
          </h3>
          <CustomButton
            type="button"
            onClick={() => navigate("/resultados-laboratorio/nuevo")}
          >
            + Nuevo Laboratorio
          </CustomButton>
        </div>

        <div className="row mb-3">
          <div className="col-md-6">
            <CustomInput
              name="busquedaLaboratorio"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por paciente, DNI, observaciones o notas..."
            />
          </div>
        </div>

        {errorMsg && (
          <div className="alert alert-danger py-2 small">{errorMsg}</div>
        )}

        {loading ? (
          <p className="text-muted mb-0">
            Cargando resultados de laboratorio...
          </p>
        ) : registrosFiltrados.length === 0 ? (
          <p className="text-muted mb-0">
            No hay registros de resultados de laboratorio.
          </p>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th>Paciente</th>
                  <th>Fecha</th>
                  <th>Glucemia</th>
                  <th>Col. Total</th>
                  <th>Triglicéridos</th>
                  <th>HbA1c</th>
                  <th>TSH</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {registrosFiltrados.map((row) => (
                  <tr key={row._id}>
                    <td>{formatearPaciente(row.pacienteId)}</td>
                    <td>{formatearFecha(row.fechaEstudio)}</td>
                    <td>{formatearValor(row.glucemia, "mg/dL")}</td>
                    <td>{formatearValor(row.colesterolTotal, "mg/dL")}</td>
                    <td>{formatearValor(row.trigliceridos, "mg/dL")}</td>
                    <td>{formatearValor(row.hemoglobinaGlicosilada, "%")}</td>
                    <td>{formatearValor(row.tsh, "mUI/L")}</td>
                    <td>
                      <div className="d-flex flex-wrap gap-2">
                        <CustomButton
                          type="button"
                          variant="outline-success"
                          title="Ver laboratorio"
                          aria-label="Ver laboratorio"
                          onClick={() =>
                            navigate(`/resultados-laboratorio/${row._id}`)
                          }
                        >
                          <BsEye size={16} />
                        </CustomButton>
                        <CustomButton
                          type="button"
                          variant="outline-primary"
                          title="Editar laboratorio"
                          aria-label="Editar laboratorio"
                          onClick={() =>
                            navigate(
                              `/resultados-laboratorio/editar/${row._id}`,
                            )
                          }
                        >
                          <BsPencilSquare size={16} />
                        </CustomButton>
                        <CustomButton
                          type="button"
                          variant="outline-danger"
                          title="Eliminar laboratorio"
                          aria-label="Eliminar laboratorio"
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
