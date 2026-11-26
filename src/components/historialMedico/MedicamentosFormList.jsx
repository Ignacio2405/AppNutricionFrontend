import { CustomInput } from "../ui/CustomInput.jsx";
import { CustomButton } from "../ui/CustomButton";

export const MedicamentosFormList = ({
  items = [],
  idPrefix = "med",
  title = "Medicamentos y Suplementos Actuales",
  onItemChange,
  onAdd,
  onRemove,
}) => {
  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="fw-semibold text-secondary mb-0">{title}</h6>
        <CustomButton type="button" variant="outline-success" onClick={onAdd}>
          + Agregar ítem
        </CustomButton>
      </div>

      {items.map((med, index) => (
        <div
          className="row align-items-end mb-2"
          key={med._id || `${idPrefix}-${index}`}
        >
          <div className="col-md-4">
            <CustomInput
              label={index === 0 ? "Nombre" : undefined}
              id={`${idPrefix}-nombre-${index}`}
              name={`${idPrefix}-nombre-${index}`}
              value={med.nombre}
              onChange={(e) => onItemChange(index, "nombre", e.target.value)}
              placeholder="Ej. Levotiroxina / Vitamina D"
            />
          </div>
          <div className="col-md-3">
            <CustomInput
              label={index === 0 ? "Dosis" : undefined}
              id={`${idPrefix}-dosis-${index}`}
              name={`${idPrefix}-dosis-${index}`}
              value={med.dosis}
              onChange={(e) => onItemChange(index, "dosis", e.target.value)}
              placeholder="Ej. 75 mcg"
            />
          </div>
          <div className="col-md-3">
            <CustomInput
              label={index === 0 ? "Frecuencia" : undefined}
              id={`${idPrefix}-frecuencia-${index}`}
              name={`${idPrefix}-frecuencia-${index}`}
              value={med.frecuencia}
              onChange={(e) =>
                onItemChange(index, "frecuencia", e.target.value)
              }
              placeholder="Ej. 1 vez al día"
            />
          </div>
          <div className="col-md-2 mb-3">
            <CustomButton
              type="button"
              variant="outline-danger"
              onClick={() => onRemove(index)}
            >
              Quitar
            </CustomButton>
          </div>
        </div>
      ))}
    </>
  );
};
