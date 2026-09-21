// src/components/ProductCard.jsx
export default function ProductCard({ producto, onUpdate }) {
  const subtotal = (producto.cantidad || 0) * (producto.precio || 0);

  // Helper opcional local por si lo usas en esta card
  const fmt = (n) =>
    "$" + Number(n || 0).toLocaleString("es-AR", { minimumFractionDigits: 0 });

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
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-gray-400 uppercase tracking-wide">Cantidad</label>
          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() =>
                onUpdate(producto.id, {
                  cantidad: Math.max(0, (producto.cantidad || 0) - 1),
                })
              }
              className="px-3 py-2 text-gray-500 hover:bg-gray-100 active:bg-gray-200 transition-colors text-lg font-medium"
            >
              −
            </button>
            <input
              type="number"
              min="0"
              value={producto.cantidad}
              onFocus={(e) => e.target.select()}
              onChange={(e) => {
                const val = e.target.value === "" ? 0 : Number(e.target.value);
                onUpdate(producto.id, { cantidad: val });
              }}
              className="flex-1 text-center text-[14px] text-gray-900 focus:outline-none py-2 w-0"
            />
            <button
              type="button"
              onClick={() =>
                onUpdate(producto.id, {
                  cantidad: (producto.cantidad || 0) + 1,
                })
              }
              className="px-3 py-2 text-gray-500 hover:bg-gray-100 active:bg-gray-200 transition-colors text-lg font-medium"
            >
              +
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-gray-400 uppercase tracking-wide">Precio costo</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={producto.precio}
            onChange={(e) =>
              onUpdate(producto.id, { precio: Number(e.target.value) })
            }
            className="border border-gray-200 rounded-lg px-3 py-2 text-[14px] text-gray-900 focus:outline-none focus:border-gray-400 transition-colors"
          />
        </div>
      </div>

      {/* Observaciones */}
      <div className="flex flex-col gap-1">
        <label className="text-[11px] text-gray-400 uppercase tracking-wide">Observaciones</label>
        <textarea
          rows={2}
          placeholder="Notas sobre este producto (vencimiento, proveedor, estado...)"
          value={producto.observaciones || ""}
          onChange={(e) =>
            onUpdate(producto.id, { observaciones: e.target.value })
          }
          className="border border-gray-200 rounded-lg px-3 py-2 text-[13px] text-gray-900 resize-none focus:outline-none focus:border-gray-400 transition-colors"
        />
      </div>

      <div className="flex justify-between items-center pt-2 border-t border-gray-100">
        <span className="text-xs text-gray-400">Subtotal ({producto.unidad || "unidad"})</span>
        <span className="text-[15px] font-medium text-emerald-600">{fmt(subtotal)}</span>
      </div>
    </div>
  );
}