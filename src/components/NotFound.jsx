import { useNavigate } from "react-router-dom";
import { CustomButton } from "./ui/CustomButton";

export const NotFound = ({ homePath = "/", homeLabel = "Ir al inicio" }) => {
  const navigate = useNavigate();

  return (
    <div
      className="container py-5 d-flex justify-content-center align-items-center"
      style={{ maxWidth: "640px", minHeight: "65vh" }}
    >
      <div className="card shadow-sm border-0 p-4 p-md-5 rounded-4 text-center w-100">
        <div className="mb-2">
          <span className="badge rounded-pill bg-success-subtle text-success fw-semibold px-3 py-2">
            Error 404
          </span>
        </div>

        <h1 className="display-4 fw-bold text-success mb-2">404</h1>
        <h4 className="fw-semibold text-secondary mb-3">
          Página no encontrada
        </h4>

        <p className="text-muted mb-4">
          La ruta a la que intentás acceder no existe o fue movida. Verificá la
          dirección o volvé a una sección activa del sistema.
        </p>

        <div className="d-flex flex-wrap justify-content-center gap-2">
          <CustomButton
            type="button"
            variant="secondary"
            onClick={() => navigate(-1)}
          >
            Volver atrás
          </CustomButton>
          <CustomButton type="button" onClick={() => navigate(homePath)}>
            {homeLabel}
          </CustomButton>
        </div>
      </div>
    </div>
  );
};
