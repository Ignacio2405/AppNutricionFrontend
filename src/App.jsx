import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "./layouts/MainLayout";
import { Login } from "./components/login";
import { CambiarPasswordPrimerLogin } from "./components/CambiarPasswordPrimerLogin";
import { ListarPacientes } from "./components/paciente/ListarPacientes";
import { CrearPaciente } from "./components/paciente/CrearPaciente";
import { DetallePaciente } from "./components/paciente/DetallePaciente";
import { EditarPaciente } from "./components/paciente/EditarPaciente";
import { ListarMedicos } from "./components/medico/ListarMedicos";
import { CrearMedico } from "./components/medico/CrearMedico";
import { EditarMedico } from "./components/medico/EditarMedico";
import { DetalleMedico } from "./components/medico/DetalleMedico";
import { ListarObrasSociales } from "./components/obraSocial/ListarObrasSociales";
import { CrearObraSocial } from "./components/obraSocial/CrearObraSocial";
import { DetalleObraSocial } from "./components/obraSocial/DetalleObraSocial";
import { EditarObraSocial } from "./components/obraSocial/EditarObraSocial";
import { ListarConsultas } from "./components/consultas/ListarConsultas";
import { CrearConsulta } from "./components/consultas/CrearConsulta";
import { DetalleConsulta } from "./components/consultas/DetalleConsulta";
import { EditarConsulta } from "./components/consultas/EditarConsulta";
import { ListarHistorial } from "./components/historialMedico/ListarHistorial";
import { CrearHistorial } from "./components/historialMedico/CrearHistorial";
import { EditarHistorial } from "./components/historialMedico/EditarHistorial";
import { DetalleHistorial } from "./components/historialMedico/DetalleHistorial";
import { CrearHabitos } from "./components/habitoAlimentario/CrearHabitos";
import { VerHabitos } from "./components/habitoAlimentario/VerHabitos";
import { EditarHabitos } from "./components/habitoAlimentario/EditarHabitos";
import { ListarHabitos } from "./components/habitoAlimentario/ListarHabitos";
import { ListarLaboratorio } from "./components/laboratorio/ListarLaboratorio";
import { CrearLaboratorio } from "./components/laboratorio/CrearLaboratorio";
import { EditarLaboratorio } from "./components/laboratorio/EditarLaboratorio";
import { VerLaboratorio } from "./components/laboratorio/VerLaboratorio";
import { ListarPlanesComidas } from "./components/planComidas/ListarPlanesComidas";
import { CrearPlanComidas } from "./components/planComidas/CrearPlanComidas";
import { EditarPlanComidas } from "./components/planComidas/EditarPlanComidas";
import { DetallePlanComidas } from "./components/planComidas/DetallePlanComidas";
import { ListarMetasObjetivos } from "./components/metasObjetivos/ListarMetasObjetivos";
import { CrearMetaObjetivo } from "./components/metasObjetivos/CrearMetaObjetivo";
import { DetalleMetaObjetivo } from "./components/metasObjetivos/DetalleMetaObjetivo";
import { EditarMetaObjetivo } from "./components/metasObjetivos/EditarMetaObjetivo";
import { NotFound } from "./components/NotFound";

// Ruta privada: si no hay token, manda directo al login
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Ruta pública (Login): si ya hay token, manda al inicio del sistema
const PublicRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  if (token) {
    return <Navigate to="/customers" replace />;
  }
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <div className="w-100 min-vh-100 m-0 p-0 overflow-auto">
        <Routes>
          {/* 1. Ruta Pública: Login */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />

          {/* 2. Ruta protegida para cambiar contraseña (primer login) */}
          <Route
            path="/cambiar-password"
            element={
              <ProtectedRoute>
                <CambiarPasswordPrimerLogin />
              </ProtectedRoute>
            }
          />

          {/* 3. Rutas privadas del Sistema (Envueltas en MainLayout y protegidas) */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            {/* Página de inicio al entrar logueado */}
            <Route index element={<Navigate to="/customers" replace />} />

            {/* Pacientes */}
            <Route path="customers" element={<ListarPacientes />} />
            <Route path="pacientes/nuevo" element={<CrearPaciente />} />
            <Route path="/pacientes/:id" element={<DetallePaciente />} />
            <Route path="/pacientes/editar/:id" element={<EditarPaciente />} />

            {/* Médicos */}
            <Route path="medicos" element={<ListarMedicos />} />
            <Route path="medicos/nuevo" element={<CrearMedico />} />
            <Route path="/medicos/:id" element={<DetalleMedico />} />
            <Route path="/medicos/editar/:id" element={<EditarMedico />} />

            {/* Obras Sociales */}
            <Route path="obras-sociales" element={<ListarObrasSociales />} />
            <Route path="obras-sociales/nueva" element={<CrearObraSocial />} />
            <Route path="/obras-sociales/:id" element={<DetalleObraSocial />} />
            <Route
              path="obras-sociales/editar/:id"
              element={<EditarObraSocial />}
            />

            {/* Consultas */}
            <Route path="consulta" element={<ListarConsultas />} />
            <Route path="consulta/nueva" element={<CrearConsulta />} />
            <Route path="consulta/:id" element={<DetalleConsulta />} />
            <Route path="consulta/:id/editar" element={<EditarConsulta />} />

            {/* Hábitos Alimentarios */}
            <Route path="habitos-alimentarios" element={<ListarHabitos />} />
            <Route
              path="habitos-alimentarios/nuevo"
              element={<CrearHabitos />}
            />
            <Route path="habitos-alimentarios/:id" element={<VerHabitos />} />
            <Route
              path="habitos-alimentarios/editar/:id"
              element={<EditarHabitos />}
            />

            {/* Resultados de Laboratorio */}
            <Route
              path="resultados-laboratorio"
              element={<ListarLaboratorio />}
            />
            <Route
              path="resultados-laboratorio/nuevo"
              element={<CrearLaboratorio />}
            />
            <Route
              path="resultados-laboratorio/:id"
              element={<VerLaboratorio />}
            />
            <Route
              path="resultados-laboratorio/editar/:id"
              element={<EditarLaboratorio />}
            />

            {/* Historial Médico */}
            <Route path="historial-medico" element={<ListarHistorial />} />
            <Route path="historial-medico/nuevo" element={<CrearHistorial />} />
            <Route
              path="historial-medico/editar/:id"
              element={<EditarHistorial />}
            />
            <Route path="historial-medico/:id" element={<DetalleHistorial />} />

            <Route path="planes-comidas" element={<ListarPlanesComidas />} />
            <Route path="planes-comidas/nuevo" element={<CrearPlanComidas />} />
            <Route path="planes-comidas/:id" element={<DetallePlanComidas />} />
            <Route
              path="planes-comidas/:id/editar"
              element={<EditarPlanComidas />}
            />

            <Route path="/metas-objetivos" element={<ListarMetasObjetivos />} />
            <Route
              path="/metas-objetivos/nuevo"
              element={<CrearMetaObjetivo />}
            />
            <Route
              path="/metas-objetivos/:id"
              element={<DetalleMetaObjetivo />}
            />
            <Route
              path="/metas-objetivos/editar/:id"
              element={<EditarMetaObjetivo />}
            />
          </Route>

          {/* Redirección por defecto si escriben cualquier otra URL */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
