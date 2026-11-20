// src/components/ui/CustomButton.jsx
export const CustomButton = ({
  children,
  type = "button",
  variant = "primary",
  fullWidth = false,
  loading = false,
  className = "",
  ...props
}) => {
  const variants = {
    primary: "btn-login-custom",
    secondary: "btn-secondary",
    danger: "btn-danger",
    outline: "btn-outline-success",
  };

  return (
    <button
      type={type}
      disabled={loading || props.disabled}
      className={`btn ${variants[variant] || variants.primary} ${
        fullWidth ? "w-100" : ""
      } py-2 rounded-3 ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <span
            className="spinner-border spinner-border-sm me-2"
            role="status"
            aria-hidden="true"
          ></span>
          Procesando...
        </>
      ) : (
        children
      )}
    </button>
  );
};
