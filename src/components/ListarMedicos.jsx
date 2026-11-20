import { useState, useEffect } from "react";
import { CustomTable } from "./ui/CustomTable.jsx";
import clientesAxios from "../config/axios.js";

export const ListarMedicos = () => {
  const [medicos, setMedicos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMedicos = async () => {
      try {
        const { data } = await clientesAxios.get("/medicos");

        console.log("Respuesta de médicos:", data);

        // Extraemos el array de médicos
        setMedicos(Array.isArray(data.data) ? data.data : []);
      } catch (err) {
        console.error("Error al cargar médicos:", err);
        setMedicos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMedicos();
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
      titulo: "Teléfono",
      render: (row) =>
        [row.telefono?.codigoArea, row.telefono?.numero]
          .filter(Boolean)
          .join("-") || "—",
    },
  ];

  return (
    <CustomTable
      titulo="Listado de Médicos"
      rutaNuevo="/medicos/nuevo"
      textoBotonNuevo="+ Nuevo Médico"
      columnas={columnas}
      datos={medicos}
      loading={loading}
    />
  );
};
