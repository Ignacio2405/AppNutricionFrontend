import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CustomInput } from "../ui/CustomInput.jsx";
import { CustomSelect } from "../ui/CustomSelect";
import { CustomButton } from "../ui/CustomButton";
import clientesAxios from "../../config/axios.js";
import { PARAMETROS_LISTADO_COMPLETO } from "../../utils/paginacion.js";
import { CustomCheckboxGroup } from "../ui/CustomCheckboxGroup";
import { MedicamentosFormList } from "./MedicamentosFormList";

const OPCIONES_ANTECEDENTES = [
  { name: "obesidad", label: "Obesidad" },
  { name: "diabetes", label: "Diabetes" },
  { name: "cardiopatias", label: "Cardiopatías" },
  { name: "cancer", label: "Cáncer" },
];

const OPCIONES_SALUD_DIGESTIVA = [
  { name: "acidez", label: "Acidez" },
  { name: "distension", label: "Distensión" },
];

const medicamentoVacio = { nombre: "", dosis: "", frecuencia: "" };

const estadoFormularioVacio = {
  pacienteId: "",
  patologiasTexto: "",
  alergiasTexto: "",
  antecedentes: {
    obesidad: false,
    diabetes: false,
    cardiopatias: false,
    cancer: false,
    observaciones: "",
  },
  medicamentosSuplementos: [{ ...medicamentoVacio }],
  saludDigestiva: {
    acidez: false,
    transitoIntestinal: "",
    distension: false,
    observaciones: "",
  },
  observacionesGinecoObstetricas: "",
};

const separarPorComas = (texto) =>
  String(texto || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const extraerListaPacientes = (raw) => {
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw?.pacientes)) return raw.pacientes;
  if (Array.isArray(raw?.data)) return raw.data;
  if (Array.isArray(raw?.data?.pacientes)) return raw.data.pacientes;
  if (Array.isArray(raw?.docs)) return raw.docs;
  return [];
};

