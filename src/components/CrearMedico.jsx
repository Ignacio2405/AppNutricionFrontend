import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CustomInput } from "./ui/CustomInput";
import { CustomSelect } from "./ui/CustomSelect";
import { CustomButton } from "./ui/CustomButton";
import clientesAxios from "../config/axios.js";

export const CrearMedico = () => {
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    dni: "",
    email: "",
    telefono: { tipo: "celular", codigoArea: "", numero: "" },
    obraSocialId: "",
  });

  const [obrasSociales, setObrasSociales] = useState([]);
  const [errorServer, setErrorServer] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Cargar lista de obras sociales disponibles
  useEffect(() => {
    const fetchObrasSociales = async () => {
      try {
        const { data } = await clientesAxios.get("/obraSocial");
        const opciones = (data.obrasSociales || data).map((os) => ({
          value: os._id,
          label: os.razonSocial,
        }));
        setObrasSociales(opciones);
      } catch (err) {
        console.error("Error al cargar obras sociales", err);
      }
    };
    fetchObrasSociales();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorServer("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const payload = {
        nombre: formData.nombre,
        apellido: formData.apellido,
        dni: formData.dni,
        email: formData.email,
        telefono: {
          tipo: formData.telefono.tipo,
          codigoArea: FormData.codigoArea,
          numero: FormData.numero,
        },
        obraSocial: formData.obraSocialId ? [formData.obraSocialId] : [],
      };

      await clientesAxios.post("/medicos", payload);
      setSuccessMsg("¡Médico registrado con éxito!");
      setTimeout(() => navigate("/medicos"), 2000);
    } catch (err) {
      console.error(err);
      setErrorServer(
        err.response?.data?.mensaje ||
          err.response?.data?.error ||
          "Error al registrar médico.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4" style={{ maxWidth: "600px" }}>
      <div className="card shadow-sm border-0 p-4 rounded-4">
        <h3 className="fw-bold text-success mb-3">Registrar Nuevo Médico</h3>

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
            <div className="col-md-6">
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
            <div className="col-md-6">
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
              onClick={() => navigate(-1)}
            >
              Cancelar
            </CustomButton>
            <CustomButton type="submit" loading={loading}>
              Guardar Médico
            </CustomButton>
          </div>
        </form>
      </div>
    </div>
  );
};
