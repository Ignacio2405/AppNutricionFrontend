import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CustomInput } from "./ui/CustomInput";
import { CustomButton } from "./ui/CustomButton";
import clientesAxios from "../config/axios.js";

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorServer, setErrorServer] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorServer("");
    setLoading(true);

    try {
      const { data } = await clientesAxios.post("/auth", { email, password });
      const tokenRecibido =
        data?.token ||
        data?.data?.token ||
        data?.accessToken ||
        data?.data?.accessToken;

      if (!tokenRecibido || typeof tokenRecibido !== "string") {
        localStorage.removeItem("token");
        setErrorServer("El servidor no devolvió un token válido.");
        return;
      }

      localStorage.setItem("token", tokenRecibido);

      const debeCambiar =
        Boolean(data?.debeCambiarPassword) ||
        Boolean(data?.data?.debeCambiarPassword);

      if (debeCambiar) {
        navigate("/cambiar-password");
      } else {
        navigate("/");
      }
    } catch (err) {
      console.error(err);
      const mensajeError =
        err.response?.data?.mensaje ||
        err.response?.data?.error ||
        "Credenciales inválidas o error en el servidor.";
      setErrorServer(mensajeError);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="login-page-bg">
      <div className="login-card">
        {/* Cabecera con el color y logo de CulA Nutrición */}
        <div className="login-card-header">
          <img
            src="/LogoVerde.png"
            alt="Logo CulA Nutrición"
            width="140"
            className="mb-2"
          />
          <p className="mb-0 small fw-medium text-dark">
            Fomentando hábitos saludables...
          </p>
          <p className="mb-0 small fw-medium text-dark">
            ...promoviendo la sulud y el bienestar
          </p>
        </div>

        {/* Cuerpo del formulario */}
        <div className="p-4">
          {errorServer && (
            <div className="alert alert-danger py-2 small mb-3" role="alert">
              {errorServer}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <CustomInput
              id="emailInput"
              label="Correo electrónico"
              type="email"
              placeholder="usuario@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <CustomInput
              id="passwordInput"
              label="Contraseña"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <div className="d-flex justify-content-between align-items-center mb-4">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="rememberCheck"
                />
                <label
                  className="form-check-label small"
                  htmlFor="rememberCheck"
                >
                  Mantener sesión
                </label>
              </div>
              <Link
                to="/recuperar-clave"
                className="small text-decoration-none text-secondary"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <CustomButton type="submit" fullWidth loading={loading}>
              Ingresar
            </CustomButton>
          </form>
        </div>
      </div>
    </div>
  );
};
