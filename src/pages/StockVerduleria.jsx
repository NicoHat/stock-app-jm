import { useState, useEffect } from "react";
import { useVerduleria } from "../hooks/useVerduleria";
import { compartirPDF, compartirWhatsApp, compartirEmail } from "../utils/exportPDF";
import { exportarExcel } from "../utils/exportExcel";
import ConteoBar from "../components/ConteoBar";
import ProductCard from "../components/ProductCard";
import { supabase } from "../lib/supabase";

// ─── Helpers ───────────────────────────────────────────────────────
const fmt = (n) =>
  "$" + Number(n).toLocaleString("es-AR", { minimumFractionDigits: 0 });

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

// ─── Pantalla Desperdicios ──────────────────────────────────────────
function Desperdicios({ productos }) {
  const [productoId, setProductoId] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]);
  const [observaciones, setObservaciones] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [listaDesperdicios, setListaDesperdicios] = useState([]);
  const [cargandoLista, setCargandoLista] = useState(true);

  useEffect(() => {
    cargarDesperdicios();
  }, []);

  const cargarDesperdicios = async () => {
    setCargandoLista(true);
    try {
      const { data, error } = await supabase
        .from("desperdicios_verduleria")
        .select("*")
        .order("fecha", { ascending: false });
      if (!error && data) setListaDesperdicios(data);
    } catch (e) {
      console.error(e);
    } finally {
      setCargandoLista(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!productoId || !cantidad) return;
    setGuardando(true);
    setMensaje(null);

    const productoSeleccionado = productos.find((p) => p.id === productoId);

    const nuevoRegistro = {
      producto_id: productoId,
      nombre_producto: productoSeleccionado ? productoSeleccionado.nombre : "",
      cantidad: Number(cantidad),
      fecha,
      observaciones: observaciones.trim(),
    };

    const { error } = await supabase
      .from("desperdicios_verduleria")
      .insert([nuevoRegistro]);

    setGuardando(false);

    if (error) {
      setMensaje({ tipo: "error", texto: "No se pudo registrar. Probá de nuevo." });
    } else {
      setMensaje({ tipo: "ok", texto: "Desperdicio registrado correctamente." });
      setCantidad("");
      setObservaciones("");
      setProductoId("");
      cargarDesperdicios();
    }
  };

  const handleExportarExcel = () => {
    exportarExcel(listaDesperdicios, "desperdicios_verduleria", [
      { header: "Fecha", key: "fecha" },
      { header: "Producto", key: "nombre_producto" },
      { header: "Cantidad (kg/u)", key: "cantidad" },
      { header: "Observaciones", key: "observaciones" },
    ]);
  };

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col gap-3">
        <h3 className="text-[14px] font-medium text-gray-900">Registrar merma / desperdicio</h3>
        
        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-gray-400 uppercase tracking-wide">Producto</label>
          <select
            required
            value={productoId}
            onChange={(e) => setProductoId(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-[14px] text-gray-900 bg-white focus:outline-none focus:border-gray-400 transition-colors"
          >
            <option value="">Seleccionar producto...</option>
            {productos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre} ({p.unidad})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-gray-400 uppercase tracking-wide">Cantidad</label>
            <input
              type="number"
              step="0.01"
              min="0"
              required
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              placeholder="Ej: 2.5"
              className="border border-gray-200 rounded-lg px-3 py-2 text-[14px] text-gray-900 bg-white focus:outline-none focus:border-gray-400 transition-colors"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-gray-400 uppercase tracking-wide">Fecha</label>
            <input
              type="date"
              required
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-[14px] text-gray-900 bg-white focus:outline-none focus:border-gray-400 transition-colors"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-gray-400 uppercase tracking-wide">Observaciones (Opcional)</label>
          <input
            type="text"
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            placeholder="Ej: Golpeado, maduración excesiva..."
            className="border border-gray-200 rounded-lg px-3 py-2 text-[14px] text-gray-900 bg-white focus:outline-none focus:border-gray-400 transition-colors"
          />
        </div>

        {mensaje && (
          <p className={`text-[13px] ${mensaje.tipo === "ok" ? "text-emerald-600" : "text-red-500"}`}>
            {mensaje.texto}
          </p>
        )}

        <button
          type="submit"
          disabled={guardando}
          className="bg-gray-900 text-white rounded-full py-2.5 text-[14px] font-medium hover:bg-gray-800 active:scale-[0.99] transition-all disabled:opacity-50 mt-1"
        >
          {guardando ? "Guardando..." : "Guardar desperdicio"}
        </button>
      </form>

      <div className="flex flex-col gap-3 mt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-[14px] font-medium text-gray-900">Historial reciente</h3>
          {listaDesperdicios.length > 0 && (
            <button
              onClick={handleExportarExcel}
              className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-lg font-medium hover:bg-emerald-100 transition-all flex items-center gap-1.5"
            >
              📊 Exportar a Excel
            </button>
          )}
        </div>

        {cargandoLista ? (
          <p className="text-xs text-gray-400 text-center py-4">Cargando registros...</p>
        ) : listaDesperdicios.length === 0 ? (
          <div className="text-center py-8 text-gray-400 border border-dashed border-gray-200 rounded-xl">
            <p className="text-2xl mb-1">📋</p>
            <p className="text-xs">No hay desperdicios registrados aún.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {listaDesperdicios.map((item) => (
              <div key={item.id} className="border border-gray-100 bg-white rounded-xl p-3 flex justify-between items-center shadow-sm">
                <div>
                  <p className="text-[14px] font-medium text-gray-900">{item.nombre_producto}</p>
                  <p className="text-[12px] text-gray-500">
                    {item.cantidad} — <span className="text-gray-400">{item.fecha}</span>
                  </p>
                  {item.observaciones && (
                    <p className="text-[11px] text-gray-400 italic mt-0.5">{item.observaciones}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Pantalla compartir ─────────────────────────────────────────────
function Compartir({ productos }) {
  const empresa = "JUALMAL";

  const botones = [
    {
      icon: "📄",
      label: "Generar y compartir PDF",
      desc: "Abre el menú nativo del celular (WhatsApp, Drive, email...)",
      onClick: () => compartirPDF(productos, empresa),
    },
    {
      icon: "📊",
      label: "Exportar a Excel",
      desc: "Descarga un archivo .xlsx con todo el inventario",
      onClick: () => exportarExcel(productos, "stock_verduleria", [
        { header: "Producto", key: "nombre" },
        { header: "Categoría", key: "categoria" },
        { header: "Cantidad", key: "cantidad" },
        { header: "Unidad", key: "unidad" },
        { header: "Precio costo", key: "precio" },
        { header: "Subtotal", value: (p) => p.cantidad * p.precio },
      ]),
    },
    {
      icon: "💬",
      label: "Enviar resumen por WhatsApp",
      desc: "Texto con todos los productos y el total",
      onClick: () => compartirWhatsApp(productos, empresa),
    },
    {
      icon: "📧",
      label: "Enviar por email",
      desc: "Abre tu app de email con el resumen listo",
      onClick: () => compartirEmail(productos, empresa),
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <p className="text-[13px] text-gray-400">
        Generá el PDF y compartilo por WhatsApp, email, o cualquier app instalada en el celular.
      </p>
      {botones.map((btn) => (
        <button
          key={btn.label}
          onClick={btn.onClick}
          className="flex items-center gap-3 w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-left hover:border-gray-300 active:scale-[0.99] transition-all"
        >
          <span className="text-2xl">{btn.icon}</span>
          <div>
            <p className="text-[14px] font-medium text-gray-900">{btn.label}</p>
            <p className="text-[12px] text-gray-400">{btn.desc}</p>
          </div>
        </button>
      ))}
    </div>
  );
}

// ─── App principal ──────────────────────────────────────────────────
export default function StockVerduleria() {
  const { productos, loading, actualizar } = useVerduleria();
  const [tab, setTab] = useState("inventario");
  const [busqueda, setBusqueda] = useState("");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400 text-sm">Cargando...</p>
      </div>
    );
  }

  const productosFiltrados = productos
    .filter((p) => p.nombre.toLowerCase().includes(busqueda.toLowerCase()))
    .sort((a, b) => a.nombre.localeCompare(b.nombre));

  const valorTotal = productos.reduce((a, p) => a + (p.cantidad || 0) * (p.precio || 0), 0);
  const tabs = ["inventario", "desperdicios", "compartir"];

  return (
    <div className="min-h-screen bg-white max-w-sm mx-auto flex flex-col">

      {/* Header sticky */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 pt-4 pb-3">
        <div className="flex items-center gap-2 mb-0.5">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-700">
            <path d="M12 2c-1.5 3-4 5-4 9a4 4 0 0 0 8 0c0-4-2.5-6-4-9Z"/>
            <path d="M12 15v7"/>
          </svg>
          <h1 className="text-[18px] font-medium text-gray-900">Stock de verdulería</h1>
        </div>
        <p className="text-xs text-gray-400 mb-3">JUALMAL</p>

        {/* Tabs */}
        <div className="flex gap-2">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-full text-[13px] border transition-all capitalize ${
                tab === t
                  ? "bg-gray-900 text-white border-gray-900"
                  : "border-gray-200 text-gray-500 hover:border-gray-300"
              }`}
            >
              {t === "desperdicios" ? "Desperdicios" : t}
            </button>
          ))}
        </div>

        {/* Buscador */}
        {tab === "inventario" && (
          <div className="relative mt-3">
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
              placeholder="Buscar por nombre..."
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
        )}
      </div>

      {/* Contenido */}
      <div className="flex-1 px-4 py-4 flex flex-col gap-3 pb-8">

        {/* TAB: Inventario */}
        {tab === "inventario" && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <MetricCard label="Productos" value={productos.length} />
              <MetricCard label="Valor total" value={fmt(valorTotal)} accent />
            </div>

            <ConteoBar tipo="verduleria" />

            {busqueda && (
              <p className="text-[12px] text-gray-400">
                {productosFiltrados.length === 0
                  ? `Sin resultados para "${busqueda}"`
                  : `${productosFiltrados.length} resultado${productosFiltrados.length !== 1 ? "s" : ""} para "${busqueda}"`}
              </p>
            )}

            {productosFiltrados.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <p className="text-4xl mb-2">{busqueda ? "🔍" : "🥬"}</p>
                <p className="text-sm">
                  {busqueda ? `No encontramos "${busqueda}"` : "Sin productos aún."}
                </p>
              </div>
            ) : (
              productosFiltrados.map((p) => (
                <ProductCard key={p.id} producto={p} onUpdate={actualizar} />
              ))
            )}
          </>
        )}

        {/* TAB: Desperdicios */}
        {tab === "desperdicios" && <Desperdicios productos={productos} />}

        {/* TAB: Compartir */}
        {tab === "compartir" && <Compartir productos={productos} />}
      </div>
    </div>
  );
}