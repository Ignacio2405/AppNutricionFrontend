import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BsEye, BsPencilSquare, BsTrash } from "react-icons/bs";
import { CustomInput } from "../ui/CustomInput.jsx";
import { CustomButton } from "../ui/CustomButton.jsx";
import { LIMITE_POR_PAGINA, Paginacion } from "../ui/Paginacion.jsx";
import {
  obtenerMetasObjetivos,
  eliminarMetaObjetivo,
} from "../../services/metaObjetivo.service.js";

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

const formatearFecha = (fecha) => {
  if (!fecha) return "-";
  const d = new Date(fecha);
  return Number.isNaN(d.getTime()) ? "-" : d.toLocaleDateString("es-AR");
};

const formatearPaciente = (paciente) => {
  if (!paciente) return "Sin paciente";
  if (typeof paciente === "object") {
    return (
      `${paciente.apellido || ""} ${paciente.nombre || ""}`.trim() ||
      paciente.dni ||
      "Sin nombre"
    );
  }
  return paciente;
};

export const ListarMetasObjetivos = () => {
  const usuario = useMemo(() => obtenerUsuarioToken(), []);
  const rolUsuario = String(usuario?.rol || "").toUpperCase();
  const esPaciente = rolUsuario === "PACIENTE";

  const [metas, setMetas] = useState([]);
  const [pagina, setPagina] = useState(1);
  const [paginacion, setPaginacion] = useState({});
  const [busqueda, setBusqueda] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let activo = true;

    const cargar = async () => {
      try {
        const res = await obtenerMetasObjetivos({
          page: pagina,
          limit: LIMITE_POR_PAGINA,
        });
        if (!activo) return;
        setMetas(Array.isArray(res?.data) ? res.data : []);
        setPaginacion(res?.pagination || {});
      } catch (err) {
        if (!activo) return;
        console.error("Error al cargar metas y objetivos:", err);
        setErrorMsg(
          err.response?.data?.mensaje ||
            "No se pudieron cargar las metas y objetivos.",
        );
      } finally {
        if (activo) setLoading(false);
      }
    };

    cargar();
    return () => {
      activo = false;
    };
  }, [pagina]);

  const handleEliminar = async (id) => {
    const confirmar = window.confirm(
      "¿Deseás dar de baja este registro de metas y objetivos?",
    );
    if (!confirmar) return;

    setErrorMsg("");
    try {
      await eliminarMetaObjetivo(id);
      setMetas((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      console.error("Error al eliminar meta/objetivo:", err);
      setErrorMsg(
        err.response?.data?.mensaje || "No se pudo dar de baja el registro.",
      );
    }
  };

  const metasFiltradas = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();
    if (!termino) return metas;

    return metas.filter((m) => {
      const pac =
        typeof m.pacienteId === "object"
          ? `${m.pacienteId?.apellido || ""} ${m.pacienteId?.nombre || ""} ${m.pacienteId?.dni || ""}`
          : String(m.pacienteId || "");
      const descObjetivos = (m.objetivos || [])
        .map(
          (o) =>
            `${o.description || ""} ${o.frecuenciaEsperada || ""} ${o.status || ""}`,
        )
        .join(" ");

      return `${pac} ${descObjetivos}`.toLowerCase().includes(termino);
    });
  }, [metas, busqueda]);

  return (
    <div className="container py-4">
      <div className="card shadow-sm border-0 p-4 rounded-4">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
          <h3 className="fw-bold text-success mb-0">Metas y Objetivos</h3>
          {!esPaciente && (
            <CustomButton
              type="button"
              onClick={() => navigate("/metas-objetivos/nuevo")}
            >
              + Nuevas Metas
            </CustomButton>
          )}
        </div>

        <div className="row mb-3">
          <div className="col-md-6">
            <CustomInput
              name="busquedaMetas"
              value={busqueda}
              onChange={(e) => {
                setBusqueda(e.target.value);
                setPagina(1);
              }}
              placeholder="Buscar por paciente, DNI, objetivo o estado..."
            />
          </div>
        </div>

        {errorMsg && (
          <div className="alert alert-danger py-2 small">{errorMsg}</div>
        )}

        {loading ? (
          <p className="text-muted mb-0">Cargando metas y objetivos...</p>
        ) : metasFiltradas.length === 0 ? (
          <p className="text-muted mb-0">
            No hay registros de metas y objetivos.
          </p>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th>Paciente</th>
                  <th>Consulta</th>
                  <th>Objetivos</th>
                  <th>Estados</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {metasFiltradas.map((row) => {
                  const objs = Array.isArray(row.objetivos)
                    ? row.objetivos
                    : [];
                  const consultaTexto =
                    typeof row.consultaId === "object" && row.consultaId
                      ? formatearFecha(row.consultaId.fecha)
                      : "-";

                  return (
                    <tr key={row._id}>
                      <td className="fw-medium">
                        {formatearPaciente(row.pacienteId)}
                      </td>
                      <td>{consultaTexto}</td>
                      <td>
                        {objs.length > 0
                          ? objs.map((o) => o.description).join(" · ")
                          : "-"}
                      </td>
                      <td>
                        <div className="d-flex flex-wrap gap-1">
                          {objs.map((o, idx) => (
                            <span
                              key={o._id || idx}
                              className={`badge rounded-pill px-2 py-1 text-capitalize ${
                                o.status === "cumplido"
                                  ? "bg-success-subtle text-success"
                                  : o.status === "pausado"
                                    ? "bg-warning-subtle text-warning-emphasis"
                                    : "bg-primary-subtle text-primary"
                              }`}
                            >
                              {o.status || "activo"}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td>
                        <div className="d-flex flex-wrap gap-2">
                          <CustomButton
                            type="button"
                            variant="outline-success"
                            title="Ver metas"
                            aria-label="Ver metas"
                            onClick={() =>
                              navigate(`/metas-objetivos/${row._id}`)
                            }
                          >
                            <BsEye size={16} />
                          </CustomButton>
                          {!esPaciente && (
                            <>
                            <CustomButton
                              type="button"
                              variant="outline-primary"
                              title="Editar metas"
                              aria-label="Editar metas"
                              onClick={() =>
                                navigate(`/metas-objetivos/editar/${row._id}`)
                              }
                            >
                              <BsPencilSquare size={16} />
                            </CustomButton>
                            <CustomButton
                              type="button"
                              variant="outline-danger"
                              title="Eliminar metas"
                              aria-label="Eliminar metas"
                              onClick={() => handleEliminar(row._id)}
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
