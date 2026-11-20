import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CustomInput } from "./ui/CustomInput";
import { CustomSelect } from "./ui/CustomSelect";
import { CustomButton } from "./ui/CustomButton";
import clientesAxios from "../config/axios.js";

export const CrearObraSocial = () => {
  const [formData, setFormData] = useState({
    razonSocial: "",
    cuit: "",
    direccion: "",
    telefonoTipo: "celular",
    codigoArea: "",
    numeroTelefono: "",
  });

  const [errorServer, setErrorServer] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
        razonSocial: formData.razonSocial,
        cuit: formData.cuit,
        direccion: formData.direccion,
        telefono: {
          tipo: formData.telefonoTipo,
          codigoArea: formData.codigoArea,
          numero: formData.numeroTelefono,
        },
      };

      await clientesAxios.post("/obraSocial", payload);
      setSuccessMsg("¡Obra Social registrada con éxito!");
      setTimeout(() => navigate("/obras-sociales"), 2000);
    } catch (err) {
      console.error(err);
      setErrorServer(
        err.response?.data?.mensaje ||
          err.response?.data?.error ||
          "Error al registrar obra social.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4" style={{ maxWidth: "600px" }}>
      <div className="card shadow-sm border-0 p-4 rounded-4">
        <h3 className="fw-bold text-success mb-3">Registrar Obra Social</h3>

        {errorServer && (
          <div className="alert alert-danger py-2 small">{errorServer}</div>
        )}
        {successMsg && (
          <div className="alert alert-success py-2 small">{successMsg}</div>
        )}

        <form onSubmit={handleSubmit}>
          <CustomInput
            label="Razón Social"
            name="razonSocial"
            value={formData.razonSocial}
            onChange={handleChange}
            required
          />

          <div className="row">
            <div className="col-md-6">
              <CustomInput
                label="CUIT"
                name="cuit"
                placeholder="Ej: 30-XXXXXXXX-X"
                value={formData.cuit}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-6">
              <CustomInput
                label="Dirección"
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="row border-top pt-3 mt-2">
            <h6 className="text-secondary fw-semibold mb-3">
              Información de Contacto
            </h6>
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

          <div className="d-flex justify-content-end gap-2 mt-4">
            <CustomButton
              type="button"
              variant="secondary"
              onClick={() => navigate(-1)}
            >
              Cancelar
            </CustomButton>
            <CustomButton type="submit" loading={loading}>
              Guardar Obra Social
            </CustomButton>
          </div>
        </form>
      </div>
    </div>
  );
};
