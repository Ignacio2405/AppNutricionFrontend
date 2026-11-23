import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CustomInput } from "../ui/CustomInput.jsx";
import { CustomSelect } from "../ui/CustomSelect";
import { CustomButton } from "../ui/CustomButton";
import clientesAxios from "../../config/axios.js";
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

const separarPorComas = (texto) =>
  texto
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

export const EditarHistorial = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
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
  });

  const [pacientesOptions, setPacientesOptions] = useState([]);
  const [cargandoDatos, setCargandoDatos] = useState(true);
  const [errorServer, setErrorServer] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let activo = true;

    const cargarDatos = async () => {
      try {
        setCargandoDatos(true);
        const [resHistorial, resPacientes] = await Promise.all([
          clientesAxios.get(`/historial-medico/${id}`),
          clientesAxios.get("/pacientes"),
        ]);

        if (!activo) return;

        const h = resHistorial.data?.data || resHistorial.data;
        const listaPacientes = Array.isArray(resPacientes.data)
          ? resPacientes.data
          : resPacientes.data.pacientes ||
            resPacientes.data.data ||
            resPacientes.data.docs ||
            [];

        setPacientesOptions(
          listaPacientes.map((p) => ({
            value: p._id,
            label: `${p.apellido}, ${p.nombre} (DNI: ${p.dni})`,
          })),
        );

        const pacId =
          typeof h.pacienteId === "object" ? h.pacienteId?._id : h.pacienteId;

        setFormData({
          pacienteId: pacId || "",
          patologiasTexto: (h.patologiasActuales || []).join(", "),
          alergiasTexto: (h.alergiasIntolerancias || []).join(", "),
          antecedentes: {
            obesidad: Boolean(h.antecedentes?.obesidad),
            diabetes: Boolean(h.antecedentes?.diabetes),
            cardiopatias: Boolean(h.antecedentes?.cardiopatias),
            cancer: Boolean(h.antecedentes?.cancer),
            observaciones: h.antecedentes?.observaciones || "",
          },
          medicamentosSuplementos: h.medicamentosSuplementos?.length
            ? h.medicamentosSuplementos.map((m) => ({
                nombre: m.nombre || "",
                dosis: m.dosis || "",
                frecuencia: m.frecuencia || "",
              }))
            : [{ ...medicamentoVacio }],
          saludDigestiva: {
            acidez: Boolean(h.saludDigestiva?.acidez),
            transitoIntestinal: h.saludDigestiva?.transitoIntestinal || "",
            distension: Boolean(h.saludDigestiva?.distension),
            observaciones: h.saludDigestiva?.observaciones || "",
          },
          observacionesGinecoObstetricas:
            h.observacionesGinecoObstetricas || "",
        });
      } catch (err) {
        if (!activo) return;
        console.error("Error al cargar historial:", err);
        setErrorServer("No se pudo cargar el historial médico.");
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
        patologiasActuales: separarPorComas(formData.patologiasTexto),
        alergiasIntolerancias: separarPorComas(formData.alergiasTexto),
        antecedentes: {
          obesidad: formData.antecedentes.obesidad,
          diabetes: formData.antecedentes.diabetes,
          cardiopatias: formData.antecedentes.cardiopatias,
          cancer: formData.antecedentes.cancer,
          observaciones:
            formData.antecedentes.observaciones.trim() || undefined,
        },
        medicamentosSuplementos: medicamentosLimpios,
        saludDigestiva: {
          acidez: formData.saludDigestiva.acidez,
          transitoIntestinal:
            formData.saludDigestiva.transitoIntestinal.trim() || undefined,
          distension: formData.saludDigestiva.distension,
          observaciones:
            formData.saludDigestiva.observaciones.trim() || undefined,
        },
        observacionesGinecoObstetricas:
          formData.observacionesGinecoObstetricas.trim() || undefined,
      };

      await clientesAxios.put(`/historial-medico/${id}`, payload);
      setSuccessMsg("¡Historial médico actualizado con éxito!");
      window.scrollTo({ top: 0, behavior: "smooth" });
      setTimeout(() => navigate("/historial-medico"), 1500);
    } catch (err) {
      console.error(err);
      setErrorServer(
        err.response?.data?.mensaje ||
          err.response?.data?.error ||
          "Error al actualizar el historial médico.",
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

  return (
    <div className="container py-4" style={{ maxWidth: "860px" }}>
      <div className="card shadow-sm border-0 p-4 rounded-4">
        <h3 className="fw-bold text-success mb-3">Editar Historial Médico</h3>

        {errorServer && (
          <div className="alert alert-danger py-2 small">{errorServer}</div>
        )}
        {successMsg && (
          <div className="alert alert-success py-2 small">{successMsg}</div>
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
              />
            </div>
            <div className="col-md-6">
              <CustomInput
                label="Alergias e Intolerancias (separadas por coma)"
                name="alergiasTexto"
                value={formData.alergiasTexto}
                onChange={handleChange}
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
              />
            </div>
            <div className="col-md-6">
              <CustomInput
                label="Observaciones Digestivas"
                name="observaciones"
                value={formData.saludDigestiva.observaciones}
                onChange={handleDigestivaChange}
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
              Guardar Cambios
            </CustomButton>
          </div>
        </form>
      </div>
    </div>
  );
};
