import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  BsPeople,
  BsHeartPulse,
  BsCardChecklist,
  BsCalendarCheck,
  BsJournalMedical,
  BsCupHot,
} from "react-icons/bs";

const SECCIONES_CONFIG = [
  {
    id: "pacientes-grupo",
    label: "Pacientes",
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
    icon: BsCupHot,
    className: "mt-1",
    children: [
      {
        id: "habitos-nuevo",
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
];

export const NavBar = () => {
  const navigate = useNavigate();

  const [openSections, setOpenSections] = useState(() =>
    SECCIONES_CONFIG.reduce((acc, sec) => {
      acc[sec.id] = false;
      return acc;
    }, {}),
  );

  const toggleSection = (id) => {
    setOpenSections((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
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
          <img src="/LogoVerde.png" alt="Logo CulA Nutrición" width="100" />
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
          {SECCIONES_CONFIG.map((sec) => {
            const IconComponent = sec.icon;
            const isOpen = Boolean(openSections[sec.id]);
            const firstChildPath = sec.children?.[0]?.path;

            return (
              <li className={`nav-item ${sec.className}`} key={sec.id}>
                <div className="d-flex align-items-center justify-content-between">
                  {firstChildPath ? (
                    <NavLink
                      to={firstChildPath}
                      end
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
            <strong>Usuario</strong>
          </a>

          <ul
            className="dropdown-menu dropdown-menu-dark text-small shadow"
            aria-labelledby="dropdownUser1"
          >
            <li>
              <Link className="dropdown-item" to="/pacientes/nuevo">
                Nuevo Paciente
              </Link>
            </li>
            <li>
              <Link className="dropdown-item" to="/medicos/nuevo">
                Nuevo Médico
              </Link>
            </li>
            <li>
              <Link className="dropdown-item" to="/obras-sociales/nueva">
                Nueva Obra Social
              </Link>
            </li>
            <li>
              <Link className="dropdown-item" to="/consulta/nueva">
                Nueva Consulta
              </Link>
            </li>
            <li>
              <Link className="dropdown-item" to="/historial-medico/nuevo">
                Nuevo Historial Médico
              </Link>
            </li>
            <li>
              <hr className="dropdown-divider" />
            </li>
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
