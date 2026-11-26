import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { obtenerPlanComidasPorId } from "../../services/planComidas.service.js";
import { obtenerUsuarioDesdeToken } from "../utils/authToken.js";
import "../../styles/planComidasPrint.css";

const formatearFecha = (fecha) => {
  if (!fecha) return "—";
  const d = new Date(fecha);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("es-AR");
};

const ETIQUETA_MOMENTO = {
  DESAYUNO_MERIENDA: "Desayuno y merienda",
  ALMUERZO_CENA: "Almuerzo y cena",
  COLACION: "Colación",
};

const RECOMENDACIONES_FALLBACK = [
  "Realizar diariamente las 4 comidas principales y 2 colaciones.",
  "Evitar el consumo de alimentos calientes o muy fríos.",
  "Optar por carnes tiernas y magras, en lo posible blancas (pescados y pollo), cocidas y subdivididas.",
  "Evitar el consumo de frutas secas, cereales integrales y vegetales crudos cuando corresponda.",
];

export const DetallePlanComidas = () => {
  const { id } = useParams();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const usuario = obtenerUsuarioDesdeToken();
  const esPaciente =
    String(usuario?.rol || "").trim().toUpperCase() === "PACIENTE";

  useEffect(() => {
    let ignore = false;

    const cargar = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await obtenerPlanComidasPorId(id);
        if (!ignore) {
          setPlan(res?.data || res);
        }
      } catch (err) {
        if (!ignore) {
          setError(
            err.response?.data?.mensaje ||
              "No se pudo obtener el plan de comidas.",
          );
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    cargar();
    return () => {
      ignore = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-success" role="status" />
        <p className="text-muted mt-2">Cargando detalle del plan...</p>
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="container py-4">
        <div className="alert alert-danger">
          {error || "Plan de comidas no encontrado."}
        </div>
        <Link to="/planes-comidas" className="btn btn-secondary">
          ← Volver al listado
        </Link>
      </div>
    );
  }

  const paciente = typeof plan.patientId === "object" ? plan.patientId : null;
  const consulta =
    typeof plan.consultationId === "object" ? plan.consultationId : null;
  const macros = plan.objetivosMacros || {};

  const grupos = Array.isArray(plan.grupoDeAlimentos)
    ? plan.grupoDeAlimentos
    : [];
  const gruposHoja1 = grupos.slice(0, 6);
  const gruposHoja2 = grupos.slice(6);

  const equivalencias = Array.isArray(plan.distribucionEquivalencias)
    ? plan.distribucionEquivalencias
    : [];
  const equivalenciasDesayunoMerienda = equivalencias.filter(
    (eq) => eq.momento === "DESAYUNO_MERIENDA",
  );
  const equivalenciasResto = equivalencias.filter(
    (eq) => eq.momento !== "DESAYUNO_MERIENDA",
  );

  const recetas = Array.isArray(plan.recetasEjemplos)
    ? plan.recetasEjemplos
    : [];

  const advertencias = Array.isArray(plan.advertencias)
    ? plan.advertencias
    : [];

  const recomendaciones =
    Array.isArray(plan.recomendacionesGenerales) &&
    plan.recomendacionesGenerales.length > 0
      ? plan.recomendacionesGenerales
      : RECOMENDACIONES_FALLBACK;

  return (
    <div className="container py-4">
      {/* Barra de acciones superior (oculta al imprimir) */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4 d-print-none">
        <Link to="/planes-comidas" className="btn btn-outline-secondary">
          ← Volver al listado
        </Link>

        <div className="d-flex flex-wrap gap-2">
          {!esPaciente && (
            <Link
              to={`/planes-comidas/${plan._id}/editar`}
              className="btn btn-warning"
            >
              Editar plan
            </Link>
          )}
          <button
            type="button"
            className="btn btn-success"
            onClick={() => window.print()}
          >
            Imprimir / Guardar PDF
          </button>
        </div>
      </div>

      {/* Resumen clínico y de vigencia en pantalla (oculto al imprimir) */}
      <div className="card shadow-sm border-0 p-4 rounded-4 mb-4 d-print-none">
        <div className="d-flex flex-wrap justify-content-between align-items-start gap-2 border-bottom pb-3 mb-3">
          <div>
            <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
              <h4 className="fw-bold text-success mb-0">{plan.titulo}</h4>
              {plan.tipoPlan && (
                <span className="badge bg-success-subtle text-success border border-success-subtle">
                  {plan.tipoPlan}
                </span>
              )}
            </div>
            <div className="text-muted small">
              <strong>Paciente:</strong>{" "}
              {paciente
                ? `${paciente.nombre || ""} ${paciente.apellido || ""}`.trim()
                : "—"}{" "}
              {paciente?.dni ? `| DNI: ${paciente.dni}` : ""}
              {paciente?.email ? ` | ${paciente.email}` : ""}
            </div>
            {consulta && (
              <div className="text-muted small mt-1">
                <strong>Consulta vinculada:</strong>{" "}
                {formatearFecha(consulta.fecha)}{" "}
                {consulta.hora ? `(${consulta.hora} hs)` : ""}
                {consulta.observaciones ? ` — ${consulta.observaciones}` : ""}
              </div>
            )}
          </div>

          <span
            className={`badge ${
              plan.planActivo ? "bg-success" : "bg-secondary"
            }`}
          >
            {plan.planActivo ? "Plan Activo" : "Plan Anterior"}
          </span>
        </div>

        <div className="row g-2 small text-muted mb-3">
          <div className="col-sm-4">
            <strong>Fecha de entrega:</strong>{" "}
            {formatearFecha(plan.fechaEntrega)}
          </div>
          <div className="col-sm-4">
            <strong>Inicio vigencia:</strong>{" "}
            {formatearFecha(plan.fechaInicioVigencia)}
          </div>
          <div className="col-sm-4">
            <strong>Revisión estimada:</strong>{" "}
            {formatearFecha(plan.fechaFinRevision)}
          </div>
        </div>

        <div className="row g-3 text-center">
          <div className="col-6 col-md-3">
            <div className="border rounded-3 p-2 bg-light">
              <div className="small text-muted">Calorías</div>
              <div className="fw-bold fs-6">
                {macros.caloriasDiarias != null
                  ? `${macros.caloriasDiarias} kcal`
                  : "—"}
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="border rounded-3 p-2 bg-light">
              <div className="small text-muted">Proteínas</div>
              <div className="fw-bold fs-6">
                {macros.proteinasGramos != null
                  ? `${macros.proteinasGramos} g`
                  : "—"}
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="border rounded-3 p-2 bg-light">
              <div className="small text-muted">Carbohidratos</div>
              <div className="fw-bold fs-6">
                {macros.carbohidratosGramos != null
                  ? `${macros.carbohidratosGramos} g`
                  : "—"}
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="border rounded-3 p-2 bg-light">
              <div className="small text-muted">Grasas</div>
              <div className="fw-bold fs-6">
                {macros.grasasGramos != null ? `${macros.grasasGramos} g` : "—"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ====================================================================
          HOJA 1: Encabezado, Títulos, Selección y Formas de Preparación
         ==================================================================== */}
      <div className="hoja-plan-pdf">
        <div className="plan-encabezado-top">
          <img
            src="/LogoVerde.png"
            alt="Logo CulA Nutrición"
            className="plan-logo-img"
          />
          <div className="plan-page-badge">1</div>
        </div>

        <div className="plan-caja-borde d-flex flex-wrap justify-content-between align-items-center small">
          <span>
            {paciente
              ? `${paciente.nombre || ""} ${paciente.apellido || ""}`.trim()
              : ""}
            {paciente?.dni ? ` — DNI: ${paciente.dni}` : ""}
          </span>
          <span className="fw-semibold">
            Entrega del plan: {formatearFecha(plan.fechaEntrega)}
          </span>
        </div>

        <div className="plan-caja-borde text-center py-2">
          <div className="fw-bold text-uppercase">
            PLAN ALIMENTARIO{plan.tipoPlan ? `. ${plan.tipoPlan}.` : "."}
          </div>
          <div className="fst-italic">{plan.titulo}</div>
        </div>

        <div className="plan-caja-borde text-center fw-bold text-uppercase small py-1">
          SELECCIÓN Y FORMAS DE PREPARACIÓN
        </div>

        <table className="plan-tabla-alimentos">
          <thead>
            <tr>
              <th style={{ width: "22%" }}>ALIMENTOS</th>
              <th style={{ width: "43%" }}>SELECCIÓN</th>
              <th style={{ width: "35%" }}>FORMA DE PREPARACIÓN</th>
            </tr>
          </thead>
          <tbody>
            {gruposHoja1.length > 0 ? (
              gruposHoja1.map((item, i) => (
                <tr key={`h1-${i}`}>
                  <td className="fw-bold">{item.categoria}</td>
                  <td>{item.seleccion}</td>
                  <td>{item.metodoPreparacion || "—"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="text-center text-muted py-3">
                  Sin grupos de alimentos cargados.
                </td>
              </tr>
            )}

            {advertencias.map((adv, idx) => (
              <tr className="plan-fila-aviso" key={`adv-h1-${idx}`}>
                <td colSpan={3}>* {adv}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="plan-footer-info">
          Consultorio — Turnos — Goya (Corrientes)
        </div>
      </div>

      {/* ====================================================================
          HOJA 2: Continuación y Distribución de Alimentos / Equivalencias
         ==================================================================== */}
      <div className="hoja-plan-pdf salto-pagina-pdf mt-4">
        <div className="plan-encabezado-top">
          <img
            src="/LogoVerde.png"
            alt="Logo CulA Nutrición"
            className="plan-logo-img"
          />
          <div className="plan-page-badge">2</div>
        </div>

        {gruposHoja2.length > 0 && (
          <table className="plan-tabla-alimentos mb-3">
            <thead>
              <tr>
                <th style={{ width: "22%" }}>ALIMENTOS</th>
                <th style={{ width: "43%" }}>SELECCIÓN</th>
                <th style={{ width: "35%" }}>FORMA DE PREPARACIÓN</th>
              </tr>
            </thead>
            <tbody>
              {gruposHoja2.map((item, idx) => (
                <tr key={`h2-${idx}`}>
                  <td className="fw-bold">{item.categoria}</td>
                  <td>{item.seleccion}</td>
                  <td>{item.metodoPreparacion || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="banner-seccion-verde">
          DISTRIBUCIÓN DE ALIMENTOS Y EQUIVALENCIAS
        </div>
        <p className="subtitulo-equivalencias">
          Consumir las porciones y opciones indicadas según cada momento del
          día.
        </p>

        <div className="text-center mb-3">
          <span className="cinta-subtitulo">DESAYUNO Y MERIENDA</span>
        </div>

        <table className="tabla-equivalencias mb-3">
          <thead>
            <tr>
              <th style={{ width: "22%" }}>RUBRO</th>
              <th style={{ width: "33%" }}>PORCIONES / EQUIVALENCIAS</th>
              <th style={{ width: "45%" }}>OPCIONES / PREPARACIONES</th>
            </tr>
          </thead>
          <tbody>
            {equivalenciasDesayunoMerienda.length > 0 ? (
              equivalenciasDesayunoMerienda.map((eq, idx) => (
                <tr key={`eq-dm-${idx}`}>
                  <td className="fw-bold">{eq.rubro}</td>
                  <td>{eq.porcionesEquivalencias}</td>
                  <td>{eq.opcionesOPreparaciones || "—"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="text-center text-muted py-2">
                  Sin equivalencias de desayuno y merienda cargadas.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {recetas.length > 0 && (
          <>
            <div className="text-center mb-2">
              <span className="cinta-subtitulo">RECETAS / EJEMPLOS</span>
            </div>
            <table className="tabla-equivalencias">
              <thead>
                <tr>
                  <th style={{ width: "28%" }}>PREPARACIÓN</th>
                  <th style={{ width: "32%" }}>INGREDIENTES</th>
                  <th style={{ width: "40%" }}>ELABORACIÓN</th>
                </tr>
              </thead>
              <tbody>
                {recetas.map((rec, idx) => (
                  <tr key={`rec-${idx}`}>
                    <td className="fw-bold">{rec.nombre}</td>
                    <td className="small">{rec.ingredientes || "—"}</td>
                    <td className="small">{rec.preparacion || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        <div className="plan-footer-info">
          Consultorio — Turnos — Goya (Corrientes)
        </div>
      </div>

      {/* ====================================================================
          HOJA 3: Equivalencias Restantes, Recomendaciones y Firma
         ==================================================================== */}
      <div className="hoja-plan-pdf salto-pagina-pdf mt-4">
        <div className="plan-encabezado-top">
          <img
            src="/LogoVerde.png"
            alt="Logo CulA Nutrición"
            className="plan-logo-img"
          />
          <div className="plan-page-badge">3</div>
        </div>

        <table className="tabla-equivalencias mb-3">
          <thead>
            <tr>
              <th style={{ width: "20%" }}>MOMENTO</th>
              <th style={{ width: "20%" }}>RUBRO</th>
              <th style={{ width: "28%" }}>PORCIONES / EQUIVALENCIAS</th>
              <th style={{ width: "32%" }}>OPCIONES / PREPARACIONES</th>
            </tr>
          </thead>
          <tbody>
            {equivalenciasResto.length > 0 ? (
              equivalenciasResto.map((eq, idx) => (
                <tr key={`eq-resto-${idx}`}>
                  <td className="fw-semibold">
                    {ETIQUETA_MOMENTO[eq.momento] || eq.momento}
                  </td>
                  <td className="fw-bold">{eq.rubro}</td>
                  <td>{eq.porcionesEquivalencias}</td>
                  <td>{eq.opcionesOPreparaciones || "—"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="text-center text-muted py-2">
                  Sin equivalencias adicionales cargadas.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="banner-seccion-verde">
          RECOMENDACIONES HIGIÉNICO-DIETÉTICAS
        </div>

        <div className="recuadro-recomendaciones">
          <div className="text-center fw-bold fst-italic small mb-2">
            RECOMENDACIONES GENERALES
          </div>
          <ul className="lista-flechas">
            {recomendaciones.map((rec, idx) => (
              <li key={`rec-gen-${idx}`}>{rec}</li>
            ))}
          </ul>
        </div>

        <div className="firma-profesional-box">
          <div className="firma-profesional-card">
            {/* <img src="/firma-profesional.png" alt="Firma y sello profesional" /> */}
          </div>
        </div>

        <div className="plan-footer-info">
          Consultorio — Turnos — Goya (Corrientes)
        </div>
      </div>
    </div>
  );
};
