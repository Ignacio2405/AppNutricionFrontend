import { useNavigate } from "react-router-dom";
import { CustomButton } from "./CustomButton";

export const CustomTable = ({
  titulo,
  rutaNuevo,
  textoBotonNuevo,
  columnas = [],
  datos = [],
  loading = false,
}) => {
  const navigate = useNavigate();

  return (
    <div className="container py-4">
      <div className="card shadow-sm border-0 p-4 rounded-4">
        {/* Cabecera de la sección */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="fw-bold text-success m-0">{titulo}</h3>
          {rutaNuevo && (
            <CustomButton variant="success" onClick={() => navigate(rutaNuevo)}>
              {textoBotonNuevo || "+ Nuevo Registro"}
            </CustomButton>
          )}
        </div>

        {/* Estado de carga */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-success" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
            <p className="text-muted mt-2">Obteniendo registros...</p>
          </div>
        ) : datos.length === 0 ? (
          <div className="alert alert-light text-center py-4 text-muted border">
            No hay registros disponibles para mostrar.
          </div>
        ) : (
          /* Tabla de datos */
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  {columnas.map((col, index) => (
                    <th
                      key={index}
                      scope="col"
                      className="text-secondary fw-semibold"
                    >
                      {col.titulo}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {datos.map((item, rowIndex) => (
                  <tr key={item._id || rowIndex}>
                    {columnas.map((col, colIndex) => (
                      <td key={colIndex}>
                        {col.render ? col.render(item) : item[col.campo]}
                      </td>
                    ))}
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
