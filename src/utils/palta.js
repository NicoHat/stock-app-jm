// Helpers para la palta contada por calibre y marca.

// Quita filas vacías (sin marca y sin kg) y deja todo con números.
export function limpiarMarcas(marcas = []) {
  return marcas
    .map((m) => ({
      marca: (m.marca || "").trim(),
      kg: Number(m.kg) || 0,
      precio: Number(m.precio) || 0,
    }))
    .filter((m) => m.marca !== "" || m.kg > 0);
}

// Total de kg y precio promedio ponderado por kg.
export function totalesPalta(marcas = []) {
  const kg = marcas.reduce((a, m) => a + (Number(m.kg) || 0), 0);
  const valor = marcas.reduce((a, m) => a + (Number(m.kg) || 0) * (Number(m.precio) || 0), 0);
  return {
    kg: Math.round(kg * 1000) / 1000,
    valor,
    precioPromedio: kg > 0 ? Math.round((valor / kg) * 100) / 100 : 0,
  };
}

// Para los productos por marca, la cantidad y el precio salen de sus marcas
// (así las métricas, el valor total y los exportes muestran lo que se está cargando).
export function conTotalesPalta(producto) {
  if (!producto.por_marca || !producto.marcas) return producto;
  const { kg, precioPromedio } = totalesPalta(producto.marcas);
  if (producto.marcas.length === 0) return { ...producto, cantidad: 0 };
  return { ...producto, cantidad: kg, precio: precioPromedio };
}

// Marcas usadas alguna vez, para sugerirlas al escribir.
export function marcasConocidas(productos = []) {
  const set = new Set();
  productos.forEach((p) => (p.marcas || []).forEach((m) => m.marca && set.add(m.marca)));
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

// Último precio conocido de cada marca, para no tener que cargarlo en cada conteo.
// Prioriza el del mismo calibre; si no hay, usa el de cualquier calibre.
export function preciosConocidos(productos = []) {
  const porProducto = {};
  const global = {};
  productos.forEach((p) =>
    (p.marcas || []).forEach((m) => {
      const clave = (m.marca || "").trim().toLowerCase();
      if (!clave || !(Number(m.precio) > 0)) return;
      if (!porProducto[p.id]) porProducto[p.id] = {};
      porProducto[p.id][clave] = Number(m.precio);
      global[clave] = Number(m.precio);
    })
  );
  return { porProducto, global };
}

export function precioSugerido(precios, productoId, marca) {
  const clave = (marca || "").trim().toLowerCase();
  if (!clave || !precios) return 0;
  return precios.porProducto?.[productoId]?.[clave] ?? precios.global?.[clave] ?? 0;
}
