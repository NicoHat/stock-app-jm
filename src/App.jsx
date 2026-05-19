import { useState } from "react";
import { useInventario } from "./hooks/useInventario";
import { compartirPDF, compartirWhatsApp, compartirEmail } from "./utils/exportPDF";

// ─── Helpers ───────────────────────────────────────────────────────
const fmt = (n) =>
  "$" + Number(n).toLocaleString("es-AR", { minimumFractionDigits: 0 });

// ─── Tarjeta de producto ────────────────────────────────────────────
function ProductCard({ producto, onUpdate, onDelete }) {
  const subtotal = producto.cantidad * producto.precio;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col gap-3">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-[15px] font-medium text-gray-900">{producto.nombre}</p>
          <p className="text-xs text-gray-400 mt-0.5">{producto.categoria || "Sin categoría"}</p>
        </div>
        <button
          onClick={() => onDelete(producto.id)}
          className="w-7 h-7 flex items-center justify-center border border-gray-200 rounded-md text-gray-400 hover:text-gray-700 hover:border-gray-300 transition-colors text-sm"
          aria-label={`Eliminar ${producto.nombre}`}
        >
          ×
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-gray-400 uppercase tracking-wide">Cantidad</label>
          <input
            type="number"
            min="0"
            value={producto.cantidad}
            onChange={(e) => onUpdate(producto.id, { cantidad: Number(e.target.value) })}
            className="border border-gray-200 rounded-lg px-3 py-2 text-[14px] text-gray-900 focus:outline-none focus:border-gray-400 transition-colors"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-gray-400 uppercase tracking-wide">Precio costo</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={producto.precio}
            onChange={(e) => onUpdate(producto.id, { precio: Number(e.target.value) })}
            className="border border-gray-200 rounded-lg px-3 py-2 text-[14px] text-gray-900 focus:outline-none focus:border-gray-400 transition-colors"
          />
        </div>
      </div>

      <div className="flex justify-between items-center pt-2 border-t border-gray-100">
        <span className="text-xs text-gray-400">Subtotal ({producto.unidad})</span>
        <span className="text-[15px] font-medium text-emerald-600">{fmt(subtotal)}</span>
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

// ─── Formulario agregar ─────────────────────────────────────────────
function AgregarForm({ onAgregar }) {
  const [form, setForm] = useState({
    nombre: "",
    categoria: "",
    cantidad: "",
    precio: "",
    unidad: "unidad",
  });
  const [exito, setExito] = useState(false);
  const [cargando, setCargando] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.nombre || form.cantidad === "" || form.precio === "") return;
    setCargando(true);
    await onAgregar({
      nombre: form.nombre,
      categoria: form.categoria,
      cantidad: Number(form.cantidad),
      precio: Number(form.precio),
      unidad: form.unidad,
    });
    setForm({ nombre: "", categoria: "", cantidad: "", precio: "", unidad: "unidad" });
    setCargando(false);
    setExito(true);
    setTimeout(() => setExito(false), 2000);
  };

  const inputClass =
    "border border-gray-200 rounded-lg px-3 py-2 text-[14px] text-gray-900 w-full focus:outline-none focus:border-gray-400 transition-colors";

  return (
    <div className="bg-gray-50 rounded-xl p-4 flex flex-col gap-3">
      <p className="text-[14px] font-medium text-gray-900">Nuevo producto</p>

      <div className="flex flex-col gap-1">
        <label className="text-[11px] text-gray-400 uppercase tracking-wide">Nombre *</label>
        <input
          type="text"
          placeholder="Ej: Yerba mate 1kg"
          value={form.nombre}
          onChange={(e) => set("nombre", e.target.value)}
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-[11px] text-gray-400 uppercase tracking-wide">Categoría</label>
        <input
          type="text"
          placeholder="Ej: Almacén, Limpieza..."
          value={form.categoria}
          onChange={(e) => set("categoria", e.target.value)}
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-gray-400 uppercase tracking-wide">Cantidad *</label>
          <input
            type="number"
            placeholder="0"
            min="0"
            value={form.cantidad}
            onChange={(e) => set("cantidad", e.target.value)}
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-gray-400 uppercase tracking-wide">Precio *</label>
          <input
            type="number"
            placeholder="0.00"
            min="0"
            step="0.01"
            value={form.precio}
            onChange={(e) => set("precio", e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-[11px] text-gray-400 uppercase tracking-wide">Unidad</label>
        <select
          value={form.unidad}
          onChange={(e) => set("unidad", e.target.value)}
          className={inputClass}
        >
          <option value="unidad">Unidad</option>
          <option value="kg">Kilogramo (kg)</option>
          <option value="litro">Litro</option>
          <option value="caja">Caja</option>
          <option value="pack">Pack</option>
          <option value="metro">Metro</option>
          <option value="bolsa">Bolsa</option>
          <option value="docena">Docena</option>
        </select>
      </div>

      <button
        onClick={handleSubmit}
        disabled={cargando}
        className="w-full bg-gray-900 text-white rounded-lg py-2.5 text-[14px] font-medium hover:bg-gray-700 active:scale-[0.98] transition-all disabled:opacity-50"
      >
        {cargando ? "Guardando..." : "Agregar al inventario"}
      </button>

      {exito && (
        <p className="text-center text-[13px] text-emerald-600">✓ Producto guardado</p>
      )}
    </div>
  );
}

// ─── Pantalla compartir ─────────────────────────────────────────────
function Compartir({ productos }) {
  const empresa = "Mi Empresa";

  const botones = [
    {
      icon: "📄",
      label: "Generar y compartir PDF",
      desc: "Abre el menú nativo del celular (WhatsApp, Drive, email...)",
      onClick: () => compartirPDF(productos, empresa),
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
export default function App() {
  const { productos, loading, agregar, actualizar, eliminar } = useInventario();
  const [tab, setTab] = useState("inventario");
  const [busqueda, setBusqueda] = useState("");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400 text-sm">Cargando inventario...</p>
      </div>
    );
  }

  // Filtrar por nombre o categoría
  const productosFiltrados = productos.filter((p) =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    (p.categoria || "").toLowerCase().includes(busqueda.toLowerCase())
  );

  const valorTotal = productos.reduce((a, p) => a + p.cantidad * p.precio, 0);
  const tabs = ["inventario", "+ agregar", "compartir"];

  return (
    <div className="min-h-screen bg-white max-w-sm mx-auto flex flex-col">

      {/* Header sticky */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 pt-4 pb-3">
        <div className="flex items-center gap-2 mb-0.5">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-700">
            <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
            <path d="m3.3 7 8.7 5 8.7-5M12 22V12"/>
          </svg>
          <h1 className="text-[18px] font-medium text-gray-900">Control de stock</h1>
        </div>
        <p className="text-xs text-gray-400 mb-3">Mi Empresa</p>

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
              {t}
            </button>
          ))}
        </div>

        {/* Buscador — solo visible en pestaña inventario */}
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

            {/* Indicador de resultados cuando hay búsqueda activa */}
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
                  {busqueda
                    ? `No encontramos "${busqueda}"`
                    : <>Sin productos aún.<br />Usá la pestaña "+ agregar"</>}
                </p>
              </div>
            ) : (
              productosFiltrados.map((p) => (
                <ProductCard
                  key={p.id}
                  producto={p}
                  onUpdate={actualizar}
                  onDelete={eliminar}
                />
              ))
            )}
          </>
        )}

        {/* TAB: Agregar */}
        {tab === "+ agregar" && <AgregarForm onAgregar={agregar} />}

        {/* TAB: Compartir */}
        {tab === "compartir" && <Compartir productos={productos} />}
      </div>
    </div>
  );
}
import { useState } from "react";
import { useInventario } from "./hooks/useInventario";
import { compartirPDF, compartirWhatsApp, compartirEmail } from "./utils/exportPDF";

