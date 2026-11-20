import { useState, useEffect } from "react";
import { CustomTable } from "./ui/CustomTable";
import clientesAxios from "../config/axios.js";

export const ListarObrasSociales = () => {
  const [obrasSociales, setObrasSociales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchObrasSociales = async () => {
      try {
        const { data } = await clientesAxios.get("/obraSocial");

        console.log("Respuesta de obras sociales:", data);

        // Extraemos el array de obras sociales
        setObrasSociales(Array.isArray(data.data) ? data.data : []);
      } catch (err) {
        console.error("Error al cargar obras sociales:", err);
        setObrasSociales([]);
      } finally {
        setLoading(false);
      }
    };

    fetchObrasSociales();
  }, []);

  const columnas = [
    {
      titulo: "Razón Social",
      campo: "razonSocial",
    },
    {
      titulo: "CUIT",
      campo: "cuit",
    },
    {
      titulo: "Dirección",
      campo: "direccion",
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
      titulo="Listado de Obras Sociales"
      rutaNuevo="/obras-sociales/nueva"
      textoBotonNuevo="+ Nueva Obra Social"
      columnas={columnas}
      datos={obrasSociales}
      loading={loading}
    />
  );
};
