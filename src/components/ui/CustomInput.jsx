import { useState } from "react";
import { BsEye, BsEyeSlash } from "react-icons/bs";

export const CustomInput = ({
  label,
  id,
  type = "text",
  error,
  className = "",
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className={`mb-3 ${className}`}>
      {label && (
        <label htmlFor={id} className="form-label fw-semibold text-dark">
          {label}
        </label>
      )}

      <div className={isPassword ? "input-group" : ""}>
        <input
          id={id}
          type={inputType}
          className={`form-control login-input ${error ? "is-invalid" : ""}`}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            className="btn btn-outline-secondary d-flex align-items-center"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
            title={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
          >
            {showPassword ? <BsEyeSlash size={18} /> : <BsEye size={18} />}
          </button>
        )}

        {error && <div className="invalid-feedback">{error}</div>}
      </div>
    </div>
  );
};