// ─── Helpers ───────────────────────────────────────────────────────
const fmt = (n) =>
  "$" + Number(n).toLocaleString("es-AR", { minimumFractionDigits: 0 });

// ─── Tarjeta de producto ────────────────────────────────────────────
function ProductCard({ producto, onUpdate, onDelete }) {
  const subtotal = producto.cantidad * producto.precio;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col gap-3">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-[15px] font-medium text-gray-900">{producto.nombre}</p>
          <p className="text-xs text-gray-400 mt-0.5">{producto.categoria || "Sin categoría"}</p>
        </div>
        <button
          onClick={() => onDelete(producto.id)}
          className="w-7 h-7 flex items-center justify-center border border-gray-200 rounded-md text-gray-400 hover:text-gray-700 hover:border-gray-300 transition-colors text-sm"
          aria-label={`Eliminar ${producto.nombre}`}
        >
          ×
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-gray-400 uppercase tracking-wide">Cantidad</label>
          <input
            type="number"
            min="0"
            value={producto.cantidad}
            onChange={(e) => onUpdate(producto.id, { cantidad: Number(e.target.value) })}
            className="border border-gray-200 rounded-lg px-3 py-2 text-[14px] text-gray-900 focus:outline-none focus:border-gray-400 transition-colors"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-gray-400 uppercase tracking-wide">Precio costo</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={producto.precio}
            onChange={(e) => onUpdate(producto.id, { precio: Number(e.target.value) })}
            className="border border-gray-200 rounded-lg px-3 py-2 text-[14px] text-gray-900 focus:outline-none focus:border-gray-400 transition-colors"
          />
        </div>
      </div>

      <div className="flex justify-between items-center pt-2 border-t border-gray-100">
        <span className="text-xs text-gray-400">Subtotal ({producto.unidad})</span>
        <span className="text-[15px] font-medium text-emerald-600">{fmt(subtotal)}</span>
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

// ─── Formulario agregar ─────────────────────────────────────────────
function AgregarForm({ onAgregar }) {
  const [form, setForm] = useState({
    nombre: "",
    categoria: "",
    cantidad: "",
    precio: "",
    unidad: "unidad",
  });
  const [exito, setExito] = useState(false);
  const [cargando, setCargando] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.nombre || form.cantidad === "" || form.precio === "") return;
    setCargando(true);
    await onAgregar({
      nombre: form.nombre,
      categoria: form.categoria,
      cantidad: Number(form.cantidad),
      precio: Number(form.precio),
      unidad: form.unidad,
    });
    setForm({ nombre: "", categoria: "", cantidad: "", precio: "", unidad: "unidad" });
    setCargando(false);
    setExito(true);
    setTimeout(() => setExito(false), 2000);
  };

  const inputClass =
    "border border-gray-200 rounded-lg px-3 py-2 text-[14px] text-gray-900 w-full focus:outline-none focus:border-gray-400 transition-colors";

  return (
    <div className="bg-gray-50 rounded-xl p-4 flex flex-col gap-3">
      <p className="text-[14px] font-medium text-gray-900">Nuevo producto</p>

      <div className="flex flex-col gap-1">
        <label className="text-[11px] text-gray-400 uppercase tracking-wide">Nombre *</label>
        <input
          type="text"
          placeholder="Ej: Yerba mate 1kg"
          value={form.nombre}
          onChange={(e) => set("nombre", e.target.value)}
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-[11px] text-gray-400 uppercase tracking-wide">Categoría</label>
        <input
          type="text"
          placeholder="Ej: Almacén, Limpieza..."
          value={form.categoria}
          onChange={(e) => set("categoria", e.target.value)}
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-gray-400 uppercase tracking-wide">Cantidad *</label>
          <input
            type="number"
            placeholder="0"
            min="0"
            value={form.cantidad}
            onChange={(e) => set("cantidad", e.target.value)}
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-gray-400 uppercase tracking-wide">Precio *</label>
          <input
            type="number"
            placeholder="0.00"
            min="0"
            step="0.01"
            value={form.precio}
            onChange={(e) => set("precio", e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-[11px] text-gray-400 uppercase tracking-wide">Unidad</label>
        <select
          value={form.unidad}
          onChange={(e) => set("unidad", e.target.value)}
          className={inputClass}
        >
          <option value="unidad">Unidad</option>
          <option value="kg">Kilogramo (kg)</option>
          <option value="litro">Litro</option>
          <option value="caja">Caja</option>
          <option value="pack">Pack</option>
          <option value="metro">Metro</option>
        </select>
      </div>

      <button
        onClick={handleSubmit}
        disabled={cargando}
        className="w-full bg-gray-900 text-white rounded-lg py-2.5 text-[14px] font-medium hover:bg-gray-700 active:scale-[0.98] transition-all disabled:opacity-50"
      >
        {cargando ? "Guardando..." : "Agregar al inventario"}
      </button>

      {exito && (
        <p className="text-center text-[13px] text-emerald-600">✓ Producto guardado en Supabase</p>
      )}
    </div>
  );
}

// ─── Pantalla compartir ─────────────────────────────────────────────
function Compartir({ productos }) {
  const empresa = "Mi Empresa"; // podés hacerlo editable si querés

  const botones = [
    {
      icon: "📄",
      label: "Generar y compartir PDF",
      desc: "Abre el menú nativo del celular (WhatsApp, Drive, email...)",
      onClick: () => compartirPDF(productos, empresa),
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
export default function App() {
  const { productos, loading, agregar, actualizar, eliminar } = useInventario();
  const [tab, setTab] = useState("inventario");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400 text-sm">Cargando inventario...</p>
      </div>
    );
  }

  const valorTotal = productos.reduce((a, p) => a + p.cantidad * p.precio, 0);
  const tabs = ["inventario", "+ agregar", "compartir"];

  return (
    <div className="min-h-screen bg-white max-w-sm mx-auto flex flex-col">

      {/* Header sticky */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 pt-4 pb-3">
        <div className="flex items-center gap-2 mb-0.5">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-700">
            <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
            <path d="m3.3 7 8.7 5 8.7-5M12 22V12"/>
          </svg>
          <h1 className="text-[18px] font-medium text-gray-900">Control de stock</h1>
        </div>
        <p className="text-xs text-gray-400 mb-3">JUALMAL</p>

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
              {t}
            </button>
          ))}
        </div>
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

            {productos.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <p className="text-4xl mb-2">📦</p>
                <p className="text-sm">
                  Sin productos aún.<br />Usá la pestaña "+ agregar"
                </p>
              </div>
            ) : (
              productos.map((p) => (
                <ProductCard
                  key={p.id}
                  producto={p}
                  onUpdate={actualizar}
                  onDelete={eliminar}
                />
              ))
            )}
          </>
        )}

        {/* TAB: Agregar */}
        {tab === "+ agregar" && <AgregarForm onAgregar={agregar} />}

        {/* TAB: Compartir */}
        {tab === "compartir" && <Compartir productos={productos} />}
      </div>
    </div>
  );
}