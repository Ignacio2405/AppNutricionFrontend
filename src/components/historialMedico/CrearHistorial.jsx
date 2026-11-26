import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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

const estadoInicial = {
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
  texto
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

export const CrearHistorial = () => {
  const [formData, setFormData] = useState(estadoInicial);
  const [pacientesOptions, setPacientesOptions] = useState([]);
  const [errorServer, setErrorServer] = useState("");
  const [requiereConsulta, setRequiereConsulta] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let activo = true;

    const fetchPacientes = async () => {
      try {
        const { data } = await clientesAxios.get("/pacientes", {
          params: PARAMETROS_LISTADO_COMPLETO,
        });
        if (!activo) return;
        const lista = Array.isArray(data)
          ? data
          : data.pacientes || data.data || data.docs || [];
        const opciones = lista.map((p) => ({
          value: p._id,
          label: `${p.apellido}, ${p.nombre} (DNI: ${p.dni})`,
        }));
        setPacientesOptions(opciones);
      } catch (err) {
        console.error("Error al cargar pacientes:", err);
      }
    };

    fetchPacientes();
    return () => {
      activo = false;
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setErrorServer("");
    setRequiereConsulta(false);
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
    setFormData((prev) => {
      const actualizados = prev.medicamentosSuplementos.map((med, idx) =>
        idx === index ? { ...med, [campo]: valor } : med,
      );
      return { ...prev, medicamentosSuplementos: actualizados };
    });
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
    setRequiereConsulta(false);
    setSuccessMsg("");

    if (!formData.pacienteId) {
      setErrorServer("Seleccioná un paciente antes de guardar.");
      return;
    }

    setLoading(true);

    try {
      const medicamentosLimpios = formData.medicamentosSuplementos
        .map((m) => ({
          nombre: m.nombre.trim(),
          dosis: m.dosis.trim() || undefined,
          frecuencia: m.frecuencia.trim() || undefined,
        }))
        .filter((m) => m.nombre);

      const payload = {
        pacienteId: formData.pacienteId,
        patologiasActuales: separarPorComas(formData.patologiasTexto),
        alergiasIntolerancias: separarPorComas(formData.alergiasTexto),
        antecedentes: {
          obesidad: Boolean(formData.antecedentes.obesidad),
          diabetes: Boolean(formData.antecedentes.diabetes),
          cardiopatias: Boolean(formData.antecedentes.cardiopatias),
          cancer: Boolean(formData.antecedentes.cancer),
          observaciones: formData.antecedentes.observaciones.trim(),
        },
        medicamentosSuplementos: medicamentosLimpios,
        saludDigestiva: {
          acidez: Boolean(formData.saludDigestiva.acidez),
          transitoIntestinal: formData.saludDigestiva.transitoIntestinal.trim(),
          distension: Boolean(formData.saludDigestiva.distension),
          observaciones: formData.saludDigestiva.observaciones.trim(),
        },
        observacionesGinecoObstetricas:
          formData.observacionesGinecoObstetricas.trim(),
      };

      await clientesAxios.post("/historial-medico", payload);
      setSuccessMsg("¡Historial médico registrado con éxito!");
      setTimeout(() => navigate("/historial-medico"), 1500);
    } catch (err) {
      console.error("Error al crear historial:", err?.response?.data || err);
      const dataError = err?.response?.data || err || {};
      const mensaje = dataError.mensaje;
      const detalle = dataError.error;
      const textoError =
        detalle && mensaje
          ? `${mensaje}: ${detalle}`
          : mensaje || detalle || "Error al registrar el historial médico.";

      setErrorServer(textoError);
      setRequiereConsulta(textoError.toLowerCase().includes("consulta médica"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4" style={{ maxWidth: "860px" }}>
      <div className="card shadow-sm border-0 p-4 rounded-4">
        <h3 className="fw-bold text-success mb-3">
          Registrar Historial Médico
        </h3>

        {errorServer && (
          <div className="alert alert-danger py-2 small" role="alert">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
              <span>{errorServer}</span>
              {requiereConsulta && (
                <CustomButton
                  type="button"
                  variant="outline-danger"
                  onClick={() => navigate("/consulta/nueva")}
                >
                  Crear consulta médica
                </CustomButton>
              )}
            </div>
          </div>
        )}
        {successMsg && (
          <div className="alert alert-success py-2 small" role="alert">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <h6 className="fw-semibold text-secondary mb-3">
            Paciente y Condiciones Generales
          </h6>
          <div className="row">
            <div className="col-md-12">
              <CustomSelect
                label="Paciente"
                id="pacienteId"
                name="pacienteId"
                value={formData.pacienteId}
                onChange={handleChange}
                options={pacientesOptions}
                required
              />
            </div>
          </div>

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
            idPrefix="crear-med"
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
              onClick={() => navigate(-1)}
            >
              Cancelar
            </CustomButton>
            <CustomButton type="submit" loading={loading}>
              Guardar Historial
            </CustomButton>
          </div>
        </form>
      </div>
    </div>
  );
};
