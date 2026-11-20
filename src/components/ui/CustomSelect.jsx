import { useState, useMemo } from "react";

export const CustomSelect = ({
  label,
  id,
  name,
  value = "",
  onChange,
  error,
  options = [],
  className = "",
  required = false,
  placeholder = "Escriba para buscar o seleccione...",
  disabled = false,
}) => {
  const [textoFiltro, setTextoFiltro] = useState("");
  const [abierto, setAbierto] = useState(false);
  const [editando, setEditando] = useState(false);

  const opcionSeleccionada = useMemo(
    () => options.find((opt) => String(opt.value) === String(value)),
    [options, value],
  );

  // Si el usuario está escribiendo, mostramos lo que tipea; si no, la etiqueta seleccionada
  const valorMostrado = editando
    ? textoFiltro
    : opcionSeleccionada
      ? opcionSeleccionada.label
      : "";

  const opcionesFiltradas = useMemo(() => {
    if (!editando) return options;

    const termino = textoFiltro.trim().toLowerCase();
    if (!termino) return options;

    return options.filter((opt) =>
      String(opt.label).toLowerCase().includes(termino),
    );
  }, [options, editando, textoFiltro]);

  const emitirCambio = (nuevoValor) => {
    if (onChange) {
      onChange({
        target: {
          name,
          id,
          value: nuevoValor,
        },
      });
    }
  };

  const handleFocus = () => {
    setAbierto(true);
    setEditando(false);
    setTextoFiltro("");
  };

  const handleInputChange = (e) => {
    const texto = e.target.value;
    setTextoFiltro(texto);
    setEditando(true);
    setAbierto(true);

    if (texto === "" && value !== "") {
      emitirCambio("");
    }
  };

  const handleSeleccionar = (opt) => {
    setTextoFiltro("");
    setEditando(false);
    setAbierto(false);
    emitirCambio(opt.value);
  };

  const handleLimpiar = () => {
    setTextoFiltro("");
    setEditando(false);
    setAbierto(true);
    emitirCambio("");
  };

  const handleBlur = () => {
    setTimeout(() => {
      setAbierto(false);
      setEditando(false);
      setTextoFiltro("");
    }, 150);
  };

  return (
    <div className={`mb-3 position-relative ${className}`}>
      {label && (
        <label htmlFor={id} className="form-label fw-semibold text-dark">
          {label}
        </label>
      )}

      <div className="input-group">
        <input
          id={id}
          name={name}
          type="text"
          autoComplete="off"
          disabled={disabled}
          placeholder={placeholder}
          value={valorMostrado}
          onFocus={handleFocus}
          onChange={handleInputChange}
          onBlur={handleBlur}
          className={`form-control login-input ${error ? "is-invalid" : ""}`}
        />

        {valorMostrado && !disabled && (
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={handleLimpiar}
            title="Limpiar selección"
          >
            ✕
          </button>
        )}
      </div>

      {required && (
        <input
          type="text"
          tabIndex={-1}
          required
          value={value || ""}
          onChange={() => {}}
          style={{
            opacity: 0,
            height: 0,
            width: 0,
            position: "absolute",
            pointerEvents: "none",
          }}
          aria-hidden="true"
        />
      )}

      {abierto && !disabled && (
        <ul
          className="list-group position-absolute w-100 shadow-sm mt-1"
          style={{
            zIndex: 1050,
            maxHeight: "220px",
            overflowY: "auto",
          }}
        >
          {opcionesFiltradas.length > 0 ? (
            opcionesFiltradas.map((opt) => {
              const activa = String(opt.value) === String(value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSeleccionar(opt)}
                  className={`list-group-item list-group-item-action text-start py-2 ${
                    activa ? "active bg-success border-success" : ""
                  }`}
                >
                  {opt.label}
                </button>
              );
            })
          ) : (
            <li className="list-group-item text-muted small py-2">
              No se encontraron coincidencias para "{textoFiltro}".
            </li>
          )}
        </ul>
      )}

      {error && <div className="invalid-feedback d-block">{error}</div>}
    </div>
  );
};
