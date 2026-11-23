import { useMemo, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  BsPeople,
  BsHeartPulse,
  BsCardChecklist,
  BsCalendarCheck,
  BsJournalMedical,
  BsCupHot,
  BsClipboardPulse,
  BsCheck2Circle,
} from "react-icons/bs";

const ROLES = {
  ADMIN: "ADMIN",
  RECEPCIONISTA: "RECEPCIONISTA",
  MEDICO: "MEDICO",
  USER: "USER",
  PACIENTE: "PACIENTE",
};

const TODOS_LOS_ROLES = [
  ROLES.ADMIN,
  ROLES.RECEPCIONISTA,
  ROLES.MEDICO,
  ROLES.USER,
  ROLES.PACIENTE,
];

const SECCIONES_CONFIG = [
  {
    id: "pacientes-grupo",
    label: "Pacientes",
    roles: TODOS_LOS_ROLES,
    icon: BsPeople,
    className: "",
    children: [
      {
        id: "pacientes-lista",
        label: "Lista de Pacientes",
        path: "/customers",
      },
      {
        id: "pacientes-nuevo",
        label: "Nuevo Paciente",
        path: "/pacientes/nuevo",
      },
    ],
  },
  {
    id: "medicos-grupo",
    label: "Médicos",
    roles: [ROLES.ADMIN],
    icon: BsHeartPulse,
    className: "mt-1",
    children: [
      { id: "medicos-lista", label: "Lista de Médicos", path: "/medicos" },
      { id: "medicos-nuevo", label: "Nuevo Médico", path: "/medicos/nuevo" },
    ],
  },
  {
    id: "obras-sociales-grupo",
    label: "Obras Sociales",
    roles: [ROLES.ADMIN, ROLES.RECEPCIONISTA],
    icon: BsCardChecklist,
    className: "mt-1",
    children: [
      {
        id: "obras-lista",
        label: "Lista de Obras Sociales",
        path: "/obras-sociales",
      },
      {
        id: "obras-nueva",
        label: "Nueva Obra Social",
        path: "/obras-sociales/nueva",
      },
    ],
  },
  {
    id: "consultas-grupo",
    label: "Consultas",
    roles: [ROLES.ADMIN, ROLES.MEDICO],
    icon: BsCalendarCheck,
    className: "mt-1",
    children: [
      { id: "consultas-lista", label: "Lista de Consultas", path: "/consulta" },
      {
        id: "consultas-nueva",
        label: "Nueva Consulta",
        path: "/consulta/nueva",
      },
    ],
  },
  {
    id: "historial-medico-grupo",
    label: "Historiales Médicos",
    roles: [ROLES.ADMIN, ROLES.MEDICO],
    icon: BsJournalMedical,
    className: "mt-1",
    children: [
      {
        id: "historial-lista",
        label: "Lista de Historiales",
        path: "/historial-medico",
      },
      {
        id: "historial-nuevo",
        label: "Nuevo Historial",
        path: "/historial-medico/nuevo",
      },
    ],
  },
  {
    id: "habitos-alimentarios-grupo",
    label: "Hábitos Alimentarios",
    roles: [ROLES.ADMIN, ROLES.MEDICO],
    icon: BsCupHot,
    className: "mt-1",
    children: [
      {
        id: "habitos-lista",
        label: "Lista Hábitos",
        path: "/habitos-alimentarios",
      },
      {
        id: "habitos-nuevo",
        label: "Nuevos Hábitos",
        path: "/habitos-alimentarios/nuevo",
      },
    ],
  },
  {
    id: "resultados-laboratorio-grupo",
    label: "Resultados de Laboratorio",
    roles: [ROLES.ADMIN, ROLES.MEDICO],
    icon: BsClipboardPulse,
    className: "mt-1",
    children: [
      {
        id: "laboratorio-lista",
        label: "Lista de Laboratorios",
        path: "/resultados-laboratorio",
      },
      {
        id: "laboratorio-nuevo",
        label: "Nuevo Laboratorio",
        path: "/resultados-laboratorio/nuevo",
      },
    ],
  },
  {
    id: "planes-comidas-grupo",
    label: "Planes de Comidas",
    roles: [ROLES.ADMIN, ROLES.MEDICO],
    icon: BsCupHot,
    className: "mt-1",
    children: [
      {
        id: "planes-comidas-lista",
        label: "Lista de Planes",
        path: "/planes-comidas",
      },
      {
        id: "planes-comidas-nuevo",
        label: "Nuevo Plan",
        path: "/planes-comidas/nuevo",
      },
    ],
  },
  {
    id: "metas-objetivos-grupo",
    label: "Metas y Objetivos",
    roles: [ROLES.ADMIN, ROLES.MEDICO, ROLES.PACIENTE],
    icon: BsCheck2Circle,
    className: "mt-1",
    children: [
      {
        id: "metas-objetivos-lista",
        label: "Lista de Metas",
        path: "/metas-objetivos",
      },
      {
        id: "metas-objetivos-nuevo",
        label: "Nuevas Metas",
        path: "/metas-objetivos/nuevo",
      },
    ],
  },
];

