import { useState } from "react";
import { useComparacion } from "../hooks/useComparacion";
import { useValorizado } from "../hooks/useValorizado";
import ResumenConteos from "../components/ResumenConteos";

// ─── Tarjeta de producto (solo lectura) ─────────────────────────────
const fmt = (n) =>
  "$" + Number(n).toLocaleString("es-AR", { minimumFractionDigits: 0 });

function TarjetaComparacion({ producto }) {
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

        <div
          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[12px] font-medium ${
            coincide ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
          }`}
        >
          <span>{coincide ? "✓" : "✕"}</span>
          {!coincide && <span>{diferencia > 0 ? `+${diferencia}` : diferencia}</span>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-gray-400 uppercase tracking-wide">Físico</label>
          <div className="border border-gray-100 bg-gray-50 rounded-lg px-3 py-2 text-[14px] text-gray-700">
            {producto.cantidad_fisico} {producto.unidad}
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-gray-400 uppercase tracking-wide">Sistema</label>
          <div className="border border-gray-100 bg-gray-50 rounded-lg px-3 py-2 text-[14px] text-gray-700">
            {producto.cantidad_sistema} {producto.unidad}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Métricas ───────────────────────────────────────────────────────
function MetricCard({ label, value, accent = false }) {
  return (
    <div className="bg-gray-50 rounded-xl p-4 flex flex-col gap-1">
      <p className="text-[11px] text-gray-400 uppercase tracking-wide font-medium">{label}</p>
      <p className={`text-2xl font-medium ${accent ? "text-emerald-600" : "text-gray-900"}`}>
        {value}
      </p>
    </div>
  );
}

// ─── App principal ──────────────────────────────────────────────────
export default function StockAdmin() {
  const { productos, loading } = useComparacion();
  const { valorFisico, valorVerduleria, loading: loadingValorizado } = useValorizado();
  const [busqueda, setBusqueda] = useState("");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400 text-sm">Cargando...</p>
      </div>
    );
  }

  const productosFiltrados = productos
    .filter((p) =>
      p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      (p.categoria || "").toLowerCase().includes(busqueda.toLowerCase())
    )
    .sort((a, b) => {
      const catA = (a.categoria || "Sin categoría").toLowerCase();
      const catB = (b.categoria || "Sin categoría").toLowerCase();
      if (catA !== catB) return catA.localeCompare(catB);
      return a.nombre.localeCompare(b.nombre);
    });

  const totalDiferencias = productos.filter(
    (p) => p.cantidad_fisico - p.cantidad_sistema !== 0
  ).length;

  return (
    <div className="min-h-screen bg-white max-w-sm mx-auto flex flex-col">

      {/* Header sticky */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 pt-4 pb-3">
        <div className="flex items-center gap-2 mb-0.5">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-700">
            <path d="M9 11l3 3L22 4"/>
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
          </svg>
          <h1 className="text-[18px] font-medium text-gray-900">Comparación de stock</h1>
        </div>
        <p className="text-xs text-gray-400 mb-3">
          JUALMAL · Solo lectura · {totalDiferencias === 0 ? "Todo coincide" : `${totalDiferencias} con diferencia`}
        </p>

        {/* Buscador */}
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            width="15" height="15" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.3-4.3"/>
          </svg>
          <input
            type="text"
            placeholder="Buscar por nombre o categoría..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full border border-gray-200 rounded-lg pl-9 pr-8 py-2 text-[14px] text-gray-900 focus:outline-none focus:border-gray-400 transition-colors"
          />
          {busqueda && (
            <button
              onClick={() => setBusqueda("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg leading-none"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Contenido */}
      <div className="flex-1 px-4 py-4 flex flex-col gap-3 pb-8">
        <div className="grid grid-cols-2 gap-3">
          <MetricCard label="Stock Físico" value={fmt(valorFisico)} accent />
          <MetricCard label="Stock Verdulería" value={fmt(valorVerduleria)} accent />
        </div>
        <ResumenConteos />

        <div className="grid grid-cols-2 gap-3">
          <MetricCard label="Productos" value={productos.length} />
          <MetricCard
            label="Diferencias"
            value={totalDiferencias}
            accent={totalDiferencias === 0}
          />
        </div>

        {busqueda && (
          <p className="text-[12px] text-gray-400">
            {productosFiltrados.length === 0
              ? `Sin resultados para "${busqueda}"`
              : `${productosFiltrados.length} resultado${productosFiltrados.length !== 1 ? "s" : ""} para "${busqueda}"`}
          </p>
        )}

        {productosFiltrados.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-4xl mb-2">{busqueda ? "🔍" : "📦"}</p>
            <p className="text-sm">
              {busqueda ? `No encontramos "${busqueda}"` : "Sin productos aún."}
            </p>
          </div>
        ) : (
          productosFiltrados.map((p) => (
            <TarjetaComparacion key={p.id} producto={p} />
          ))
        )}
      </div>
    </div>
  );
}
