import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CustomInput } from "../ui/CustomInput.jsx";
import { CustomSelect } from "../ui/CustomSelect";
import { CustomButton } from "../ui/CustomButton";
import clientesAxios from "../../config/axios.js";
import { PARAMETROS_LISTADO_COMPLETO } from "../../utils/paginacion.js";

const toInputDate = (fecha) => {
  if (!fecha) return "";
  const d = new Date(fecha);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().split("T")[0];
};

const extraerId = (campo) => {
  if (!campo) return "";
  if (typeof campo === "object") return String(campo._id || campo.id || "");
  return String(campo);
};

const extraerListaObras = (resData) => {
  if (Array.isArray(resData?.data)) return resData.data;
  if (Array.isArray(resData?.obrasSociales)) return resData.obrasSociales;
  if (Array.isArray(resData)) return resData;
  return [];
};

const obtenerMensajeErrorEspecifico = (err) => {
  const status = err?.response?.status;
  const data = err?.response?.data || err || {};

  const mensajeBackend = String(data.mensaje || "").trim();
  const detalleBackend = String(data.error || "").trim();
  const combinado = `${mensajeBackend} ${detalleBackend}`.toLowerCase();

  const camposDuplicados = Object.keys(data.keyPattern || data.keyValue || {});

  if (
    status === 409 ||
    data.code === 11000 ||
    combinado.includes("11000") ||
    combinado.includes("duplicate") ||
    combinado.includes("duplicad")
  ) {
    if (camposDuplicados.includes("dni") || combinado.includes("dni")) {
      return "Ya existe otro paciente registrado con ese DNI.";
    }
    if (
      camposDuplicados.includes("email") ||
      combinado.includes("email") ||
      combinado.includes("correo")
    ) {
      return "Ya existe otro paciente registrado con ese correo electrónico.";
    }
    return (
      mensajeBackend ||
      "Ya existe otro registro con uno de los datos ingresados (DNI o correo)."
    );
  }

  if (
    detalleBackend &&
    mensajeBackend &&
    !combinado.includes(detalleBackend.toLowerCase())
  ) {
    return `${mensajeBackend}: ${detalleBackend}`;
  }

  return (
    mensajeBackend ||
    detalleBackend ||
    "No se pudieron actualizar los datos del paciente."
  );
};

