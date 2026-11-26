import { useEffect, useMemo, useState } from "react";
import clientesAxios from "../../config/axios.js";
import { PARAMETROS_LISTADO_COMPLETO } from "../../utils/paginacion.js";
import { CustomInput } from "../ui/CustomInput.jsx";
import { CustomSelect } from "../ui/CustomSelect.jsx";
import { CustomButton } from "../ui/CustomButton.jsx";

const METODO_PAGO_OPCIONES = [
  { value: "EFECTIVO", label: "Efectivo" },
  { value: "TRANSFERENCIA", label: "Transferencia" },
  { value: "TARJETA_DEBITO", label: "Tarjeta de débito" },
  { value: "TARJETA_CREDITO", label: "Tarjeta de crédito" },
  { value: "OBRA_SOCIAL", label: "Obra social" },
  { value: "OTRO", label: "Otro" },
];

const ESTADO_PAGO_OPCIONES = [
  { value: "PAGADO", label: "Pagado" },
  { value: "PENDIENTE", label: "Pendiente" },
];

const leerValor = (valOrEvent) => {
  if (
    valOrEvent &&
    typeof valOrEvent === "object" &&
    "target" in valOrEvent &&
    valOrEvent.target
  ) {
    return valOrEvent.target.value;
  }
  return valOrEvent ?? "";
};

const obtenerHoyStr = () => {
  const hoy = new Date();
  const anio = hoy.getFullYear();
  const mes = String(hoy.getMonth() + 1).padStart(2, "0");
  const dia = String(hoy.getDate()).padStart(2, "0");
  return `${anio}-${mes}-${dia}`;
};

const extraerListaPacientes = (data) => {
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.data?.pacientes)) return data.data.pacientes;
  if (Array.isArray(data?.pacientes)) return data.pacientes;
  if (Array.isArray(data)) return data;
  return [];
};

export const FormularioPago = ({
  onSubmit,
  onCancel,
  submitting = false,
  submitLabel = "Registrar Pago",
}) => {
  const [pacientes, setPacientes] = useState([]);
  const [paciente, setPaciente] = useState("");
  const [fecha, setFecha] = useState(() => obtenerHoyStr());
  const [monto, setMonto] = useState("");
  const [metodoPago, setMetodoPago] = useState("EFECTIVO");
  const [estado, setEstado] = useState("PAGADO");
  const [concepto, setConcepto] = useState("Consulta nutricional");
  const [observaciones, setObservaciones] = useState("");
  const [errorLocal, setErrorLocal] = useState("");

  useEffect(() => {
    let activo = true;
    const cargarPacientes = async () => {
      try {
        const { data } = await clientesAxios.get("/pacientes", {
          params: PARAMETROS_LISTADO_COMPLETO,
        });
        if (!activo) return;
        setPacientes(extraerListaPacientes(data));
      } catch (err) {
        console.error("Error al cargar pacientes:", err);
      }
    };
    cargarPacientes();
    return () => {
      activo = false;
    };
  }, []);

  const opcionesPacientes = useMemo(
    () =>
      pacientes.map((p) => ({
        value: String(p._id),
        label: `${p.apellido || ""}, ${p.nombre || ""}${
          p.dni ? ` (DNI: ${p.dni})` : ""
        }`,
      })),
    [pacientes],
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorLocal("");

    if (!paciente) {
      setErrorLocal("Seleccioná un paciente.");
      return;
    }

    const montoNum = Number(monto);
    if (!Number.isFinite(montoNum) || montoNum <= 0) {
      setErrorLocal("Ingresá un monto válido mayor a 0.");
      return;
    }

    if (!fecha) {
      setErrorLocal("Seleccioná la fecha del pago.");
      return;
    }

    onSubmit({
      paciente,
      fecha,
      monto: montoNum,
      metodoPago,
      estado,
      concepto: concepto.trim() || "Consulta nutricional",
      observaciones: observaciones.trim(),
    });
  };

  return (
    <div className="card shadow-sm border-0 p-4 rounded-4">
      <h4 className="fw-bold text-success mb-4">Registrar Pago</h4>

      {errorLocal && (
        <div className="alert alert-danger py-2 small mb-3" role="alert">
          {errorLocal}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="row g-3 mb-2">
          <div className="col-md-6">
            <CustomSelect
              id="pacientePago"
              name="paciente"
              label="Paciente *"
              value={paciente}
              onChange={(val) => setPaciente(String(leerValor(val) || ""))}
              options={opcionesPacientes}
              placeholder="Escriba para buscar o seleccione..."
              required
            />
          </div>

          <div className="col-md-3">
            <CustomInput
              id="fechaPago"
              name="fecha"
              label="Fecha *"
              type="date"
              value={fecha}
              onChange={(val) => setFecha(String(leerValor(val) || ""))}
              required
            />
          </div>

          <div className="col-md-3">
            <CustomInput
              id="montoPago"
              name="monto"
              label="Monto *"
              type="number"
              min="1"
              step="0.01"
              placeholder="0.00"
              value={monto}
              onChange={(val) => setMonto(String(leerValor(val) || ""))}
              required
            />
          </div>
        </div>

        <div className="row g-3 mb-2">
          <div className="col-md-4">
            <CustomSelect
              id="metodoPago"
              name="metodoPago"
              label="Método de pago *"
              value={metodoPago}
              onChange={(val) => setMetodoPago(String(leerValor(val) || ""))}
              options={METODO_PAGO_OPCIONES}
              required
            />
          </div>

          <div className="col-md-4">
            <CustomSelect
              id="estadoPago"
              name="estado"
              label="Estado *"
              value={estado}
              onChange={(val) => setEstado(String(leerValor(val) || ""))}
              options={ESTADO_PAGO_OPCIONES}
              required
            />
          </div>

          <div className="col-md-4">
            <CustomInput
              id="conceptoPago"
              name="concepto"
              label="Concepto"
              type="text"
              placeholder="Ej: Consulta nutricional, Plan mensual"
              value={concepto}
              onChange={(val) => setConcepto(String(leerValor(val) || ""))}
            />
          </div>
        </div>

        <div className="mb-3">
          <CustomInput
            id="observacionesPago"
            name="observaciones"
            label="Observaciones"
            type="text"
            placeholder="Notas adicionales, comprobante, etc."
            value={observaciones}
            onChange={(val) => setObservaciones(String(leerValor(val) || ""))}
          />
        </div>

        <div className="d-flex justify-content-end gap-2">
          {onCancel && (
            <CustomButton type="button" variant="secondary" onClick={onCancel}>
              Cancelar
            </CustomButton>
          )}
          <CustomButton type="submit" loading={submitting}>
            {submitLabel}
          </CustomButton>
        </div>
      </form>
    </div>
  );
};
