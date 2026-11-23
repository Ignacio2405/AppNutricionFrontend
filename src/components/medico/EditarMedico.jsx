import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CustomInput } from "../ui/CustomInput.jsx";
import { CustomSelect } from "../ui/CustomSelect.jsx";
import { CustomButton } from "../ui/CustomButton.jsx";
import clientesAxios from "../../config/axios.js";

const extraerPrimeraObraSocialId = (obraSocial) => {
  if (!obraSocial) return "";
  if (Array.isArray(obraSocial)) {
    const primero = obraSocial[0];
    return typeof primero === "object" ? primero?._id || "" : primero || "";
  }
  return typeof obraSocial === "object" ? obraSocial?._id || "" : obraSocial;
};

export const EditarMedico = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    dni: "",
    email: "",
    telefonoTipo: "celular",
    codigoArea: "",
    numeroTelefono: "",
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
        const [resMedico, resObras] = await Promise.all([
          clientesAxios.get(`/medicos/${id}`),
          clientesAxios
            .get("/obraSocial")
            .catch(() => ({ data: { data: [] } })),
        ]);

        if (!activo) return;

        const listaObras = Array.isArray(resObras?.data?.data)
          ? resObras.data.data
          : Array.isArray(resObras?.data?.obrasSociales)
            ? resObras.data.obrasSociales
            : Array.isArray(resObras?.data)
              ? resObras.data
              : [];

        setObrasSociales(
          listaObras.map((os) => ({
            value: os._id,
            label: os.razonSocial,
          })),
        );

        const med = resMedico?.data?.data || null;
        if (med) {
          setFormData({
            nombre: med.nombre || "",
            apellido: med.apellido || "",
            dni: med.dni || "",
            email: med.email || "",
            telefonoTipo: med.telefono?.tipo || "celular",
            codigoArea: med.telefono?.codigoArea || "",
            numeroTelefono: med.telefono?.numero || "",
            obraSocialId: extraerPrimeraObraSocialId(med.obraSocial),
          });
        } else {
          setErrorServer("Médico no encontrado.");
        }
      } catch (err) {
        if (!activo) return;
        console.error("Error al cargar médico:", err);
        setErrorServer(
          err.response?.data?.mensaje ||
            "No se pudieron cargar los datos del médico.",
        );
      } finally {
        if (activo) setLoading(false);
      }
    };

    cargarDatos();
    return () => {
      activo = false;
    };
  }, [id]);

  const handleChange = (e) => {
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
        telefono: {
          tipo: formData.telefonoTipo,
          codigoArea: formData.codigoArea.trim(),
          numero: formData.numeroTelefono.trim(),
        },
        obraSocial: formData.obraSocialId ? [formData.obraSocialId] : [],
      };

      await clientesAxios.put(`/medicos/${id}`, payload);
      setSuccessMsg("¡Médico actualizado con éxito!");
      setTimeout(() => navigate("/medicos"), 1200);
    } catch (err) {
      console.error("Error al actualizar médico:", err);
      setErrorServer(
        err.response?.data?.mensaje ||
          err.response?.data?.error ||
          "Error al actualizar el médico.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-4" style={{ maxWidth: "700px" }}>
        <div className="card shadow-sm border-0 p-4 rounded-4 text-center">
          <div className="spinner-border text-success mx-auto" role="status" />
          <p className="text-muted mt-2 mb-0">Cargando médico...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4" style={{ maxWidth: "700px" }}>
      <div className="card shadow-sm border-0 p-4 rounded-4">
        <h3 className="fw-bold text-success mb-3">Editar Médico</h3>

        {errorServer && (
          <div className="alert alert-danger py-2 small">{errorServer}</div>
        )}
        {successMsg && (
          <div className="alert alert-success py-2 small">{successMsg}</div>
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
            <div className="col-md-6">
              <CustomInput
                label="DNI"
                name="dni"
                type="text"
                placeholder="7 u 8 dígitos"
                value={formData.dni}
                onChange={handleChange}
                required
              />
            </div>
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
          </div>

          <div className="row">
            <div className="col-md-4">
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
            <div className="col-md-5">
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

          <div className="row">
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
              onClick={() => navigate("/medicos")}
            >
              Cancelar
            </CustomButton>
            <CustomButton type="submit" loading={submitting}>
              Actualizar Médico
            </CustomButton>
          </div>
        </form>
      </div>
    </div>
  );
};
