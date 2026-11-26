// src/components/PaltaCard.jsx
// Card de un calibre de palta: el total sale de la suma de sus marcas.
// En el conteo se carga solo marca + kg; los precios van aparte y se recuerdan.
import { memo, useState } from "react";
import CampoNumero from "./CampoNumero";
import { saltarAlSiguiente } from "../utils/teclado";
import { totalesPalta, precioSugerido } from "../utils/palta";

const fmt = (n) =>
  "$" + Number(n || 0).toLocaleString("es-AR", { minimumFractionDigits: 0 });

const fmtKg = (n) =>
  Number(n || 0).toLocaleString("es-AR", { maximumFractionDigits: 3 });

function PaltaCard({ producto, onUpdate, modificado = false, sugerencias = [], precios }) {
  const [verPrecios, setVerPrecios] = useState(false);
  const marcas = producto.marcas || [];
  const { kg, valor } = totalesPalta(marcas);
  const unidad = producto.unidad || "kg";
  const listaId = `marcas-palta-${producto.id}`;
  const sinPrecio = marcas.filter((m) => (m.marca || m.kg > 0) && !(Number(m.precio) > 0)).length;

  const cambiarMarcas = (nuevas) => onUpdate(producto.id, { marcas: nuevas });

  const editarFila = (i, parcial) =>
    cambiarMarcas(
      marcas.map((m, j) => {
        if (j !== i) return m;
        const fila = { ...m, ...parcial };
        // Si se escribe una marca conocida y la fila no tiene precio, se completa solo
        if ("marca" in parcial && !(Number(fila.precio) > 0)) {
          const sugerido = precioSugerido(precios, producto.id, fila.marca);
          if (sugerido > 0) fila.precio = sugerido;
        }
        return fila;
      })
    );

  const agregarFila = () => cambiarMarcas([...marcas, { marca: "", kg: 0, precio: 0 }]);

  const quitarFila = (i) => {
    const m = marcas[i];
    if ((m.marca || m.kg > 0) && !window.confirm(`¿Quitar ${m.marca || "esta fila"}?`)) return;
    cambiarMarcas(marcas.filter((_, j) => j !== i));
  };

  return (
    <div
      className={`bg-white border rounded-xl p-4 flex flex-col gap-3 transition-colors ${
        modificado ? "border-amber-300" : "border-gray-200"
      }`}
    >
      {/* Encabezado: calibre + total */}
      <div className="flex justify-between items-start gap-2">
        <div className="flex flex-col gap-1.5">
          <p className="text-[15px] font-medium text-gray-900">🥑 {producto.nombre}</p>
          <div className="flex items-center gap-1.5 flex-wrap">
            {producto.categoria && (
              <span className="inline-flex w-fit items-center px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[11px] font-medium">
                {producto.categoria}
              </span>
            )}
            {modificado && (
              <span className="text-[11px] font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                Sin guardar
              </span>
            )}
          </div>
        </div>
        <div className="text-right">
          <p className="text-[20px] font-semibold text-gray-900 leading-tight">
            {fmtKg(kg)} <span className="text-[13px] font-medium text-gray-500">{unidad}</span>
          </p>
          <p className="text-[11px] text-gray-400">
            {marcas.length} marca{marcas.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Conteo: marca + cantidad */}
      {marcas.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="grid grid-cols-[1fr_96px_24px] gap-2 px-0.5">
            <span className="text-[10px] text-gray-400 uppercase tracking-wide">Marca</span>
            <span className="text-[10px] text-gray-400 uppercase tracking-wide text-center">Cantidad ({unidad})</span>
            <span />
          </div>

          {marcas.map((m, i) => (
            <div key={i} className="grid grid-cols-[1fr_96px_24px] gap-2 items-center">
              <input
                type="text"
                list={listaId}
                placeholder="Ej: Baika"
                autoFocus={i === marcas.length - 1 && m.marca === "" && !m.kg}
                value={m.marca}
                onChange={(e) => editarFila(i, { marca: e.target.value })}
                className="min-w-0 border border-gray-200 rounded-lg px-2.5 py-2 text-[14px] text-gray-900 focus:outline-none focus:border-gray-400"
              />
              <CampoNumero
                min="0"
                step="any"
                value={m.kg}
                data-campo="cantidad"
                enterKeyHint="next"
                onKeyDown={saltarAlSiguiente}
                onChange={(kgFila) => editarFila(i, { kg: kgFila })}
                className="min-w-0 border border-gray-200 rounded-lg px-2 py-2 text-[14px] text-gray-900 text-center focus:outline-none focus:border-gray-400"
              />
              <button
                type="button"
                onClick={() => quitarFila(i)}
                aria-label={`Quitar ${m.marca || "fila"}`}
                className="text-gray-300 hover:text-red-500 text-lg leading-none"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <datalist id={listaId}>
        {sugerencias.map((s) => (
          <option key={s} value={s} />
        ))}
      </datalist>

      <button
        type="button"
        onClick={agregarFila}
        className="w-full border border-dashed border-gray-300 rounded-lg py-2 text-[13px] text-gray-600 hover:border-gray-400 hover:bg-gray-50 active:scale-[0.99] transition-all"
      >
        + Agregar marca
      </button>

      {/* Precios: aparte del conteo, se cargan cuando se tengan */}
      {marcas.length > 0 && (
        <div className="flex flex-col gap-2 pt-2 border-t border-gray-100">
          <button
            type="button"
            onClick={() => setVerPrecios((v) => !v)}
            className="flex items-center justify-between text-left"
          >
            <span className="text-[11px] text-gray-400 uppercase tracking-wide">
              Precio costo por marca
            </span>
            <span className="flex items-center gap-2">
              {sinPrecio > 0 && (
                <span className="text-[11px] font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                  {sinPrecio} sin precio
                </span>
              )}
              <span className="text-gray-400 text-[12px]">{verPrecios ? "▲" : "▼"}</span>
            </span>
          </button>

          {verPrecios &&
            marcas.map((m, i) => (
              <div key={i} className="grid grid-cols-[1fr_120px] gap-2 items-center">
                <span className={`text-[13px] truncate ${m.marca ? "text-gray-700" : "text-gray-400 italic"}`}>
                  {m.marca || "Sin marca"}{" "}
                  <span className="text-gray-400">· {fmtKg(m.kg)} {unidad}</span>
                </span>
                <CampoNumero
                  min="0"
                  step="0.01"
                  placeholder={`$ x ${unidad}`}
                  value={m.precio || ""}
                  onChange={(precio) => editarFila(i, { precio })}
                  className="min-w-0 border border-gray-200 rounded-lg px-2 py-2 text-[14px] text-gray-900 text-center focus:outline-none focus:border-gray-400"
                />
              </div>
            ))}
        </div>
      )}

      <div className="flex justify-between items-center pt-2 border-t border-gray-100">
        <span className="text-xs text-gray-400">Subtotal</span>
        <span className="text-[15px] font-medium text-emerald-600">{fmt(valor)}</span>
      </div>
    </div>
  );
}

export default memo(PaltaCard);
