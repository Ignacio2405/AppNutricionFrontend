import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CustomInput } from "./ui/CustomInput";
import { CustomSelect } from "./ui/CustomSelect";
import { CustomButton } from "./ui/CustomButton";
import clientesAxios from "../config/axios.js";

export const CrearPaciente = () => {
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
    telefonoTipo: "CELULAR",
    obraSocialId: "",
  });

  const [obrasSociales, setObrasSociales] = useState([]);
  const [errorServer, setErrorServer] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Cargar lista de obras sociales disponibles para el selector
  useEffect(() => {
    const fetchObrasSociales = async () => {
      try {
        const { data } = await clientesAxios.get("/obraSocial");
        // Mapeamos para que CustomSelect los lea con { value, label }
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
        fechaNacimiento: formData.fechaNacimiento,
        sexo: formData.sexo || undefined,
        ocupacion: formData.ocupacion || undefined,
        telefono: {
          tipo: formData.telefonoTipo,
          codigoArea: formData.codigoArea,
          numero: formData.numeroTelefono,
        },
        obraSocial: formData.obraSocialId || null,
      };

      await clientesAxios.post("/pacientes", payload);
      setSuccessMsg("¡Paciente registrado con éxito!");
      setTimeout(() => navigate("/customers"), 2000);
    } catch (err) {
      console.error(err);
      setErrorServer(
        err.response?.data?.mensaje ||
          err.response?.data?.error ||
          "Error al registrar paciente.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4" style={{ maxWidth: "750px" }}>
      <div className="card shadow-sm border-0 p-4 rounded-4">
        <h3 className="fw-bold text-success mb-3">Registrar Nuevo Paciente</h3>

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
              onClick={() => navigate(-1)}
            >
              Cancelar
            </CustomButton>
            <CustomButton type="submit" loading={loading}>
              Guardar Paciente
            </CustomButton>
          </div>
        </form>
      </div>
    </div>
  );
};
