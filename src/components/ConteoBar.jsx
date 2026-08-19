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

export default function ConteoBar({ tipo }) {
  const { ultimoConteo, loading, guardando, finalizarConteo } = useConteo(tipo);

  if (loading) return null;

  const fechaTexto = formatearFecha(ultimoConteo);

  return (
    <div className="flex items-center justify-between gap-3 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 mb-3">
      <div className="flex flex-col">
        <span className="text-[11px] text-gray-400 uppercase tracking-wide">
          Último conteo finalizado
        </span>
        <span className={`text-[13px] font-medium ${fechaTexto ? "text-gray-900" : "text-gray-400"}`}>
          {fechaTexto || "Aún no se hizo hoy"}
        </span>
      </div>
      <button
        onClick={finalizarConteo}
        disabled={guardando}
        className="bg-gray-900 text-white rounded-full px-4 py-2 text-[13px] font-medium hover:bg-gray-800 active:scale-[0.98] transition-all disabled:opacity-50 whitespace-nowrap"
      >
        {guardando ? "Guardando..." : "Finalizar conteo"}
      </button>
    </div>
  );
}
