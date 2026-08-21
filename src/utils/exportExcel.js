import * as XLSX from "xlsx";

/**
 * Exporta un listado de productos a un archivo .xlsx y dispara la descarga.
 *
 * @param {Array} productos - lista de productos
 * @param {string} nombreArchivo - nombre del archivo, sin extensión
 * @param {Array} columnas - [{ header: "Nombre columna", key: "campo" }]
 *   o [{ header: "Nombre columna", value: (producto) => ... }] para valores calculados
 */
export function exportarExcel(productos, nombreArchivo, columnas) {
  const filas = productos.map((p) => {
    const fila = {};
    columnas.forEach((col) => {
      fila[col.header] = col.value ? col.value(p) : p[col.key];
    });
    return fila;
  });

  const hoja = XLSX.utils.json_to_sheet(filas);
  const libro = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(libro, hoja, "Stock");

  const fecha = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(libro, `${nombreArchivo}_${fecha}.xlsx`);
}