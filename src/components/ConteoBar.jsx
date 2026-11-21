import { useState } from "react";
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

// pendientes: cantidad de productos editados sin guardar
// onGuardar: async () => { error } — sube a Supabase los cambios del borrador
// onDescartar: vuelve a los valores guardados
export default function ConteoBar({ tipo, pendientes = 0, onGuardar, onDescartar }) {
  const { ultimoConteo, loading, guardando: registrando, finalizarConteo } = useConteo(tipo);
  const [subiendo, setSubiendo] = useState(false);
  const [mensaje, setMensaje] = useState(null);

  if (loading) return null;

  const ocupado = subiendo || registrando;
  const fechaTexto = formatearFecha(ultimoConteo);

  const handleGuardar = async () => {
    setMensaje(null);

    if (pendientes > 0 && onGuardar) {
      setSubiendo(true);
      const { error } = await onGuardar();
      setSubiendo(false);
      if (error) {
        setMensaje({
          tipo: "error",
          texto: "No se pudieron guardar los cambios. Revisá la conexión y probá de nuevo (no se perdió nada).",
        });
        return;
      }
    }

    // Registra el conteo (lo que ve la pestaña admin y dispara el aviso)
    const { error } = await finalizarConteo();
    if (error) {
      setMensaje({ tipo: "error", texto: "Se guardó el stock, pero no se pudo registrar el conteo. Probá de nuevo." });
    } else {
      setMensaje({ tipo: "ok", texto: "Stock guardado ✔" });
      setTimeout(() => setMensaje(null), 3000);
    }
  };

  const handleDescartar = () => {
    if (window.confirm(`¿Descartar ${pendientes} cambio${pendientes !== 1 ? "s" : ""} sin guardar?`)) {
      onDescartar?.();
    }
  };

  return (
    <div className="flex flex-col gap-2 mb-3">
      <div
        className={`flex items-center justify-between gap-3 border rounded-xl px-4 py-3 transition-colors ${
          pendientes > 0 ? "bg-amber-50 border-amber-200" : "bg-gray-50 border-gray-100"
        }`}
      >
        <div className="flex flex-col min-w-0">
          {pendientes > 0 ? (
            <>
              <span className="text-[13px] font-medium text-amber-700">
                {pendientes} producto{pendientes !== 1 ? "s" : ""} sin guardar
              </span>
              {onDescartar && (
                <button
                  type="button"
                  onClick={handleDescartar}
                  disabled={ocupado}
                  className="text-[11px] text-amber-600 underline text-left w-fit disabled:opacity-50"
                >
                  Descartar cambios
                </button>
              )}
            </>
          ) : (
            <>
              <span className="text-[11px] text-gray-400 uppercase tracking-wide">
                Último guardado
              </span>
              <span className={`text-[13px] font-medium ${fechaTexto ? "text-gray-900" : "text-gray-400"}`}>
                {fechaTexto || "Aún no se hizo hoy"}
              </span>
            </>
          )}
        </div>
        <button
          onClick={handleGuardar}
          disabled={ocupado}
          className={`text-white rounded-full px-4 py-2 text-[13px] font-medium active:scale-[0.98] transition-all disabled:opacity-50 whitespace-nowrap ${
            pendientes > 0 ? "bg-amber-600 hover:bg-amber-700" : "bg-gray-900 hover:bg-gray-800"
          }`}
        >
          {ocupado ? "Guardando..." : "Guardar stock"}
        </button>
      </div>

      {/* Zona flotante inferior: aviso + botón, siempre a mano mientras se recorren las cards */}
      {(pendientes > 0 || mensaje) && (
        <div className="fixed bottom-0 inset-x-0 z-20 pointer-events-none">
          <div className="max-w-sm mx-auto px-4 pb-4 flex flex-col gap-2">
            {mensaje && (
              <p
                className={`pointer-events-auto text-[13px] font-medium rounded-xl px-4 py-2.5 shadow-md ${
                  mensaje.tipo === "ok" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
                }`}
              >
                {mensaje.texto}
              </p>
            )}
            {pendientes > 0 && (
            <div className="pointer-events-auto flex items-center justify-between gap-3 bg-gray-900 text-white rounded-2xl px-4 py-3 shadow-lg">
              <span className="text-[13px]">
                {pendientes} sin guardar
              </span>
              <button
                onClick={handleGuardar}
                disabled={ocupado}
                className="bg-amber-500 hover:bg-amber-600 text-gray-900 rounded-full px-4 py-2 text-[13px] font-semibold active:scale-[0.98] transition-all disabled:opacity-50 whitespace-nowrap"
              >
                {ocupado ? "Guardando..." : "Guardar stock"}
              </button>
            </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
