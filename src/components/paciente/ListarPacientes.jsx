import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { BsEye, BsPencilSquare, BsTrash } from "react-icons/bs";
import { CustomInput } from "../ui/CustomInput.jsx";
import { CustomButton } from "../ui/CustomButton.jsx";
import { LIMITE_POR_PAGINA, Paginacion } from "../ui/Paginacion.jsx";
import clientesAxios from "../../config/axios.js";

export const ListarPacientes = () => {
  const [pacientes, setPacientes] = useState([]);
  const [pagina, setPagina] = useState(1);
  const [paginacion, setPaginacion] = useState({});
  const [busqueda, setBusqueda] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let activo = true;

    const fetchPacientes = async () => {
      try {
        const { data } = await clientesAxios.get("/pacientes", {
          params: { page: pagina, limit: LIMITE_POR_PAGINA },
        });
        if (!activo) return;
        setPacientes(Array.isArray(data?.data) ? data.data : []);
        setPaginacion(data?.pagination || {});
      } catch (err) {
        if (!activo) return;
        console.error("Error al cargar pacientes:", err);
        setErrorMsg(
          err.response?.data?.mensaje || "No se pudieron cargar los pacientes.",
        );
      } finally {
        if (activo) setLoading(false);
      }
    };

    fetchPacientes();
    return () => {
      activo = false;
    };
  }, [pagina]);

  const handleEliminar = async (id) => {
    const confirmar = window.confirm(
      "¿Deseás eliminar este paciente? Esta acción borrará el registro.",
    );
    if (!confirmar) return;

    setErrorMsg("");
    try {
      await clientesAxios.delete(`/pacientes/${id}`);
      setPacientes((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      console.error("Error al eliminar paciente:", err);
      setErrorMsg(
        err.response?.data?.mensaje || "No se pudo eliminar el paciente.",
      );
    }
  };

  const formatearSexo = (sexo) => {
    if (sexo === "F") return "Femenino";
    if (sexo === "M") return "Masculino";
    return "-";
  };

  const formatearTelefono = (telefono) => {
    if (!telefono) return "-";
    if (typeof telefono === "string") return telefono || "-";
    return (
      [telefono.codigoArea, telefono.numero].filter(Boolean).join(" ") || "-"
    );
  };

  const pacientesFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();
    if (!termino) return pacientes;

    return pacientes.filter((p) => {
      const nombreCompleto = `${p.nombre || ""} ${p.apellido || ""}`.trim();
      const dni = p.dni || "";
      const email = p.email || "";
      return `${nombreCompleto} ${dni} ${email}`
        .toLowerCase()
        .includes(termino);
    });
  }, [pacientes, busqueda]);

  return (
    <div className="container py-4">
      <div className="card shadow-sm border-0 p-4 rounded-4">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
          <h3 className="fw-bold text-success mb-0">Listado de Pacientes</h3>
          <CustomButton
            type="button"
            onClick={() => navigate("/pacientes/nuevo")}
          >
            + Nuevo Paciente
          </CustomButton>
        </div>

        <div className="row mb-3">
          <div className="col-md-6">
            <CustomInput
              name="busquedaPaciente"
              value={busqueda}
              onChange={(e) => {
                setBusqueda(e.target.value);
                setPagina(1);
              }}
              placeholder="Buscar por nombre, apellido, DNI o correo..."
            />
          </div>
        </div>

        {errorMsg && (
          <div className="alert alert-danger py-2 small">{errorMsg}</div>
        )}

        {loading ? (
          <p className="text-muted mb-0">Cargando pacientes...</p>
        ) : pacientesFiltrados.length === 0 ? (
          <p className="text-muted mb-0">
            No hay pacientes registrados para mostrar.
          </p>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th>Nombre y Apellido</th>
                  <th>DNI</th>
                  <th>Correo</th>
                  <th>Sexo</th>
                  <th>Teléfono</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pacientesFiltrados.map((row) => (
                  <tr key={row._id}>
                    <td className="fw-medium">
                      {`${row.nombre || ""} ${row.apellido || ""}`.trim() ||
                        "-"}
                    </td>
                    <td>{row.dni || "-"}</td>
                    <td>{row.email || "-"}</td>
                    <td>{formatearSexo(row.sexo)}</td>
                    <td>{formatearTelefono(row.telefono)}</td>
                    <td>
                      <div className="d-flex flex-wrap gap-2">
                        <CustomButton
                          type="button"
                          variant="outline-success"
                          title="Ver paciente"
                          aria-label="Ver paciente"
                          onClick={() => navigate(`/pacientes/${row._id}`)}
                        >
                          <BsEye size={16} />
                        </CustomButton>
                        <CustomButton
                          type="button"
                          variant="outline-primary"
                          title="Editar paciente"
                          aria-label="Editar paciente"
                          onClick={() =>
                            navigate(`/pacientes/editar/${row._id}`)
                          }
                        >
                          <BsPencilSquare size={16} />
                        </CustomButton>
                        <CustomButton
                          type="button"
                          variant="outline-danger"
                          title="Eliminar paciente"
                          aria-label="Eliminar paciente"
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
        <Paginacion
          pagina={pagina}
          paginacion={paginacion}
          onCambiarPagina={(nuevaPagina) => {
            setLoading(true);
            setPagina(nuevaPagina);
          }}
          cargando={loading}
        />
      </div>
    </div>
  );
};
