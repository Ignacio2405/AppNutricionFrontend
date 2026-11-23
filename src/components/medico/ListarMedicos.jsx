import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { BsEye, BsPencilSquare, BsTrash } from "react-icons/bs";
import { CustomInput } from "../ui/CustomInput.jsx";
import { CustomButton } from "../ui/CustomButton.jsx";
import clientesAxios from "../../config/axios.js";

export const ListarMedicos = () => {
  const [medicos, setMedicos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let activo = true;

    const fetchMedicos = async () => {
      try {
        const { data } = await clientesAxios.get("/medicos");
        if (!activo) return;
        setMedicos(Array.isArray(data?.data) ? data.data : []);
      } catch (err) {
        if (!activo) return;
        console.error("Error al cargar médicos:", err);
        setErrorMsg(
          err.response?.data?.mensaje || "No se pudieron cargar los médicos.",
        );
      } finally {
        if (activo) setLoading(false);
      }
    };

    fetchMedicos();
    return () => {
      activo = false;
    };
  }, []);

  const handleEliminar = async (id) => {
    const confirmar = window.confirm("¿Deseás dar de baja este médico?");
    if (!confirmar) return;

    setErrorMsg("");
    try {
      await clientesAxios.delete(`/medicos/${id}`);
      setMedicos((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      console.error("Error al dar de baja médico:", err);
      setErrorMsg(
        err.response?.data?.mensaje || "No se pudo dar de baja el médico.",
      );
    }
  };

  const formatearTelefono = (telefono) => {
    if (!telefono) return "—";
    if (typeof telefono === "string") return telefono || "—";
    return (
      [telefono.codigoArea, telefono.numero].filter(Boolean).join("-") || "—"
    );
  };

  const medicosFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();
    if (!termino) return medicos;

    return medicos.filter((m) => {
      const nombreCompleto = `${m.nombre || ""} ${m.apellido || ""}`.trim();
      const dni = m.dni || "";
      const email = m.email || "";
      return `${nombreCompleto} ${dni} ${email}`
        .toLowerCase()
        .includes(termino);
    });
  }, [medicos, busqueda]);

  return (
    <div className="container py-4">
      <div className="card shadow-sm border-0 p-4 rounded-4">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
          <h3 className="fw-bold text-success mb-0">Listado de Médicos</h3>
          <CustomButton
            type="button"
            onClick={() => navigate("/medicos/nuevo")}
          >
            + Nuevo Médico
          </CustomButton>
        </div>

        <div className="row mb-3">
          <div className="col-md-6">
            <CustomInput
              name="busquedaMedico"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre, apellido, DNI o correo..."
            />
          </div>
        </div>

        {errorMsg && (
          <div className="alert alert-danger py-2 small">{errorMsg}</div>
        )}

        {loading ? (
          <p className="text-muted mb-0">Cargando médicos...</p>
        ) : medicosFiltrados.length === 0 ? (
          <p className="text-muted mb-0">
            No hay médicos registrados para mostrar.
          </p>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th>Nombre y Apellido</th>
                  <th>DNI</th>
                  <th>Correo</th>
                  <th>Teléfono</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {medicosFiltrados.map((row) => (
                  <tr key={row._id}>
                    <td className="fw-medium">
                      {`${row.nombre || ""} ${row.apellido || ""}`.trim() ||
                        "—"}
                    </td>
                    <td>{row.dni || "—"}</td>
                    <td>{row.email || "—"}</td>
                    <td>{formatearTelefono(row.telefono)}</td>
                    <td>
                      <div className="d-flex flex-wrap gap-2">
                        <CustomButton
                          type="button"
                          variant="outline-success"
                          title="Ver médico"
                          aria-label="Ver médico"
                          onClick={() => navigate(`/medicos/${row._id}`)}
                        >
                          <BsEye size={16} />
                        </CustomButton>
                        <CustomButton
                          type="button"
                          variant="outline-primary"
                          title="Editar médico"
                          aria-label="Editar médico"
                          onClick={() => navigate(`/medicos/editar/${row._id}`)}
                        >
                          <BsPencilSquare size={16} />
                        </CustomButton>
                        <CustomButton
                          type="button"
                          variant="outline-danger"
                          title="Eliminar médico"
                          aria-label="Eliminar médico"
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
