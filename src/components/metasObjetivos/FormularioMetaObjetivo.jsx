import { useEffect, useMemo, useState } from "react";
import clientesAxios from "../../config/axios.js";
import { CustomInput } from "../ui/CustomInput.jsx";
import { CustomSelect } from "../ui/CustomSelect.jsx";
import { CustomButton } from "../ui/CustomButton.jsx";

const toInputDate = (valor) => {
  if (!valor) return "";
  const d = new Date(valor);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().split("T")[0];
};

const extraerId = (campo) => {
  if (!campo) return "";
  return typeof campo === "object" ? campo._id || "" : campo;
};

const registroVacio = () => ({
  date: toInputDate(new Date()),
  completed: "",
});

const objetivoVacio = () => ({
  description: "",
  frecuenciaEsperada: "diaria",
  status: "activo",
  registro: [registroVacio()],
});

export const FormularioMetaObjetivo = ({
  tituloFormulario = "Registrar Metas y Objetivos",
  initialData = null,
  onSubmit,
  onCancel,
  submitting = false,
  submitLabel = "Guardar Metas",
}) => {
  const [pacientes, setPacientes] = useState([]);
  const [consultas, setConsultas] = useState([]);

  const [pacienteId, setPacienteId] = useState(() =>
    extraerId(initialData?.pacienteId),
  );
  const [consultaId, setConsultaId] = useState(() =>
    extraerId(initialData?.consultaId),
  );

  const [objetivos, setObjetivos] = useState(() =>
    Array.isArray(initialData?.objetivos) && initialData.objetivos.length > 0
      ? initialData.objetivos.map((obj) => ({
          description: obj.description || "",
          frecuenciaEsperada: obj.frecuenciaEsperada || "diaria",
          status: obj.status || "activo",
          registro:
            Array.isArray(obj.registro) && obj.registro.length > 0
              ? obj.registro.map((reg) => ({
                  date: toInputDate(reg.date) || toInputDate(new Date()),
                  completed:
                    reg.completed !== undefined && reg.completed !== null
                      ? String(reg.completed)
                      : "",
                }))
              : [registroVacio()],
        }))
      : [objetivoVacio()],
  );

  const [errorLocal, setErrorLocal] = useState("");

  useEffect(() => {
    let activo = true;

    const cargarCatalogos = async () => {
      try {
        const [resPac, resCons] = await Promise.all([
          clientesAxios.get("/pacientes"),
          clientesAxios.get("/consulta").catch(() => ({ data: [] })),
        ]);
        if (!activo) return;

        const listaPac = Array.isArray(resPac.data?.data)
          ? resPac.data.data
          : Array.isArray(resPac.data)
            ? resPac.data
            : [];
        const listaCons = Array.isArray(resCons.data?.data)
          ? resCons.data.data
          : Array.isArray(resCons.data)
            ? resCons.data
            : [];

        setPacientes(listaPac);
        setConsultas(listaCons);
      } catch {
        // Continúa si falla algún catálogo
      }
    };

    cargarCatalogos();
    return () => {
      activo = false;
    };
  }, []);

  const opcionesPacientes = useMemo(
    () =>
      pacientes.map((pac) => ({
        value: pac._id,
        label: `${`${pac.nombre || ""} ${pac.apellido || ""}`.trim()}${
          pac.dni ? ` (DNI ${pac.dni})` : ""
        }`,
      })),
    [pacientes],
  );

  const opcionesConsultas = useMemo(() => {
    const filtradas = pacienteId
      ? consultas.filter((c) => {
          const idConsPac = extraerId(c.paciente || c.pacienteId);
          return !idConsPac || String(idConsPac) === String(pacienteId);
        })
      : consultas;

    return filtradas.map((cons) => {
      const fecha = cons.fecha ? toInputDate(cons.fecha) : "";
      const detalle =
        cons.motivo || cons.observaciones || cons.diagnostico || "Consulta";
      return {
        value: cons._id,
        label: fecha ? `${fecha} - ${detalle}` : detalle,
      };
    });
  }, [consultas, pacienteId]);

  const handleObjetivoChange = (idx, campo, valor) => {
    setObjetivos((prev) =>
      prev.map((obj, i) => (i === idx ? { ...obj, [campo]: valor } : obj)),
    );
  };

  const agregarObjetivo = () => {
    setObjetivos((prev) => [...prev, objetivoVacio()]);
  };

  const quitarObjetivo = (idx) => {
    setObjetivos((prev) =>
      prev.length > 1 ? prev.filter((_, i) => i !== idx) : [objetivoVacio()],
    );
  };

  const handleRegistroChange = (objIdx, regIdx, campo, valor) => {
    setObjetivos((prev) =>
      prev.map((obj, i) => {
        if (i !== objIdx) return obj;
        const nuevosRegistros = (obj.registro || []).map((reg, rIdx) =>
          rIdx === regIdx ? { ...reg, [campo]: valor } : reg,
        );
        return { ...obj, registro: nuevosRegistros };
      }),
    );
  };

  const agregarRegistro = (objIdx) => {
    setObjetivos((prev) =>
      prev.map((obj, i) =>
        i === objIdx
          ? { ...obj, registro: [...(obj.registro || []), registroVacio()] }
          : obj,
      ),
    );
  };

  const quitarRegistro = (objIdx, regIdx) => {
    setObjetivos((prev) =>
      prev.map((obj, i) => {
        if (i !== objIdx) return obj;
        const actual = obj.registro || [];
        return {
          ...obj,
          registro:
            actual.length > 1
              ? actual.filter((_, rIdx) => rIdx !== regIdx)
              : [registroVacio()],
        };
      }),
    );
  };

  const normalizarCompleted = (valor) => {
    const limpio = String(valor ?? "")
      .trim()
      .toLowerCase();
    if (!limpio) return false;
    if (limpio === "true" || limpio === "si" || limpio === "sí") return true;
    if (limpio === "false" || limpio === "no") return false;
    const sinPorcentaje = limpio.replace("%", "").trim();
    const num = Number(sinPorcentaje);
    if (!Number.isNaN(num)) return num;
    return limpio;
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setErrorLocal("");

    if (!pacienteId) {
      setErrorLocal("Seleccioná un paciente.");
      return;
    }

    const objetivosValidos = objetivos
      .filter((o) => o.description.trim())
      .map((o) => {
        const registrosValidos = (o.registro || [])
          .filter((r) => r.date || String(r.completed).trim() !== "")
          .map((r) => ({
            date: r.date ? new Date(r.date) : new Date(),
            completed: normalizarCompleted(r.completed),
          }));

        return {
          description: o.description.trim(),
          frecuenciaEsperada: o.frecuenciaEsperada,
          status: o.status,
          registro: registrosValidos,
        };
      });

    if (objetivosValidos.length === 0) {
      setErrorLocal("Ingresá al menos un objetivo con su descripción.");
      return;
    }

    onSubmit({
      pacienteId,
      consultaId: consultaId || null,
      objetivos: objetivosValidos,
    });
  };

  return (
    <div className="container py-4">
      <div className="card shadow-sm border-0 p-4 rounded-4">
        <h3 className="fw-bold text-success mb-4">{tituloFormulario}</h3>

        {errorLocal && (
          <div className="alert alert-danger py-2 small mb-3">{errorLocal}</div>
        )}

        <form onSubmit={handleFormSubmit}>
          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <CustomSelect
                id="pacienteId"
                name="pacienteId"
                label="Paciente *"
                value={pacienteId}
                onChange={(e) => setPacienteId(e.target.value)}
                options={opcionesPacientes}
                required
              />
            </div>

            <div className="col-md-6">
              <CustomSelect
                id="consultaId"
                name="consultaId"
                label="Consulta donde se pautaron (opcional)"
                value={consultaId}
                onChange={(e) => setConsultaId(e.target.value)}
                options={opcionesConsultas}
                placeholder="Seleccionar consulta..."
              />
            </div>
          </div>

          <hr className="my-4" />

          <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
            <h6 className="fw-semibold text-secondary m-0">Objetivos</h6>
            <CustomButton
              type="button"
              variant="outline-success"
              onClick={agregarObjetivo}
            >
              + Agregar Objetivo
            </CustomButton>
          </div>

          {objetivos.map((obj, objIdx) => (
            <div
              className="border rounded-3 p-3 mb-3 bg-light"
              key={`obj-${objIdx}`}
            >
              <div className="row g-3 align-items-end">
                <div className="col-md-6">
                  <CustomInput
                    id={`desc-${objIdx}`}
                    label={`Descripción del objetivo #${objIdx + 1} *`}
                    placeholder='Ej: "Tomar 2L de agua diarios", "Caminar 30 min"...'
                    value={obj.description}
                    onChange={(e) =>
                      handleObjetivoChange(
                        objIdx,
                        "description",
                        e.target.value,
                      )
                    }
                    required
                  />
                </div>

                <div className="col-md-3">
                  <CustomSelect
                    id={`frecuencia-${objIdx}`}
                    name={`frecuencia-${objIdx}`}
                    label="Frecuencia esperada"
                    value={obj.frecuenciaEsperada}
                    onChange={(e) =>
                      handleObjetivoChange(
                        objIdx,
                        "frecuenciaEsperada",
                        e.target.value,
                      )
                    }
                    options={[
                      { value: "diaria", label: "Diaria" },
                      { value: "semanal", label: "Semanal" },
                    ]}
                  />
                </div>

                <div className="col-md-3">
                  <CustomSelect
                    id={`status-${objIdx}`}
                    name={`status-${objIdx}`}
                    label="Estado"
                    value={obj.status}
                    onChange={(e) =>
                      handleObjetivoChange(objIdx, "status", e.target.value)
                    }
                    options={[
                      { value: "activo", label: "Activo" },
                      { value: "cumplido", label: "Cumplido" },
                      { value: "pausado", label: "Pausado" },
                    ]}
                  />
                </div>
              </div>

              {/* Registros de control / cumplimiento */}
              <div className="mt-3 pt-2 border-top">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="small fw-semibold text-secondary">
                    Registros de cumplimiento / control
                  </span>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => agregarRegistro(objIdx)}
                  >
                    + Registro
                  </button>
                </div>

                {(obj.registro || []).map((reg, regIdx) => (
                  <div
                    className="row g-2 align-items-end mb-2"
                    key={`reg-${objIdx}-${regIdx}`}
                  >
                    <div className="col-sm-5">
                      <CustomInput
                        id={`reg-fecha-${objIdx}-${regIdx}`}
                        label="Fecha de control"
                        type="date"
                        value={reg.date}
                        onChange={(e) =>
                          handleRegistroChange(
                            objIdx,
                            regIdx,
                            "date",
                            e.target.value,
                          )
                        }
                        className="mb-1"
                      />
                    </div>
                    <div className="col-sm-5">
                      <CustomInput
                        id={`reg-comp-${objIdx}-${regIdx}`}
                        label="Cumplido / % Logro"
                        placeholder="Ej: 80, true, false o 100%"
                        value={reg.completed}
                        onChange={(e) =>
                          handleRegistroChange(
                            objIdx,
                            regIdx,
                            "completed",
                            e.target.value,
                          )
                        }
                        className="mb-1"
                      />
                    </div>
                    <div className="col-sm-2 mb-1">
                      <CustomButton
                        type="button"
                        variant="outline-danger"
                        fullWidth
                        onClick={() => quitarRegistro(objIdx, regIdx)}
                      >
                        ✕
                      </CustomButton>
                    </div>
                  </div>
                ))}
              </div>

              <div className="d-flex justify-content-end mt-2">
                <CustomButton
                  type="button"
                  variant="outline-danger"
                  onClick={() => quitarObjetivo(objIdx)}
                >
                  Quitar objetivo
                </CustomButton>
              </div>
            </div>
          ))}

          <div className="d-flex justify-content-end gap-2 mt-4">
            {onCancel && (
              <CustomButton
                type="button"
                variant="secondary"
                onClick={onCancel}
              >
                Cancelar
              </CustomButton>
            )}
            <CustomButton type="submit" loading={submitting}>
              {submitLabel}
            </CustomButton>
          </div>
        </form>
      </div>
    </div>
  );
};
