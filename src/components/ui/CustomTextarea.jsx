export const CustomTextarea = ({
  label,
  id,
  name,
  value = "",
  onChange,
  rows = 3,
  placeholder = "",
  error,
  className = "",
  required = false,
  disabled = false,
  ...props
}) => {
  return (
    <div className={`mb-3 ${className}`}>
      {label && (
        <label
          htmlFor={id || name}
          className="form-label fw-semibold text-dark"
        >
          {label}
        </label>
      )}

      <textarea
        id={id || name}
        name={name}
        rows={rows}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={`form-control login-input ${error ? "is-invalid" : ""}`}
        {...props}
      />

      {error && <div className="invalid-feedback d-block">{error}</div>}
    </div>
  );
};