export const EditarPaciente = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    dni: "",
    email: "",
    fechaNacimiento: "",
    sexo: "",
    ocupacion: "",
    codigoArea: "",
    numeroTelefono: "",
    telefonoTipo: "celular",
    obraSocialId: "",
  });

  const [obrasSociales, setObrasSociales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorServer, setErrorServer] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    let activo = true;

    const cargarDatos = async () => {
      try {
        const [resPaciente, resObras] = await Promise.all([
          clientesAxios.get(`/pacientes/${id}`),
          clientesAxios
            .get("/obraSocial", { params: PARAMETROS_LISTADO_COMPLETO })
            .catch(() => ({ data: { data: [] } })),
        ]);

        if (!activo) return;

        const listaObras = extraerListaObras(resObras?.data);
        const opcionesObras = listaObras.map((os) => ({
          value: String(os._id),
          label: os.razonSocial || os.nombre || "Sin nombre",
        }));

        const pac = resPaciente?.data?.data || resPaciente?.data || null;
        const obraActualId = extraerId(pac?.obraSocial);

        if (
          obraActualId &&
          !opcionesObras.some((op) => op.value === obraActualId)
        ) {
          const nombreActual =
            typeof pac?.obraSocial === "object"
              ? pac.obraSocial.razonSocial || "Obra social actual"
              : "Obra social actual";
          opcionesObras.unshift({ value: obraActualId, label: nombreActual });
        }

        setObrasSociales(opcionesObras);

        if (pac) {
          setFormData({
            nombre: pac.nombre || "",
            apellido: pac.apellido || "",
            dni: pac.dni || "",
            email: pac.email || "",
            fechaNacimiento: toInputDate(pac.fechaNacimiento),
            sexo: pac.sexo || "",
            ocupacion: pac.ocupacion || "",
            codigoArea: pac.telefono?.codigoArea || "",
            numeroTelefono: pac.telefono?.numero || "",
            telefonoTipo: pac.telefono?.tipo || "celular",
            obraSocialId: obraActualId,
          });
        } else {
          setErrorServer("Paciente no encontrado.");
        }
      } catch (err) {
        if (!activo) return;
        console.error("Error al cargar paciente para editar:", err);
        setErrorServer(obtenerMensajeErrorEspecifico(err));
      } finally {
        if (activo) setLoading(false);
      }
    };

    if (id) cargarDatos();
    return () => {
      activo = false;
    };
  }, [id]);

  const handleChange = (e) => {
    setErrorServer("");
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorServer("");
    setSuccessMsg("");
    setSubmitting(true);

    try {
      const payload = {
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        dni: formData.dni.trim(),
        email: formData.email.trim().toLowerCase(),
        fechaNacimiento: formData.fechaNacimiento
          ? new Date(formData.fechaNacimiento)
          : undefined,
        sexo: formData.sexo || undefined,
        ocupacion: formData.ocupacion.trim() || undefined,
        telefono: {
          tipo: formData.telefonoTipo,
          codigoArea: formData.codigoArea.trim(),
          numero: formData.numeroTelefono.trim(),
        },
        obraSocial: formData.obraSocialId || null,
      };

      await clientesAxios.put(`/pacientes/${id}`, payload);
      setSuccessMsg("¡Paciente actualizado con éxito!");
      window.scrollTo({ top: 0, behavior: "smooth" });
      setTimeout(() => navigate("/customers"), 1500);
    } catch (err) {
      console.error("Error al actualizar paciente:", err);
      setErrorServer(obtenerMensajeErrorEspecifico(err));
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-4" style={{ maxWidth: "750px" }}>
        <div className="card shadow-sm border-0 p-4 rounded-4 text-center">
          <div className="spinner-border text-success mx-auto" role="status" />
          <p className="text-muted mt-2 mb-0">Cargando paciente...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4" style={{ maxWidth: "750px" }}>
      <div className="card shadow-sm border-0 p-4 rounded-4">
        <h3 className="fw-bold text-success mb-3">Editar Paciente</h3>

        {errorServer && (
          <div className="alert alert-danger py-2 small" role="alert">
            {errorServer}
          </div>
        )}
        {successMsg && (
          <div className="alert alert-success py-2 small" role="alert">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6">
              <CustomInput
                label="Nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-6">
              <CustomInput
                label="Apellido"
                name="apellido"
                value={formData.apellido}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="row">
            <div className="col-md-4">
              <CustomInput
                label="DNI"
                name="dni"
                placeholder="7 u 8 dígitos"
                value={formData.dni}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-4">
              <CustomInput
                label="Fecha de Nacimiento"
                name="fechaNacimiento"
                type="date"
                value={formData.fechaNacimiento}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-4">
              <CustomSelect
                label="Sexo"
                id="sexo"
                name="sexo"
                value={formData.sexo}
                onChange={handleChange}
                options={[
                  { value: "M", label: "Masculino" },
                  { value: "F", label: "Femenino" },
                ]}
              />
            </div>
          </div>

          <div className="row">
            <div className="col-md-6">
              <CustomInput
                label="Correo Electrónico"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-6">
              <CustomInput
                label="Ocupación"
                name="ocupacion"
                value={formData.ocupacion}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="row border-top pt-3 mt-2">
            <h6 className="text-secondary fw-semibold mb-3">
              Información de Contacto
            </h6>
            <div className="col-md-3">
              <CustomSelect
                label="Tipo de Teléfono"
                id="telefonoTipo"
                name="telefonoTipo"
                value={formData.telefonoTipo}
                onChange={handleChange}
                options={[
                  { value: "celular", label: "Celular" },
                  { value: "fijo", label: "Fijo" },
                  { value: "casa", label: "Casa" },
                  { value: "trabajo", label: "Trabajo" },
                ]}
              />
            </div>
            <div className="col-md-3">
              <CustomInput
                label="Cód. Área"
                name="codigoArea"
                placeholder="Ej: 3794"
                value={formData.codigoArea}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-6">
              <CustomInput
                label="Número"
                name="numeroTelefono"
                placeholder="Ej: 123456"
                value={formData.numeroTelefono}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="row border-top pt-3 mt-2">
            <div className="col-md-12">
              <CustomSelect
                label="Obra Social (Opcional)"
                id="obraSocialId"
                name="obraSocialId"
                value={formData.obraSocialId}
                onChange={handleChange}
                options={obrasSociales}
              />
            </div>
          </div>

          <div className="d-flex justify-content-end gap-2 mt-4">
            <CustomButton
              type="button"
              variant="secondary"
              onClick={() => navigate("/customers")}
            >
              Cancelar
            </CustomButton>
            <CustomButton type="submit" loading={submitting}>
              Actualizar Paciente
            </CustomButton>
          </div>
        </form>
      </div>
    </div>
  );
};
