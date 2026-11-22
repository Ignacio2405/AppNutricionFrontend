import { useState } from "react";
import { CustomInput } from "../ui/CustomInput.jsx";
import { CustomButton } from "../ui/CustomButton.jsx";

export const FormularioObraSocial = ({
  titulo = "Registrar Obra Social",
  initialData = null,
  onSubmit,
  onCancel,
  submitting = false,
  submitLabel = "Guardar",
}) => {
  const [razonSocial, setRazonSocial] = useState(
    () => initialData?.razonSocial || "",
  );
  const [cuit, setCuit] = useState(() => initialData?.cuit || "");
  const [direccion, setDireccion] = useState(
    () => initialData?.direccion || "",
  );
  const [codigoArea, setCodigoArea] = useState(
    () => initialData?.telefono?.codigoArea || "",
  );
  const [numero, setNumero] = useState(
    () => initialData?.telefono?.numero || "",
  );
  const [errorLocal, setErrorLocal] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorLocal("");

    if (!razonSocial.trim()) {
      setErrorLocal("Ingresá la razón social.");
      return;
    }

    const tieneTelefono = codigoArea.trim() || numero.trim();

    onSubmit({
      razonSocial: razonSocial.trim().toUpperCase(),
      cuit: cuit.trim(),
      direccion: direccion.trim(),
      telefono: tieneTelefono
        ? {
            codigoArea: codigoArea.trim(),
            numero: numero.trim(),
          }
        : undefined,
    });
  };

  return (
    <div className="container py-4">
      <div className="card shadow-sm border-0 p-4 rounded-4">
        <h3 className="fw-bold text-success mb-4">{titulo}</h3>

        {errorLocal && (
          <div className="alert alert-danger py-2 small mb-3">{errorLocal}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-6">
              <CustomInput
                id="razonSocial"
                name="razonSocial"
                label="Razón Social *"
                value={razonSocial}
                onChange={(e) => setRazonSocial(e.target.value)}
                placeholder="Ej: OSDE, SWISS MEDICAL, PAMI..."
                required
              />
            </div>

            <div className="col-md-6">
              <CustomInput
                id="cuit"
                name="cuit"
                label="CUIT"
                value={cuit}
                onChange={(e) => setCuit(e.target.value)}
                placeholder="Ej: 30-12345678-9"
              />
            </div>

            <div className="col-12">
              <CustomInput
                id="direccion"
                name="direccion"
                label="Dirección"
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                placeholder="Calle y número..."
              />
            </div>

            <div className="col-sm-4 col-md-3">
              <CustomInput
                id="codigoArea"
                name="codigoArea"
                label="Cód. Área"
                value={codigoArea}
                onChange={(e) => setCodigoArea(e.target.value)}
                placeholder="3777"
              />
            </div>

            <div className="col-sm-8 col-md-5">
              <CustomInput
                id="numeroTelefono"
                name="numeroTelefono"
                label="Teléfono"
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
                placeholder="123456"
              />
            </div>
          </div>

          <div className="d-flex justify-content-end gap-2 mt-3">
            {onCancel && (
              <CustomButton
                type="button"
                variant="secondary"
                onClick={onCancel}
              >
                Cancelar
              </CustomButton>
            )}
            <CustomButton type="submit" variant="primary" loading={submitting}>
              {submitLabel}
            </CustomButton>
          </div>
        </form>
      </div>
    </div>
  );
};
