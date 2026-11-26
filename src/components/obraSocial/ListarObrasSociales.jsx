import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { BsEye, BsPencilSquare, BsTrash } from "react-icons/bs";
import { CustomInput } from "../ui/CustomInput.jsx";
import { CustomButton } from "../ui/CustomButton.jsx";
import { LIMITE_POR_PAGINA, Paginacion } from "../ui/Paginacion.jsx";
import clientesAxios from "../../config/axios.js";

export const ListarObrasSociales = () => {
  const [obrasSociales, setObrasSociales] = useState([]);
  const [pagina, setPagina] = useState(1);
  const [paginacion, setPaginacion] = useState({});
  const [busqueda, setBusqueda] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let activo = true;

    const fetchObrasSociales = async () => {
      try {
        const { data } = await clientesAxios.get("/obraSocial", {
          params: { page: pagina, limit: LIMITE_POR_PAGINA },
        });
        if (!activo) return;

        setObrasSociales(Array.isArray(data?.data) ? data.data : []);
        setPaginacion(data?.pagination || {});
      } catch (err) {
        if (!activo) return;
        console.error("Error al cargar obras sociales:", err);
        setErrorMsg(
          err.response?.data?.mensaje ||
            "No se pudieron cargar las obras sociales.",
        );
      } finally {
        if (activo) setLoading(false);
      }
    };

    fetchObrasSociales();
    return () => {
      activo = false;
    };
  }, [pagina]);

  const handleEliminar = async (id) => {
    const confirmar = window.confirm("¿Deseás dar de baja esta obra social?");
    if (!confirmar) return;

    setErrorMsg("");
    try {
      await clientesAxios.delete(`/obraSocial/${id}`);
      setObrasSociales((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      console.error("Error al eliminar obra social:", err);
      setErrorMsg(
        err.response?.data?.mensaje || "No se pudo dar de baja la obra social.",
      );
    }
  };

  const formatearTelefono = (telefono) => {
    if (!telefono) return "—";
    if (typeof telefono === "string") return telefono.trim() || "—";

    const lista = Array.isArray(telefono) ? telefono : [telefono];
    const formateados = lista
      .map((tel) => {
        if (!tel) return "";
        if (typeof tel === "string") return tel.trim();
        const codigo = tel.codigoArea || tel.prefijo || "";
        const num = tel.numero || tel.telefono || "";
        return [codigo, num].filter(Boolean).join("-");
      })
      .filter(Boolean);

    return formateados.length > 0 ? formateados.join(", ") : "—";
  };

  const obrasFiltradas = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();
    if (!termino) return obrasSociales;

    return obrasSociales.filter((os) => {
      const razon = os.razonSocial || "";
      const cuit = os.cuit || "";
      const dir = os.direccion || "";
      return `${razon} ${cuit} ${dir}`.toLowerCase().includes(termino);
    });
  }, [obrasSociales, busqueda]);

  return (
    <div className="container py-4">
      <div className="card shadow-sm border-0 p-4 rounded-4">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
          <h3 className="fw-bold text-success mb-0">
            Listado de Obras Sociales
          </h3>
          <CustomButton
            type="button"
            onClick={() => navigate("/obras-sociales/nueva")}
          >
            + Nueva Obra Social
          </CustomButton>
        </div>

        <div className="row mb-3">
          <div className="col-md-6">
            <CustomInput
              name="busquedaObraSocial"
              value={busqueda}
              onChange={(e) => {
                setBusqueda(e.target.value);
                setPagina(1);
              }}
              placeholder="Buscar por razón social, CUIT o dirección..."
            />
          </div>
        </div>

        {errorMsg && (
          <div className="alert alert-danger py-2 small">{errorMsg}</div>
        )}

        {loading ? (
          <p className="text-muted mb-0">Cargando obras sociales...</p>
        ) : obrasFiltradas.length === 0 ? (
          <p className="text-muted mb-0">
            No hay obras sociales disponibles para mostrar.
          </p>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th>Razón Social</th>
                  <th>CUIT</th>
                  <th>Dirección</th>
                  <th>Teléfono</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {obrasFiltradas.map((row) => (
                  <tr key={row._id}>
                    <td className="fw-medium">{row.razonSocial || "—"}</td>
                    <td>{row.cuit || "—"}</td>
                    <td>{row.direccion || "—"}</td>
                    <td>{formatearTelefono(row.telefono)}</td>
                    <td>
                      <div className="d-flex flex-wrap gap-2">
                        <CustomButton
                          type="button"
                          variant="outline-success"
                          title="Ver obra social"
                          aria-label="Ver obra social"
                          onClick={() => navigate(`/obras-sociales/${row._id}`)}
                        >
                          <BsEye size={16} />
                        </CustomButton>
                        <CustomButton
                          type="button"
                          variant="outline-primary"
                          title="Editar obra social"
                          aria-label="Editar obra social"
                          onClick={() =>
                            navigate(`/obras-sociales/editar/${row._id}`)
                          }
                        >
                          <BsPencilSquare size={16} />
                        </CustomButton>
                        <CustomButton
                          type="button"
                          variant="outline-danger"
                          title="Eliminar obra social"
                          aria-label="Eliminar obra social"
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
