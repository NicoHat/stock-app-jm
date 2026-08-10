import { useStockSistema } from "../hooks/useStockSistema";

function TarjetaSistema({ producto, onUpdate }) {
  const diferencia = producto.cantidad_fisico - producto.cantidad_sistema;
  const coincide = diferencia === 0;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col gap-3">
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-1.5">
          <p className="text-[15px] font-medium text-gray-900">{producto.nombre}</p>
          {producto.categoria ? (
            <span className="inline-flex w-fit items-center px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[11px] font-medium">
              {producto.categoria}
            </span>
          ) : (
            <span className="text-xs text-gray-400">Sin categoría</span>
          )}
        </div>

        {/* Indicador de diferencia */}
        <div
          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[12px] font-medium ${
            coincide
              ? "bg-emerald-50 text-emerald-600"
              : "bg-red-50 text-red-600"
          }`}
        >
          <span>{coincide ? "✓" : "✕"}</span>
          {!coincide && (
            <span>{diferencia > 0 ? `+${diferencia}` : diferencia}</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-gray-400 uppercase tracking-wide">Físico</label>
          <div className="border border-gray-100 bg-gray-50 rounded-lg px-3 py-2 text-[14px] text-gray-500">
            {producto.cantidad_fisico} {producto.unidad}
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-gray-400 uppercase tracking-wide">Sistema</label>
          <input
            type="number"
            min="0"
            value={producto.cantidad_sistema}
            onChange={(e) =>
              onUpdate(producto.id, producto.stock_sistema_id, Number(e.target.value))
            }
            className="border border-gray-200 rounded-lg px-3 py-2 text-[14px] text-gray-900 focus:outline-none focus:border-gray-400 transition-colors"
          />
        </div>
      </div>
    </div>
  );
}

export default function StockSistema() {
  const { productos, loading, actualizarCantidad } = useStockSistema();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400 text-sm">Cargando...</p>
      </div>
    );
  }

  const totalDiferencias = productos.filter(
    (p) => p.cantidad_fisico - p.cantidad_sistema !== 0
  ).length;

  return (
    <div className="min-h-screen bg-white max-w-sm mx-auto flex flex-col">
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 pt-4 pb-3">
        <div className="flex items-center gap-2 mb-0.5">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-700">
            <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
            <path d="m3.3 7 8.7 5 8.7-5M12 22V12"/>
          </svg>
          <h1 className="text-[18px] font-medium text-gray-900">Stock de sistema</h1>
        </div>
        <p className="text-xs text-gray-400">
          JUALMAL · {totalDiferencias === 0 ? "Todo coincide" : `${totalDiferencias} con diferencia`}
        </p>
      </div>

      <div className="flex-1 px-4 py-4 flex flex-col gap-3 pb-8">
        {productos.map((p) => (
          <TarjetaSistema key={p.id} producto={p} onUpdate={actualizarCantidad} />
        ))}
      </div>
    </div>
  );
}