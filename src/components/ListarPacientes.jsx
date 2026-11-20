import { useState, useEffect } from "react";
import { CustomTable } from "./ui/CustomTable";
import clientesAxios from "../config/axios.js";

export const ListarPacientes = () => {
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPacientes = async () => {
      try {
        const { data } = await clientesAxios.get("/pacientes");

        console.log("Respuesta del backend:", data);

        // Extraemos el array de pacientes de la propiedad data
        setPacientes(Array.isArray(data.data) ? data.data : []);
      } catch (err) {
        console.error("Error al cargar pacientes:", err);
        setPacientes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPacientes();
  }, []);

  const columnas = [
    {
      titulo: "Nombre y Apellido",
      render: (row) => `${row.nombre} ${row.apellido}`,
    },
    {
      titulo: "DNI",
      campo: "dni",
    },
    {
      titulo: "Correo",
      campo: "email",
    },
    {
      titulo: "Sexo",
      render: (row) => {
        if (row.sexo === "F") return "Femenino";
        if (row.sexo === "M") return "Masculino";
        return "-";
      },
    },
    {
      titulo: "Teléfono",
      render: (row) =>
        row.telefono
          ? `${row.telefono.codigoArea || ""} ${row.telefono.numero || ""}`.trim()
          : "-",
    },
  ];

  return (
    <CustomTable
      titulo="Listado de Pacientes"
      rutaNuevo="/pacientes/nuevo"
      textoBotonNuevo="+ Nuevo Paciente"
      columnas={columnas}
      datos={pacientes}
      loading={loading}
    />
  );
};
