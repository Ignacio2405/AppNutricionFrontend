import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "./layouts/MainLayout";
import { Login } from "./components/login";
import { CambiarPasswordPrimerLogin } from "./components/CambiarPasswordPrimerLogin";
import { ListarPacientes } from "./components/ListarPacientes";
import { CrearPaciente } from "./components/CrearPaciente";
import { ListarMedicos } from "./components/ListarMedicos";
import { CrearMedico } from "./components/CrearMedico";
import { ListarObrasSociales } from "./components/ListarObrasSociales";
import { CrearObraSocial } from "./components/CrearObraSocial";
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
import { NotFound } from "./components/NotFound";
import { ListarHabitos } from "./components/habitoAlimentario/ListarHabitos";

// Componente auxiliar para proteger rutas privadas
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  // Si no hay token en el localStorage, lo patea al login
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <div className="w-100 min-vh-100 m-0 p-0 overflow-auto">
        <Routes>
          {/* 1. Rutas Públicas */}
          <Route path="/login" element={<Login />} />
          {/* 2. Ruta protegida para cambiar contraseña (requiere estar logueado con el token temporal) */}
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
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route
              path="/"
              element={
                <div>
                  <h2>Bienvenido a Home</h2>
                </div>
              }
            />
            <Route
              path="/dashboard"
              element={
                <div>
                  <h2>Vista de Dashboard</h2>
                </div>
              }
            />

            {/* ---- RUTAS DE PACIENTES / CUSTOMERS ---- */}
            <Route path="/customers" element={<ListarPacientes />} />
            <Route path="/pacientes/nuevo" element={<CrearPaciente />} />

            {/* ---- RUTAS DE MÉDICOS ---- */}
            <Route path="/medicos" element={<ListarMedicos />} />
            <Route path="/medicos/nuevo" element={<CrearMedico />} />

            {/* ---- RUTAS DE OBRAS SOCIALES ---- */}
            <Route path="/obras-sociales" element={<ListarObrasSociales />} />
            <Route path="/obras-sociales/nueva" element={<CrearObraSocial />} />

            <Route path="/consulta" element={<ListarConsultas />} />
            <Route path="/consulta/nueva" element={<CrearConsulta />} />
            <Route path="/consulta/:id" element={<DetalleConsulta />} />
            <Route path="/consulta/:id/editar" element={<EditarConsulta />} />

            <Route path="/habitos-alimentarios" element={<ListarHabitos />} />
            <Route
              path="/habitos-alimentarios/nuevo"
              element={<CrearHabitos />}
            />
            <Route path="/habitos-alimentarios/:id" element={<VerHabitos />} />
            <Route
              path="/habitos-alimentarios/editar/:id"
              element={<EditarHabitos />}
            />
          </Route>
          <Route path="/historial-medico" element={<ListarHistorial />} />
          <Route path="/historial-medico/nuevo" element={<CrearHistorial />} />
          <Route
            path="/historial-medico/editar/:id"
            element={<EditarHistorial />}
          />
          <Route path="/historial-medico/:id" element={<DetalleHistorial />} />

          {/* Redirección por defecto si escriben cualquier otra URL */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
