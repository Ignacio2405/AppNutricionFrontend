import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { BsEye, BsPencilSquare, BsTrash } from "react-icons/bs";
import { CustomInput } from "../ui/CustomInput.jsx";
import { CustomButton } from "../ui/CustomButton";
import { LIMITE_POR_PAGINA, Paginacion } from "../ui/Paginacion.jsx";
import clientesAxios from "../../config/axios.js";

const obtenerUsuarioToken = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const partes = token.split(".");
    if (partes.length !== 3) return null;

    const base64 = partes[1].replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join(""),
    );

    const payload = JSON.parse(jsonPayload);
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
};

export const ListarHistorial = () => {
  const usuario = useMemo(() => obtenerUsuarioToken(), []);
  const rolUsuario = String(usuario?.rol || "").toUpperCase();
  const esPaciente = rolUsuario === "PACIENTE";

  const [historiales, setHistoriales] = useState([]);
  const [pagina, setPagina] = useState(1);
  const [paginacion, setPaginacion] = useState({});
  const [busqueda, setBusqueda] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let activo = true;

    const cargarHistoriales = async () => {
      try {
        const { data } = await clientesAxios.get("/historial-medico", {
          params: { page: pagina, limit: LIMITE_POR_PAGINA },
        });
        if (!activo) return;

        const lista = Array.isArray(data)
          ? data
          : data.data || data.historiales || data.docs || [];
        setHistoriales(lista);
        setPaginacion(data?.pagination || {});
      } catch (err) {
        if (!activo) return;
        console.error("Error al cargar historiales médicos:", err);
        setErrorMsg(
          err.response?.data?.mensaje ||
            "No se pudieron cargar los historiales médicos.",
        );
      } finally {
        if (activo) setLoading(false);
      }
    };

    cargarHistoriales();

    return () => {
      activo = false;
    };
  }, [pagina]);

  const handleEliminar = async (id) => {
    const confirmar = window.confirm(
      "¿Deseás desactivar este historial médico?",
    );
    if (!confirmar) return;

    setErrorMsg("");
    try {
      await clientesAxios.delete(`/historial-medico/${id}`);
      setHistoriales((prev) =>
        prev.filter((item) => (item._id || item.id) !== id),
      );
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
          {!esPaciente && (
            <CustomButton
              type="button"
              onClick={() => navigate("/historial-medico/nuevo")}
            >
              + Nuevo Historial
            </CustomButton>
          )}
        </div>

        <div className="row mb-2">
          <div className="col-md-6">
            <CustomInput
              name="busquedaHistorial"
              value={busqueda}
              onChange={(e) => {
                setBusqueda(e.target.value);
                setPagina(1);
              }}
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
                  <th>Patologías</th>
                  <th>Alergias / Intolerancias</th>
                  <th>Medicamentos</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {historialesFiltrados.map((row) => {
                  const id = row._id || row.id;

                  return (
                    <tr key={id}>
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
                              navigate(`/historial-medico/${id}`)
                            }
                          >
                            <BsEye size={16} />
                          </CustomButton>
                          {!esPaciente && (
                            <>
                            <CustomButton
                              type="button"
                              variant="outline-primary"
                              title="Editar historial"
                              aria-label="Editar historial"
                              onClick={() =>
                                navigate(`/historial-medico/editar/${id}`)
                              }
                            >
                              <BsPencilSquare size={16} />
                            </CustomButton>
                            <CustomButton
                              type="button"
                              variant="outline-danger"
                              title="Eliminar historial"
                              aria-label="Eliminar historial"
                              onClick={() => handleEliminar(id)}
                            >
                              <BsTrash size={16} />
                            </CustomButton>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
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
