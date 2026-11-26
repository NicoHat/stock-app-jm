import { useState } from "react";

// Input numérico que deja tipear libre (vacío, "1.", "0,5") mientras está enfocado
// y le pasa al padre el número ya parseado.
export default function CampoNumero({ value, onChange, className, ...rest }) {
  const [texto, setTexto] = useState("");
  const [enfocado, setEnfocado] = useState(false);

  return (
    <input
      type="number"
      {...rest}
      value={enfocado ? texto : value ?? ""}
      onFocus={(e) => {
        setTexto(value === undefined || value === null ? "" : String(value));
        setEnfocado(true);
        const el = e.target;
        requestAnimationFrame(() => el.select());
      }}
      onBlur={() => setEnfocado(false)}
      onChange={(e) => {
        const raw = e.target.value;
        setTexto(raw);
        // Número a medio escribir (ej. "1."): esperamos a que termine
        if (e.target.validity?.badInput) return;
        const num = raw === "" ? 0 : Number(raw.replace(",", "."));
        if (!Number.isNaN(num)) onChange(Math.max(0, num));
      }}
      className={className}
    />
  );
}
