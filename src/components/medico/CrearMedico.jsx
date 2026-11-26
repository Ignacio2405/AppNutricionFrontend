import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CustomInput } from "../ui/CustomInput.jsx";
import { CustomSelect } from "../ui/CustomSelect.jsx";
import { CustomButton } from "../ui/CustomButton.jsx";
import clientesAxios from "../../config/axios.js";
import { PARAMETROS_LISTADO_COMPLETO } from "../../utils/paginacion.js";

export const CrearMedico = () => {
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    dni: "",
    email: "",
    telefonoTipo: "celular",
    codigoArea: "",
    numeroTelefono: "",
    obrasSocialesIds: [],
  });

  const [obraSocialActual, setObraSocialActual] = useState("");
  const [obrasSociales, setObrasSociales] = useState([]);
  const [errorServer, setErrorServer] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let activo = true;

    const fetchObrasSociales = async () => {
      try {
        const { data } = await clientesAxios.get("/obraSocial", {
          params: PARAMETROS_LISTADO_COMPLETO,
        });
        if (!activo) return;

        const lista = Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.obrasSociales)
            ? data.obrasSociales
            : Array.isArray(data)
              ? data
              : [];

        setObrasSociales(
          lista.map((os) => ({
            value: os._id,
            label: os.razonSocial,
          })),
        );
      } catch (err) {
        console.error("Error al cargar obras sociales:", err);
      }
    };

    fetchObrasSociales();
    return () => {
      activo = false;
    };
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAddObraSocial = () => {
    if (!obraSocialActual) return;

    setFormData((prev) => {
      if (prev.obrasSocialesIds.includes(obraSocialActual)) {
        return prev;
      }
      return {
        ...prev,
        obrasSocialesIds: [...prev.obrasSocialesIds, obraSocialActual],
      };
    });

    setObraSocialActual("");
  };

  const handleRemoveObraSocial = (idToRemove) => {
    setFormData((prev) => ({
      ...prev,
      obrasSocialesIds: prev.obrasSocialesIds.filter((id) => id !== idToRemove),
    }));
  };

  const getLabelObraSocial = (id) =>
    obrasSociales.find((os) => os.value === id)?.label || id;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorServer("");
    setSuccessMsg("");
    setLoading(true);

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
        obraSocial: formData.obrasSocialesIds,
      };

      await clientesAxios.post("/medicos", payload);
      setSuccessMsg("¡Médico registrado con éxito!");
      setTimeout(() => navigate("/medicos"), 1500);
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

  // Opcional: ocultar del dropdown las que ya fueron agregadas
  const opcionesDisponibles = obrasSociales.filter(
    (os) => !formData.obrasSocialesIds.includes(os.value),
  );

  return (
    <div className="container py-4" style={{ maxWidth: "700px" }}>
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

          <div className="row align-items-end">
            <div className="col-md-9">
              <CustomSelect
                label="Obras Sociales (Opcional)"
                id="obraSocialSelect"
                name="obraSocialSelect"
                value={obraSocialActual}
                onChange={(e) => setObraSocialActual(e.target.value)}
                options={opcionesDisponibles}
              />
            </div>
            <div className="col-md-3 mb-3">
              <CustomButton
                type="button"
                variant="outline-success"
                onClick={handleAddObraSocial}
                disabled={!obraSocialActual}
              >
                + Agregar
              </CustomButton>
            </div>
          </div>

          {formData.obrasSocialesIds.length > 0 && (
            <div className="mb-3 d-flex flex-wrap gap-2">
              {formData.obrasSocialesIds.map((id) => (
                <span
                  key={id}
                  className="badge bg-success-subtle text-success border border-success-subtle d-inline-flex align-items-center gap-2 py-2 px-3 rounded-pill"
                >
                  <span>{getLabelObraSocial(id)}</span>
                  <button
                    type="button"
                    className="btn-close btn-close-sm"
                    style={{ fontSize: "0.65rem" }}
                    aria-label="Quitar obra social"
                    onClick={() => handleRemoveObraSocial(id)}
                  />
                </span>
              ))}
            </div>
          )}

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
