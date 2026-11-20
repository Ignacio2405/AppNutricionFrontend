// src/components/ui/CustomInput.jsx
import { useState } from "react";

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
            className="btn btn-outline-secondary"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "Ocultar" : "Ver"}
          </button>
        )}

        {error && <div className="invalid-feedback">{error}</div>}
      </div>
    </div>
  );
};
