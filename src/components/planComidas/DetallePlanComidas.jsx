import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { obtenerPlanComidasPorId } from "../../services/planComidas.service.js";
import "../../styles/planComidasPrint.css";

const formatearFecha = (fecha) => {
  if (!fecha) return "—";
  const d = new Date(fecha);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("es-AR");
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
  const advertencias = Array.isArray(plan.advertencias)
    ? plan.advertencias
    : [];

  const gruposHoja1 = grupos.slice(0, 6);
  const gruposHoja2 = grupos.slice(6);

  const listaRecomendaciones =
    advertencias.length > 0 ? advertencias : RECOMENDACIONES_FALLBACK;

  return (
    <div className="container py-4">
      {/* Barra de acciones superior (oculta al imprimir) */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4 d-print-none">
        <Link to="/planes-comidas" className="btn btn-outline-secondary">
          ← Volver al listado
        </Link>

        <div className="d-flex flex-wrap gap-2">
          <Link
            to={`/planes-comidas/${plan._id}/editar`}
            className="btn btn-warning"
          >
            Editar plan
          </Link>
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
            <h4 className="fw-bold text-success mb-1">{plan.titulo}</h4>
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
          <div className="fw-bold text-uppercase">PLAN ALIMENTARIO.</div>
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

        <table className="plan-tabla-alimentos">
          <thead>
            <tr>
              <th style={{ width: "22%" }}>ALIMENTOS</th>
              <th style={{ width: "43%" }}>SELECCIÓN</th>
              <th style={{ width: "35%" }}>FORMA DE PREPARACIÓN</th>
            </tr>
          </thead>
          <tbody>
            <tr className="plan-fila-aviso">
              <td colSpan={3}>
                * Incluir al final de la preparación,{" "}
                <strong>NO utilizar durante</strong> ni como medio de cocción.
              </td>
            </tr>
            {gruposHoja2.map((item, idx) => (
              <tr key={`h2-${idx}`}>
                <td className="fw-bold">{item.categoria}</td>
                <td>{item.seleccion}</td>
                <td>{item.metodoPreparacion || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="banner-seccion-verde">
          DISTRIBUCIÓN DE ALIMENTOS Y EQUIVALENCIAS
        </div>
        <p className="subtitulo-equivalencias">
          Consumir una de las opciones de lácteos, cereales y frutas en cada
          preparación tanto de desayuno como de merienda.
        </p>

        <div className="text-center mb-3">
          <span className="cinta-subtitulo">DESAYUNO Y MERIENDA</span>
        </div>

        <table className="tabla-equivalencias">
          <tbody>
            <tr>
              <td
                rowSpan={2}
                className="fw-bold text-center"
                style={{ width: "18%" }}
              >
                LÁCTEOS
              </td>
              <td className="fw-semibold" style={{ width: "20%" }}>
                Queso
              </td>
              <td style={{ width: "40%" }}>
                2 cucharas soperas de queso untable.
                <br />
                3 fetas.
                <br />1 porción (imagen).
              </td>
              <td rowSpan={2} className="text-center" style={{ width: "22%" }}>
                {/* <img src="/equivalencias/lacteos.jpg" alt="Lácteos" className="img-equivalencia" /> */}
              </td>
            </tr>
            <tr>
              <td className="fw-semibold">Yogurt / Leche</td>
              <td>1 taza. (Desayuno y merienda).</td>
            </tr>
          </tbody>
        </table>

        <div className="row g-2 mb-2">
          <div className="col-md-7">
            <table className="tabla-equivalencias mb-0">
              <tbody>
                <tr>
                  <td className="fw-bold text-center" style={{ width: "28%" }}>
                    CEREALES
                  </td>
                  <td className="fw-semibold" style={{ width: "27%" }}>
                    Pan
                  </td>
                  <td>
                    1 rodaja tipo molde.
                    <br />3 tostadas mignón.
                    <br />4 galletitas saladas tipo criollitas.
                  </td>
                </tr>
                <tr>
                  <td className="text-center small text-muted">
                    Avena / Copos s/azúcar
                  </td>
                  <td className="fw-semibold">Avena / Copos</td>
                  <td>3 cucharadas soperas.</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="col-md-5">
            <table className="tabla-equivalencias mb-0">
              <tbody>
                <tr>
                  <td className="fw-bold text-center" style={{ width: "30%" }}>
                    FRUTAS
                  </td>
                  <td>
                    1 unidad.
                    <br />1 taza.
                    <br />
                    Puré, compota con poco jugo, rallada.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <table className="tabla-equivalencias">
          <tbody>
            <tr>
              <td className="fw-bold text-center" style={{ width: "20%" }}>
                AZÚCAR / EDULCORANTE
              </td>
              <td className="fw-semibold" style={{ width: "22%" }}>
                Mermelada / Dulce - postre (batata o membrillo) / Azúcar
              </td>
              <td style={{ width: "36%" }}>
                2 cucharadas tipo postre.
                <br />
                Porción acompañar con queso.
              </td>
              <td className="text-center" style={{ width: "22%" }}>
                {/* <img src="/equivalencias/dulce.jpg" alt="Dulce" className="img-equivalencia" /> */}
              </td>
            </tr>
            <tr>
              <td className="fw-bold text-center">
                BUDÍN (artesanal)
                <br />
                <span className="fw-normal small">1 PORCIÓN</span>
              </td>
              <td colSpan={3} className="small">
                2 frutas / frutos secos - 2 huevos - 2 claras -
                azúcar/stevia/edulcorante - esencia de vainilla - aceite c/n.
                180 g de harina leudante / avena / harina integral + 1 cda de
                polvo de hornear. Preparar el molde, batir las claras a punto
                nieve, separado batir los huevos y agregar el polvo y la
                esencia, endulzar, agregar las frutas ralladas o frutos secos y
                la harina, verter las claras, mezclar con movimientos
                envolventes.
              </td>
            </tr>
            <tr>
              <td className="fw-bold text-center">
                TOSTADA CON ACEITE DE OLIVA Y QUESO
              </td>
              <td className="small">
                2 unidades, con perejil, orégano, ajo, tomate, palta, rúcula,
                cebolla, etc.
              </td>
              <td className="fw-bold text-center">TORTILLA DE AVENA</td>
              <td className="small">
                1 huevo - ½ taza de avena - agua o leche necesaria, condimentos.
                Agregar: frutas, queso y/o tomate, huevo.
              </td>
            </tr>
          </tbody>
        </table>

        <div className="plan-footer-info">
          Consultorio — Turnos — Goya (Corrientes)
        </div>
      </div>

      {/* ====================================================================
          HOJA 3: Equivalencias Finales, Recomendaciones y Firma
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
          <tbody>
            <tr>
              <td style={{ width: "20%" }} />
              <td className="text-center small" style={{ width: "40%" }}>
                {/* <img src="/equivalencias/tortilla-papa.jpg" alt="Tortilla de papa" className="img-equivalencia d-block mx-auto mb-1" /> */}
                <div>Tortilla de papa</div>
              </td>
              <td className="text-center small" style={{ width: "40%" }}>
                {/* <img src="/equivalencias/papas-horno.jpg" alt="Batata o papa horneadas" className="img-equivalencia d-block mx-auto mb-1" /> */}
                <div>Batata o papa horneadas</div>
              </td>
            </tr>
            <tr>
              <td className="fw-bold text-center">LEGUMBRES</td>
              <td className="text-center small">1 hamburguesa</td>
              <td className="text-center small">Con vegetales</td>
            </tr>
            <tr className="plan-fila-aviso">
              <td colSpan={3} className="text-center">
                Se sugiere consumir harinas de legumbres
              </td>
            </tr>
            <tr>
              <td className="fw-bold text-center">HUEVO</td>
              <td colSpan={2} className="small">
                2 unidades/día sin contar los utilizados en preparaciones.
              </td>
            </tr>
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
            {listaRecomendaciones.map((rec, idx) => (
              <li key={`rec-${idx}`}>{rec}</li>
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