export const EditarHistorial = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState(estadoFormularioVacio);
  const [pacientesOptions, setPacientesOptions] = useState([]);
  const [cargandoDatos, setCargandoDatos] = useState(Boolean(id));
  const [errorServer, setErrorServer] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;

    let activo = true;

    const cargarDatos = async () => {
      try {
        const [resHistorial, resPacientes] = await Promise.all([
          clientesAxios.get(`/historial-medico/${id}`),
          clientesAxios.get("/pacientes", {
            params: PARAMETROS_LISTADO_COMPLETO,
          }),
        ]);

        if (!activo) return;

        const h =
          resHistorial.data?.data ||
          resHistorial.data?.historial ||
          resHistorial.data;

        const listaPacientes = extraerListaPacientes(resPacientes.data);
        setPacientesOptions(
          listaPacientes.map((p) => ({
            value: p._id || p.id,
            label:
              `${p.apellido || ""}, ${p.nombre || ""}${p.dni ? ` (DNI: ${p.dni})` : ""}`.trim(),
          })),
        );

        const pacId =
          typeof h?.pacienteId === "object"
            ? h.pacienteId?._id || h.pacienteId?.id
            : h?.pacienteId;

        setFormData({
          pacienteId: pacId ? String(pacId) : "",
          patologiasTexto: Array.isArray(h?.patologiasActuales)
            ? h.patologiasActuales.join(", ")
            : "",
          alergiasTexto: Array.isArray(h?.alergiasIntolerancias)
            ? h.alergiasIntolerancias.join(", ")
            : "",
          antecedentes: {
            obesidad: Boolean(h?.antecedentes?.obesidad),
            diabetes: Boolean(h?.antecedentes?.diabetes),
            cardiopatias: Boolean(h?.antecedentes?.cardiopatias),
            cancer: Boolean(h?.antecedentes?.cancer),
            observaciones: h?.antecedentes?.observaciones || "",
          },
          medicamentosSuplementos:
            Array.isArray(h?.medicamentosSuplementos) &&
            h.medicamentosSuplementos.length > 0
              ? h.medicamentosSuplementos.map((m) => ({
                  nombre: m.nombre || "",
                  dosis: m.dosis || "",
                  frecuencia: m.frecuencia || "",
                }))
              : [{ ...medicamentoVacio }],
          saludDigestiva: {
            acidez: Boolean(h?.saludDigestiva?.acidez),
            transitoIntestinal: h?.saludDigestiva?.transitoIntestinal || "",
            distension: Boolean(h?.saludDigestiva?.distension),
            observaciones: h?.saludDigestiva?.observaciones || "",
          },
          observacionesGinecoObstetricas:
            h?.observacionesGinecoObstetricas || "",
        });
        setErrorServer("");
      } catch (err) {
        if (!activo) return;
        console.error("Error al cargar historial:", err);
        setErrorServer(
          err.response?.data?.mensaje ||
            "No se pudo cargar el historial médico.",
        );
      } finally {
        if (activo) setCargandoDatos(false);
      }
    };

    cargarDatos();

    return () => {
      activo = false;
    };
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAntecedenteChange = (e) => {
    const { name, type, checked, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      antecedentes: {
        ...prev.antecedentes,
        [name]: type === "checkbox" ? checked : value,
      },
    }));
  };

  const handleDigestivaChange = (e) => {
    const { name, type, checked, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      saludDigestiva: {
        ...prev.saludDigestiva,
        [name]: type === "checkbox" ? checked : value,
      },
    }));
  };

  const handleMedicamentoChange = (index, campo, valor) => {
    setFormData((prev) => ({
      ...prev,
      medicamentosSuplementos: prev.medicamentosSuplementos.map((med, idx) =>
        idx === index ? { ...med, [campo]: valor } : med,
      ),
    }));
  };

  const agregarMedicamento = () => {
    setFormData((prev) => ({
      ...prev,
      medicamentosSuplementos: [
        ...prev.medicamentosSuplementos,
        { ...medicamentoVacio },
      ],
    }));
  };

  const quitarMedicamento = (index) => {
    setFormData((prev) => {
      if (prev.medicamentosSuplementos.length === 1) {
        return { ...prev, medicamentosSuplementos: [{ ...medicamentoVacio }] };
      }
      return {
        ...prev,
        medicamentosSuplementos: prev.medicamentosSuplementos.filter(
          (_, idx) => idx !== index,
        ),
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorServer("");
    setSuccessMsg("");

    if (!id) {
      setErrorServer("ID de historial médico no válido.");
      return;
    }

    setLoading(true);

    try {
      const medicamentosLimpios = formData.medicamentosSuplementos
        .map((m) => ({
          nombre: String(m.nombre || "").trim(),
          dosis: String(m.dosis || "").trim(),
          frecuencia: String(m.frecuencia || "").trim(),
        }))
        .filter((m) => m.nombre);

      const payload = {
        patologiasActuales: separarPorComas(formData.patologiasTexto),
        alergiasIntolerancias: separarPorComas(formData.alergiasTexto),
        antecedentes: {
          obesidad: Boolean(formData.antecedentes.obesidad),
          diabetes: Boolean(formData.antecedentes.diabetes),
          cardiopatias: Boolean(formData.antecedentes.cardiopatias),
          cancer: Boolean(formData.antecedentes.cancer),
          observaciones: String(
            formData.antecedentes.observaciones || "",
          ).trim(),
        },
        medicamentosSuplementos: medicamentosLimpios,
        saludDigestiva: {
          acidez: Boolean(formData.saludDigestiva.acidez),
          transitoIntestinal: String(
            formData.saludDigestiva.transitoIntestinal || "",
          ).trim(),
          distension: Boolean(formData.saludDigestiva.distension),
          observaciones: String(
            formData.saludDigestiva.observaciones || "",
          ).trim(),
        },
        observacionesGinecoObstetricas: String(
          formData.observacionesGinecoObstetricas || "",
        ).trim(),
      };

      await clientesAxios.put(`/historial-medico/${id}`, payload);
      setSuccessMsg("¡Historial médico actualizado con éxito!");
      window.scrollTo({ top: 0, behavior: "smooth" });
      setTimeout(() => navigate(`/historial-medico/${id}`), 1500);
    } catch (err) {
      console.error("Error al actualizar historial:", err);
      const mensaje = err.response?.data?.mensaje;
      const detalle = err.response?.data?.error;
      setErrorServer(
        detalle && mensaje
          ? `${mensaje}: ${detalle}`
          : mensaje || detalle || "Error al actualizar el historial médico.",
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setLoading(false);
    }
  };

  if (cargandoDatos) {
    return (
      <div className="container py-4">
        <p className="text-muted">Cargando datos del historial médico...</p>
      </div>
    );
  }

  const errorVisible =
    errorServer || (!id ? "ID de historial médico no válido." : "");

  return (
    <div className="container py-4" style={{ maxWidth: "860px" }}>
      <div className="card shadow-sm border-0 p-4 rounded-4">
        <h3 className="fw-bold text-success mb-3">Editar Historial Médico</h3>

        {errorVisible && (
          <div className="alert alert-danger py-2 small" role="alert">
            {errorVisible}
          </div>
        )}
        {successMsg && (
          <div className="alert alert-success py-2 small" role="alert">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <CustomSelect
            label="Paciente"
            id="pacienteId"
            name="pacienteId"
            value={formData.pacienteId}
            options={pacientesOptions}
            disabled
          />

          <div className="row">
            <div className="col-md-6">
              <CustomInput
                label="Patologías Actuales (separadas por coma)"
                name="patologiasTexto"
                value={formData.patologiasTexto}
                onChange={handleChange}
                placeholder="Ej. Hipertensión, Diabetes, Hipotiroidismo"
              />
            </div>
            <div className="col-md-6">
              <CustomInput
                label="Alergias e Intolerancias (separadas por coma)"
                name="alergiasTexto"
                value={formData.alergiasTexto}
                onChange={handleChange}
                placeholder="Ej. Intolerancia a la lactosa, Frutos secos"
              />
            </div>
          </div>

          <hr className="my-3" />
          <h6 className="fw-semibold text-secondary mb-3">Antecedentes</h6>
          <CustomCheckboxGroup
            idPrefix="ant"
            items={OPCIONES_ANTECEDENTES}
            values={formData.antecedentes}
            onChange={handleAntecedenteChange}
          />
          <CustomInput
            label="Observaciones de Antecedentes"
            name="observaciones"
            value={formData.antecedentes.observaciones}
            onChange={handleAntecedenteChange}
            placeholder="Antecedentes familiares o detalles adicionales..."
          />

          <hr className="my-3" />
          <MedicamentosFormList
            idPrefix="editar-med"
            items={formData.medicamentosSuplementos}
            onItemChange={handleMedicamentoChange}
            onAdd={agregarMedicamento}
            onRemove={quitarMedicamento}
          />

          <hr className="my-3" />
          <h6 className="fw-semibold text-secondary mb-3">Salud Digestiva</h6>
          <CustomCheckboxGroup
            idPrefix="dig"
            items={OPCIONES_SALUD_DIGESTIVA}
            values={formData.saludDigestiva}
            onChange={handleDigestivaChange}
          />
          <div className="row">
            <div className="col-md-6">
              <CustomInput
                label="Tránsito Intestinal"
                name="transitoIntestinal"
                value={formData.saludDigestiva.transitoIntestinal}
                onChange={handleDigestivaChange}
                placeholder="Ej. Regular diario, estreñimiento..."
              />
            </div>
            <div className="col-md-6">
              <CustomInput
                label="Observaciones Digestivas"
                name="observaciones"
                value={formData.saludDigestiva.observaciones}
                onChange={handleDigestivaChange}
                placeholder="Síntomas o detalles digestivos..."
              />
            </div>
          </div>

          <hr className="my-3" />
          <h6 className="fw-semibold text-secondary mb-3">
            Observaciones Gineco-Obstétricas
          </h6>
          <CustomInput
            label="Observaciones Gineco-Obstétricas (si aplica)"
            name="observacionesGinecoObstetricas"
            value={formData.observacionesGinecoObstetricas}
            onChange={handleChange}
            placeholder="Ciclos, embarazos, lactancia u otras notas..."
          />

          <div className="d-flex justify-content-end gap-2 mt-4">
            <CustomButton
              type="button"
              variant="secondary"
              onClick={() => navigate("/historial-medico")}
            >
              Cancelar
            </CustomButton>
            <CustomButton type="submit" loading={loading}>
              Guardar Cambios
            </CustomButton>
          </div>
        </form>
      </div>
    </div>
  );
};
