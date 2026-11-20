import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { CustomTable } from "../ui/CustomTable";
import { CustomButton } from "../ui/CustomButton";
import clientesAxios from "../../config/axios.js";

export const ListarConsultas = () => {
  const [consultas, setConsultas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorServer, setErrorServer] = useState("");
  const navigate = useNavigate();

  const cargarConsultas = useCallback(async () => {
    const { data } = await clientesAxios.get("/consulta");
    return Array.isArray(data)
      ? data
      : data.data || data.consultas || data.docs || [];
  }, []);

  useEffect(() => {
    let cancelado = false;

    const ejecutarCarga = async () => {
      try {
        const lista = await cargarConsultas();
        if (!cancelado) {
          setConsultas(lista);
          setErrorServer("");
        }
      } catch (err) {
        console.error("Error al cargar consultas:", err);
        if (!cancelado) {
          setErrorServer(
            err.response?.data?.mensaje ||
              "No se pudieron cargar las consultas.",
          );
        }
      } finally {
        if (!cancelado) {
          setLoading(false);
        }
      }
    };

    ejecutarCarga();

    return () => {
      cancelado = true;
    };
  }, [cargarConsultas]);

  const handleEliminar = async (id) => {
    const confirmar = window.confirm(
      "¿Deseas desactivar esta consulta médica?",
    );
    if (!confirmar) return;

    try {
      await clientesAxios.delete(`/consulta/${id}`);
      setConsultas((prev) => prev.filter((c) => (c._id || c.id) !== id));
    } catch (err) {
      console.error("Error al desactivar consulta:", err);
      setErrorServer(
        err.response?.data?.mensaje || "Error al desactivar la consulta.",
      );
    }
  };

  const formatearPersona = (persona) => {
    if (!persona) return "-";
    if (typeof persona === "string") return persona;
    return `${persona.apellido || ""} ${persona.nombre || ""}`.trim() || "-";
  };

  const columnas = [
    {
      titulo: "Fecha / Hora",
      render: (row) => {
        const fechaStr = row.fecha
          ? new Date(row.fecha).toLocaleDateString("es-AR")
          : "-";
        return `${fechaStr} ${row.hora ? `· ${row.hora}` : ""}`;
      },
    },
    {
      titulo: "Paciente",
      render: (row) => formatearPersona(row.paciente),
    },
    {
      titulo: "Médico",
      render: (row) => formatearPersona(row.medico),
    },
    {
      titulo: "Peso (kg)",
      render: (row) => row.antropometria?.mediciones?.peso ?? "-",
    },
    {
      titulo: "IMC",
      render: (row) => row.antropometria?.resultados?.imc ?? "Pendiente",
    },
    {
      titulo: "Acciones",
      render: (row) => {
        const id = row._id || row.id;
        return (
          <div className="d-flex gap-2">
            <CustomButton
              type="button"
              variant="outline-success"
              onClick={() => navigate(`/consulta/${id}`)}
            >
              Ver
            </CustomButton>
            <CustomButton
              type="button"
              variant="outline-secondary"
              onClick={() => navigate(`/consulta/${id}/editar`)}
            >
              Editar
            </CustomButton>
            <CustomButton
              type="button"
              variant="outline-danger"
              onClick={() => handleEliminar(id)}
            >
              Eliminar
            </CustomButton>
          </div>
        );
      },
    },
  ];

  return (
    <>
      {errorServer && (
        <div className="container pt-3">
          <div className="alert alert-danger py-2 small mb-0">
            {errorServer}
          </div>
        </div>
      )}
      <CustomTable
        titulo="Consultas Médicas"
        rutaNuevo="/consulta/nueva"
        textoBotonNuevo="+ Nueva Consulta"
        columnas={columnas}
        datos={consultas}
        loading={loading}
      />
    </>
  );
};
