import { LIMITE_POR_PAGINA } from "../../utils/paginacion.js";

export { LIMITE_POR_PAGINA };

export const Paginacion = ({
  pagina,
  paginacion,
  onCambiarPagina,
  cargando = false,
}) => {
  const paginaActual = Number(
    paginacion?.page ?? paginacion?.currentPage ?? pagina,
  );
  const limite = Number(
    paginacion?.limit ?? paginacion?.pageSize ?? LIMITE_POR_PAGINA,
  );
  const total = Number(
    paginacion?.total ??
      paginacion?.totalItems ??
      paginacion?.totalDocs ??
      paginacion?.totalRecords ??
      paginacion?.totalCount ??
      0,
  );
  const totalPaginas = Math.max(
    1,
    Number(
      paginacion?.totalPages ??
        paginacion?.pages ??
        Math.ceil(total / limite),
    ),
  );

  if (totalPaginas <= 1) return null;

  return (
    <nav
      className="d-flex flex-wrap justify-content-between align-items-center gap-2 mt-3"
      aria-label="Paginación"
    >
      <span className="small text-muted">
        Página {paginaActual} de {totalPaginas}
      </span>
      <div className="d-flex gap-2">
        <button
          type="button"
          className="btn btn-outline-success btn-sm"
          onClick={() => onCambiarPagina(paginaActual - 1)}
          disabled={cargando || paginaActual <= 1}
        >
          Anterior
        </button>
        <button
          type="button"
          className="btn btn-outline-success btn-sm"
          onClick={() => onCambiarPagina(paginaActual + 1)}
          disabled={cargando || paginaActual >= totalPaginas}
        >
          Siguiente
        </button>
      </div>
    </nav>
  );
};
