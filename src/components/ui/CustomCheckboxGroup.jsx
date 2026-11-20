export const CustomCheckboxGroup = ({
  items = [],
  values = {},
  onChange,
  idPrefix = "chk",
  colClassName = "col-6 col-md-3",
  className = "mb-3",
}) => {
  return (
    <div className={`row g-2 ${className}`}>
      {items.map((item) => {
        const inputId = `${idPrefix}-${item.name}`;
        return (
          <div className={colClassName} key={item.name}>
            <div className="form-check">
              <input
                id={inputId}
                name={item.name}
                type="checkbox"
                className="form-check-input"
                checked={Boolean(values[item.name])}
                onChange={onChange}
              />
              <label htmlFor={inputId} className="form-check-label fw-medium">
                {item.label}
              </label>
            </div>
          </div>
        );
      })}
    </div>
  );
};
