export const CustomSelectSimple = ({
  label,
  id,
  name,
  value = "",
  onChange,
  options = [],
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

      <select
        id={id || name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={`form-select login-input ${error ? "is-invalid" : ""}`}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {error && <div className="invalid-feedback d-block">{error}</div>}
    </div>
  );
};
