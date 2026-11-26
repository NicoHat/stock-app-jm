// src/components/ProductCard.jsx
import { memo } from "react";
import CampoNumero from "./CampoNumero";
import { saltarAlSiguiente } from "../utils/teclado";

const fmt = (n) =>
  "$" + Number(n || 0).toLocaleString("es-AR", { minimumFractionDigits: 0 });

function ProductCard({ producto, onUpdate, modificado = false, soloCantidad = false }) {
  const subtotal = (producto.cantidad || 0) * (producto.precio || 0);

  return (
    <div
      className={`bg-white border rounded-xl p-4 flex flex-col gap-3 transition-colors ${
        modificado ? "border-amber-300" : "border-gray-200"
      }`}
    >
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
        {modificado && (
          <span className="text-[11px] font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full whitespace-nowrap">
            Sin guardar
          </span>
        )}
      </div>

      <div className={`grid ${soloCantidad ? "grid-cols-1" : "grid-cols-2"} gap-3`}>
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
            <CampoNumero
              min="0"
              step="any"
              value={producto.cantidad}
              data-campo="cantidad"
              enterKeyHint="next"
              onKeyDown={saltarAlSiguiente}
              onChange={(cantidad) => onUpdate(producto.id, { cantidad })}
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

        {!soloCantidad && (
          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-gray-400 uppercase tracking-wide">Precio costo</label>
            <CampoNumero
              min="0"
              step="0.01"
              value={producto.precio}
              onChange={(precio) => onUpdate(producto.id, { precio })}
              className="border border-gray-200 rounded-lg px-3 py-2 text-[14px] text-gray-900 focus:outline-none focus:border-gray-400 transition-colors"
            />
          </div>
        )}
      </div>

      {!soloCantidad && (
        <>
          {/* Observaciones */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-gray-400 uppercase tracking-wide">Observaciones</label>
            <textarea
              rows={2}
              placeholder="Notas sobre este producto (vencimiento, proveedor, estado...)"
              value={producto.observaciones || ""}
              onChange={(e) => onUpdate(producto.id, { observaciones: e.target.value })}
              className="border border-gray-200 rounded-lg px-3 py-2 text-[13px] text-gray-900 resize-none focus:outline-none focus:border-gray-400 transition-colors"
            />
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-gray-100">
            <span className="text-xs text-gray-400">Subtotal ({producto.unidad || "unidad"})</span>
            <span className="text-[15px] font-medium text-emerald-600">{fmt(subtotal)}</span>
          </div>
        </>
      )}
    </div>
  );
}

// memo: al tipear en una card, el resto no se vuelve a dibujar
export default memo(ProductCard);
