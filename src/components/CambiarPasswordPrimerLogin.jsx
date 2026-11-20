import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CustomInput } from "./ui/CustomInput";
import { CustomButton } from "./ui/CustomButton";
import clientesAxios from "../config/axios.js";

export const CambiarPasswordPrimerLogin = () => {
  const [passwordActual, setPasswordActual] = useState("");
  const [nuevoPassword, setNuevoPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");

  const [errorServer, setErrorServer] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorServer("");
    setSuccessMsg("");

    // Validar que las nuevas contraseñas coincidan
    if (nuevoPassword !== confirmarPassword) {
      setErrorServer("Las nuevas contraseñas no coinciden.");
      return;
    }

    setLoading(true);

    try {
      // Petición PATCH conectada a tu backend (/api/auth/cambiar-contrasena)
      // Como usa el interceptor, ya mandará el token temporal o de sesión que guardaste en el login
      await clientesAxios.patch("/auth/cambiar-contrasena", {
        passwordActual,
        nuevoPassword,
      });

      setSuccessMsg("¡Contraseña actualizada con éxito! Redirigiendo...");

      setTimeout(() => {
        navigate("/"); // O a donde corresponda ingresar tras el cambio exitoso
      }, 2000);
    } catch (err) {
      console.error(err);
      const mensajeError =
        err.response?.data?.mensaje ||
        err.response?.data?.error ||
        "Ocurrió un error al cambiar la contraseña.";
      setErrorServer(mensajeError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-bg">
      <div className="login-card">
        {/* Cabecera idéntica al login con tu logo */}
        <div className="login-card-header">
          <img
            src="/LogoVerde.png"
            alt="Logo CulA Nutrición"
            width="140"
            className="mb-2"
          />
          <p className="mb-0 small fw-bold text-dark">
            Cambio obligatorio de contraseña
          </p>
          <small className="text-muted" style={{ fontSize: "0.8rem" }}>
            Es tu primer ingreso, debes actualizar tu clave.
          </small>
        </div>

        <div className="p-4">
          {errorServer && (
            <div className="alert alert-danger py-2 small mb-3" role="alert">
              {errorServer}
            </div>
          )}

          {successMsg && (
            <div className="alert alert-success py-2 small mb-3" role="alert">
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <CustomInput
              id="passwordActualInput"
              label="Contraseña Temporal / Actual"
              type="password"
              placeholder="••••••••"
              value={passwordActual}
              onChange={(e) => setPasswordActual(e.target.value)}
              required
            />

            <CustomInput
              id="nuevoPasswordInput"
              label="Nueva contraseña"
              type="password"
              placeholder="••••••••"
              value={nuevoPassword}
              onChange={(e) => setNuevoPassword(e.target.value)}
              required
            />

            <CustomInput
              id="confirmarPasswordInput"
              label="Confirmar nueva contraseña"
              type="password"
              placeholder="••••••••"
              value={confirmarPassword}
              onChange={(e) => setConfirmarPassword(e.target.value)}
              required
            />

            <CustomButton
              type="submit"
              fullWidth
              loading={loading}
              className="mt-3"
            >
              Actualizar Contraseña
            </CustomButton>
          </form>
        </div>
      </div>
    </div>
  );
};
