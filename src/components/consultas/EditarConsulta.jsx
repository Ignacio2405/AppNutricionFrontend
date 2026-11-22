import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CustomInput } from "../ui/CustomInput";
import { CustomButton } from "../ui/CustomButton";
import clientesAxios from "../../config/axios.js";

const aNumeroOpcional = (valor) => {
  if (valor === "" || valor === null || valor === undefined) return undefined;
  const num = Number(valor);
  return Number.isNaN(num) ? undefined : num;
};

const aStringInput = (valor) =>
  valor === null || valor === undefined ? "" : String(valor);

export const EditarConsulta = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fecha: "",
    hora: "",
    observaciones: "",
    peso: "",
    talla: "",
    cuello: "",
    brazo: "",
    cintura: "",
    cadera: "",
    pTricipital: "",
    pBicipital: "",
    pSubescapular: "",
    pSuprailiaco: "",
  });

  const [cargandoDatos, setCargandoDatos] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorServer, setErrorServer] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    const fetchConsulta = async () => {
      try {
        const { data } = await clientesAxios.get(`/consulta/${id}`);
        const c = data.data || data.consulta || data;
        const m = c.antropometria?.mediciones || {};

        setFormData({
          fecha: c.fecha ? new Date(c.fecha).toISOString().split("T")[0] : "",
          hora: aStringInput(c.hora),
          observaciones: aStringInput(c.observaciones),
          peso: aStringInput(m.peso),
          talla: aStringInput(m.talla),
          cuello: aStringInput(m.cuello),
          brazo: aStringInput(m.brazo),
          cintura: aStringInput(m.cintura),
          cadera: aStringInput(m.cadera),
          pTricipital: aStringInput(m.pTricipital),
          pBicipital: aStringInput(m.pBicipital),
          pSubescapular: aStringInput(m.pSubescapular),
          pSuprailiaco: aStringInput(m.pSuprailiaco),
        });
      } catch (err) {
        console.error("Error al cargar consulta:", err);
        setErrorServer(
          err.response?.data?.mensaje || "No se pudo cargar la consulta.",
        );
      } finally {
        setCargandoDatos(false);
      }
    };

    if (id) fetchConsulta();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorServer("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const payload = {
        fecha: formData.fecha || undefined,
        hora: formData.hora,
        observaciones: formData.observaciones.trim(),
        antropometria: {
          mediciones: {
            peso: aNumeroOpcional(formData.peso),
            talla: aNumeroOpcional(formData.talla),
            cuello: aNumeroOpcional(formData.cuello),
            brazo: aNumeroOpcional(formData.brazo),
            cintura: aNumeroOpcional(formData.cintura),
            cadera: aNumeroOpcional(formData.cadera),
            pTricipital: aNumeroOpcional(formData.pTricipital),
            pBicipital: aNumeroOpcional(formData.pBicipital),
            pSubescapular: aNumeroOpcional(formData.pSubescapular),
            pSuprailiaco: aNumeroOpcional(formData.pSuprailiaco),
          },
        },
      };

      await clientesAxios.put(`/consulta/${id}`, payload);
      setSuccessMsg("¡Consulta actualizada correctamente!");
      setTimeout(() => navigate(`/consulta/${id}`), 1500);
    } catch (err) {
      console.error(err);
      setErrorServer(
        err.response?.data?.mensaje ||
          err.response?.data?.error ||
          "Error al actualizar la consulta.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (cargandoDatos) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-success" role="status" />
        <p className="text-muted mt-2">Cargando datos de la consulta...</p>
      </div>
    );
  }

  return (
    <div className="container py-4" style={{ maxWidth: "820px" }}>
      <div className="card shadow-sm border-0 p-4 rounded-4">
        <h3 className="fw-bold text-success mb-3">Editar Consulta Médica</h3>

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
                label="Fecha"
                name="fecha"
                type="date"
                value={formData.fecha}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-6">
              <CustomInput
                label="Hora"
                name="hora"
                type="time"
                value={formData.hora}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <hr className="my-3" />
          <h6 className="fw-semibold text-secondary mb-3">
            Mediciones Antropométricas
          </h6>

          <div className="row">
            <div className="col-md-3">
              <CustomInput
                label="Peso (kg)"
                name="peso"
                type="number"
                step="0.01"
                min="0"
                value={formData.peso}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-3">
              <CustomInput
                label="Talla (cm / m)"
                name="talla"
                type="number"
                step="0.01"
                min="0"
                value={formData.talla}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-3">
              <CustomInput
                label="Cuello (cm)"
                name="cuello"
                type="number"
                step="0.1"
                value={formData.cuello}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-3">
              <CustomInput
                label="Brazo (cm)"
                name="brazo"
                type="number"
                step="0.1"
                value={formData.brazo}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="row">
            <div className="col-md-3">
              <CustomInput
                label="Cintura (cm)"
                name="cintura"
                type="number"
                step="0.1"
                value={formData.cintura}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-3">
              <CustomInput
                label="Cadera (cm)"
                name="cadera"
                type="number"
                step="0.1"
                value={formData.cadera}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-3">
              <CustomInput
                label="Pliegue Tricipital (mm)"
                name="pTricipital"
                type="number"
                step="0.1"
                value={formData.pTricipital}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-3">
              <CustomInput
                label="Pliegue Bicipital (mm)"
                name="pBicipital"
                type="number"
                step="0.1"
                value={formData.pBicipital}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="row">
            <div className="col-md-6">
              <CustomInput
                label="Pliegue Subescapular (mm)"
                name="pSubescapular"
                type="number"
                step="0.1"
                value={formData.pSubescapular}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-6">
              <CustomInput
                label="Pliegue Suprailíaco (mm)"
                name="pSuprailiaco"
                type="number"
                step="0.1"
                value={formData.pSuprailiaco}
                onChange={handleChange}
              />
            </div>
          </div>

          <CustomInput
            label="Observaciones"
            name="observaciones"
            value={formData.observaciones}
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
