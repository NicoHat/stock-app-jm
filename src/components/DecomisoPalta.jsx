// src/components/DecomisoPalta.jsx
// Registro diario de palta decomisada (tabla avocado_waste), con descripción libre.
import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function DecomisoPalta() {
  const [kilos, setKilos] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState(null);

  const guardar = async () => {
    const cantidadKg = parseFloat(String(kilos).replace(",", "."));
    if (!cantidadKg || cantidadKg <= 0) {
      setMensaje({ tipo: "error", texto: "Ingresá una cantidad válida en kg." });
      return;
    }

    setGuardando(true);
    setMensaje(null);
    const { error } = await supabase
      .from("avocado_waste")
      .insert([{ quantity_kg: cantidadKg, descripcion: descripcion.trim() || null }]);
    setGuardando(false);

    if (error) {
      console.error("Error al guardar desperdicio:", error);
      setMensaje({ tipo: "error", texto: "No se pudo guardar. Probá de nuevo." });
    } else {
      setMensaje({ tipo: "ok", texto: "Decomiso de palta guardado ✔" });
      setKilos("");
      setDescripcion("");
      setTimeout(() => setMensaje(null), 3000);
    }
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-[14px] font-medium text-gray-900">🥑 Decomiso de palta</span>
        <span className="text-[12px] text-gray-400">Registro diario</span>
      </div>

      <input
        type="number"
        inputMode="decimal"
        step="0.1"
        min="0"
        placeholder="Cantidad en kg..."
        value={kilos}
        onChange={(e) => setKilos(e.target.value)}
        className="border border-gray-200 rounded-lg px-3 py-2 text-[14px] bg-white text-gray-900 focus:outline-none focus:border-gray-400 transition-colors"
      />

      <textarea
        rows={2}
        placeholder="Descripción (ej: calibre 70, marca Baika, golpeada...)"
        value={descripcion}
        onChange={(e) => setDescripcion(e.target.value)}
        className="border border-gray-200 rounded-lg px-3 py-2 text-[13px] bg-white text-gray-900 resize-none focus:outline-none focus:border-gray-400 transition-colors"
      />

      {mensaje && (
        <p className={`text-[12px] ${mensaje.tipo === "ok" ? "text-emerald-600" : "text-red-500"}`}>
          {mensaje.texto}
        </p>
      )}

      <button
        onClick={guardar}
        disabled={guardando}
        className="bg-gray-900 text-white px-4 py-2 rounded-lg text-[14px] font-medium hover:bg-gray-800 active:scale-[0.98] transition-all disabled:opacity-50"
      >
        {guardando ? "Guardando..." : "Guardar decomiso"}
      </button>
    </div>
  );
}
