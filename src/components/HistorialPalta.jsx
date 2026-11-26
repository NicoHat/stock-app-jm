// src/components/HistorialPalta.jsx
// Historial de palta decomisada (tabla avocado_waste). Solo lectura.
// Se usa en Admin y en Stock Sistema.
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export default function HistorialPalta() {
  const [desperdicios, setDesperdicios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let activo = true;

    async function cargar() {
      const { data, error } = await supabase
        .from("avocado_waste")
        .select("*")
        .order("recorded_date", { ascending: false });

      if (!activo) return;
      if (error) console.error("Error al cargar desperdicios:", error);
      else setDesperdicios(data || []);
      setLoading(false);
    }

    cargar();

    // Si alguien registra palta decomisada, se actualiza solo
    const canal = supabase
      .channel(`historial_palta_${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "avocado_waste" }, cargar)
      .subscribe();

    return () => {
      activo = false;
      supabase.removeChannel(canal);
    };
  }, []);

  const totalKg = desperdicios.reduce((acc, d) => acc + Number(d.quantity_kg || 0), 0);

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-[14px] font-medium text-gray-900">🥑 Desperdicios de Palta</span>
        <span className="text-[12px] text-emerald-600 font-medium">
          Total: {totalKg.toFixed(1)} kg
        </span>
      </div>

      {loading ? (
        <p className="text-[12px] text-gray-400 text-center py-2">Cargando registros...</p>
      ) : desperdicios.length === 0 ? (
        <p className="text-[12px] text-gray-400 text-center py-2">No hay registros de desperdicio aún.</p>
      ) : (
        <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1">
          {desperdicios.map((item) => (
            <div
              key={item.id}
              className="flex flex-col gap-0.5 bg-white border border-gray-100 rounded-lg px-3 py-2 text-[13px]"
            >
              <div className="flex justify-between items-center">
                <span className="text-gray-500">{item.recorded_date}</span>
                <span className="font-medium text-gray-900">{item.quantity_kg} kg</span>
              </div>
              {item.descripcion && (
                <span className="text-[12px] text-gray-500 italic">{item.descripcion}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
