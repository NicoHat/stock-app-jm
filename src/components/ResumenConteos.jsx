import { useConteo } from "../hooks/useConteo";

const formatearFecha = (iso) => {
  if (!iso) return null;
  return new Date(iso).toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

function FilaConteo({ label, tipo }) {
  const { ultimoConteo, loading } = useConteo(tipo);
  const fechaTexto = formatearFecha(ultimoConteo);

  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
      <span className="text-[13px] text-gray-600">{label}</span>
      {loading ? (
        <span className="text-[12px] text-gray-300">...</span>
      ) : (
        <span className={`text-[12px] font-medium ${fechaTexto ? "text-emerald-600" : "text-gray-400"}`}>
          {fechaTexto || "Aún no se hizo"}
        </span>
      )}
    </div>
  );
}

export default function ResumenConteos() {
  return (
    <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 mb-3">
      <p className="text-[11px] text-gray-400 uppercase tracking-wide font-medium pt-1.5">
        Últimos conteos finalizados
      </p>
      <FilaConteo label="Físico" tipo="fisico" />
      <FilaConteo label="Sistema" tipo="sistema" />
      <FilaConteo label="Verdulería" tipo="verduleria" />
    </div>
  );
}