const ACCESOS_RAPIDOS = [
  {
    id: "quick-paciente",
    label: "Nuevo Paciente",
    path: "/pacientes/nuevo",
    roles: [ROLES.ADMIN, ROLES.RECEPCIONISTA],
  },
  {
    id: "quick-medico",
    label: "Nuevo Médico",
    path: "/medicos/nuevo",
    roles: [ROLES.ADMIN],
  },
  {
    id: "quick-obra",
    label: "Nueva Obra Social",
    path: "/obras-sociales/nueva",
    roles: [ROLES.ADMIN, ROLES.RECEPCIONISTA],
  },
  {
    id: "quick-consulta",
    label: "Nueva Consulta",
    path: "/consulta/nueva",
    roles: [ROLES.ADMIN, ROLES.MEDICO],
  },
  {
    id: "quick-historial",
    label: "Nuevo Historial Médico",
    path: "/historial-medico/nuevo",
    roles: [ROLES.ADMIN, ROLES.MEDICO],
  },
  {
    id: "quick-metas",
    label: "Nuevas Metas y Objetivos",
    path: "/metas-objetivos/nuevo",
    roles: [ROLES.ADMIN, ROLES.MEDICO],
  },
];

const obtenerUsuarioDesdeToken = () => {
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

export const NavBar = () => {
  const navigate = useNavigate();

  const usuario = useMemo(() => obtenerUsuarioDesdeToken(), []);
  const rolUsuario = (usuario?.rol || "").toString().toUpperCase();

  const tienePermiso = (rolesPermitidos) => {
    if (!Array.isArray(rolesPermitidos) || rolesPermitidos.length === 0) {
      return true;
    }
    return rolesPermitidos.map((r) => r.toUpperCase()).includes(rolUsuario);
  };

  const seccionesVisibles = useMemo(
    () => SECCIONES_CONFIG.filter((sec) => tienePermiso(sec.roles)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rolUsuario],
  );

  const accesosVisibles = useMemo(
    () => ACCESOS_RAPIDOS.filter((item) => tienePermiso(item.roles)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rolUsuario],
  );

  // Solo un ítem abierto a la vez; null si todos están cerrados
  const [openSectionId, setOpenSectionId] = useState(null);

  const toggleSection = (id) => {
    setOpenSectionId((prev) => (prev === id ? null : id));
  };

  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <>
      <nav className="navbar navbar-light custom-sidebar d-md-none px-3 w-100 sticky-top">
        <Link to="/" className="navbar-brand d-flex align-items-center">
          <img src="/LogoVerde.png" alt="Logo CulA Nutrición" width="80" />
        </Link>
        <button
          className="navbar-toggler border-dark"
          type="button"
          data-bs-toggle="offcanvas"
          data-bs-target="#sidebarMenu"
          aria-controls="sidebarMenu"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
      </nav>

      <div
        className="offcanvas-md offcanvas-start custom-sidebar d-flex flex-column flex-shrink-0 p-3 h-100 overflow-y-auto"
        style={{ paddingBottom: "3rem" }}
        tabIndex={-1}
        id="sidebarMenu"
        aria-labelledby="sidebarMenuLabel"
      >
        <div className="offcanvas-header d-md-none border-bottom border-dark pb-3 mb-3">
          <Link
            to="/"
            className="d-flex align-items-center text-decoration-none"
          >
            <img src="/LogoVerde.png" alt="Logo CulA Nutrición" width="110" />
          </Link>
          <button
            type="button"
            className="btn-close"
            data-bs-dismiss="offcanvas"
            data-bs-target="#sidebarMenu"
            aria-label="Close"
          ></button>
        </div>

        <Link
          to="/"
          className="d-none d-md-flex justify-content-center align-items-center w-100 mb-3 mb-md-0 text-decoration-none"
        >
          <img src="/LogoVerde.png" alt="Logo CulA Nutrición" width="140" />
        </Link>
        <hr className="d-none d-md-block border-dark" />

        <ul className="nav nav-pills flex-column mb-auto">
          {seccionesVisibles.map((sec) => {
            const IconComponent = sec.icon;
            const isOpen = openSectionId === sec.id;
            const firstChildPath = sec.children?.[0]?.path;

            return (
              <li className={`nav-item ${sec.className}`} key={sec.id}>
                <div className="d-flex align-items-center justify-content-between">
                  {firstChildPath ? (
                    <NavLink
                      to={firstChildPath}
                      end
                      onClick={() => setOpenSectionId(sec.id)}
                      className={({ isActive }) =>
                        `nav-link d-flex align-items-center text-dark fw-medium flex-grow-1 ${
                          isActive ? "active bg-secondary text-white" : ""
                        }`
                      }
                    >
                      {IconComponent && (
                        <IconComponent
                          className="me-2 flex-shrink-0"
                          size={16}
                        />
                      )}
                      <span>{sec.label}</span>
                    </NavLink>
                  ) : (
                    <button
                      type="button"
                      onClick={() => toggleSection(sec.id)}
                      className="nav-link d-flex align-items-center text-dark fw-medium flex-grow-1 text-start border-0 bg-transparent"
                    >
                      {IconComponent && (
                        <IconComponent
                          className="me-2 flex-shrink-0"
                          size={16}
                        />
                      )}
                      <span>{sec.label}</span>
                    </button>
                  )}

                  <button
                    type="button"
                    className="btn btn-sm btn-link text-dark text-decoration-none px-2"
                    onClick={() => toggleSection(sec.id)}
                    aria-expanded={isOpen}
                    aria-label={`${isOpen ? "Ocultar" : "Mostrar"} opciones de ${sec.label}`}
                    title={`${isOpen ? "Ocultar" : "Mostrar"} opciones de ${sec.label}`}
                  >
                    <span
                      className="d-inline-block"
                      style={{
                        transition: "transform 0.2s ease",
                        transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
                        fontSize: "0.8rem",
                      }}
                    >
                      ▸
                    </span>
                  </button>
                </div>

                {isOpen && Array.isArray(sec.children) && (
                  <ul className="nav flex-column ps-3 mt-1 gap-1">
                    {sec.children.map((child) => (
                      <li className="nav-item" key={child.id}>
                        <NavLink
                          to={child.path}
                          end
                          className={({ isActive }) =>
                            `nav-link small text-dark py-1 px-2 ${
                              isActive ? "active bg-secondary text-white" : ""
                            }`
                          }
                        >
                          {child.label}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>

        <hr className="border-dark my-2" />

        <div className="dropdown mt-auto">
          <a
            href="#user-menu"
            className="d-flex align-items-center text-dark text-decoration-none dropdown-toggle"
            id="dropdownUser1"
            data-bs-toggle="dropdown"
            aria-expanded="false"
            onClick={(e) => e.preventDefault()}
          >
            <img
              src="https://github.com/mdo.png"
              alt="Avatar"
              width="32"
              height="32"
              className="rounded-circle me-2"
            />
            <strong>{usuario?.user || "Usuario"}</strong>
          </a>

          <ul
            className="dropdown-menu dropdown-menu-dark text-small shadow"
            aria-labelledby="dropdownUser1"
          >
            {accesosVisibles.map((item) => (
              <li key={item.id}>
                <Link className="dropdown-item" to={item.path}>
                  {item.label}
                </Link>
              </li>
            ))}
            {accesosVisibles.length > 0 && (
              <li>
                <hr className="dropdown-divider" />
              </li>
            )}
            <li>
              <button className="dropdown-item" onClick={handleLogout}>
                Cerrar sesión
              </button>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
};
