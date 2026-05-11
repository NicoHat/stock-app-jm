import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const fmt = (n) => '$' + Number(n).toLocaleString('es-AR')

export async function compartirPDF(productos, empresa = 'Mi Empresa') {
  const doc = new jsPDF()
  const fecha = new Date().toLocaleDateString('es-AR')
  const total = productos.reduce((a, p) => a + p.cantidad * p.precio, 0)

  doc.setFontSize(18)
  doc.text(empresa, 14, 22)
  doc.setFontSize(11)
  doc.setTextColor(100)
  doc.text(`Inventario al ${fecha}`, 14, 30)

  autoTable(doc, {
    startY: 38,
    head: [['Producto', 'Categoría', 'Cantidad', 'P. Costo', 'Subtotal']],
    body: productos.map(p => [
      p.nombre,
      p.categoria || '-',
      `${p.cantidad} ${p.unidad}`,
      fmt(p.precio),
      fmt(p.cantidad * p.precio)
    ]),
    foot: [['', '', '', 'Total:', fmt(total)]],
    styles: { fontSize: 10 },
    headStyles: { fillColor: [29, 158, 117] },
    footStyles: { fontStyle: 'bold' }
  })

  const blob = doc.output('blob')
  const file = new File([blob], `inventario-${fecha}.pdf`, { type: 'application/pdf' })

  // En celular abre WhatsApp, email, Drive, etc.
  if (navigator.share && navigator.canShare({ files: [file] })) {
    await navigator.share({ files: [file], title: `Inventario ${empresa}` })
  } else {
    // En desktop descarga el archivo
    doc.save(`inventario-${fecha}.pdf`)
  }
}

export function compartirWhatsApp(productos, empresa = 'Mi Empresa') {
  const fecha = new Date().toLocaleDateString('es-AR')
  const total = productos.reduce((a, p) => a + p.cantidad * p.precio, 0)
  let txt = `📦 INVENTARIO - ${empresa}\n📅 ${fecha}\n\n`
  productos.forEach(p => {
    txt += `• ${p.nombre}: ${p.cantidad} ${p.unidad} × ${fmt(p.precio)} = ${fmt(p.cantidad * p.precio)}\n`
  })
  txt += `\n💰 TOTAL: ${fmt(total)}`
  window.open('https://wa.me/?text=' + encodeURIComponent(txt), '_blank')
}

export function compartirEmail(productos, empresa = 'Mi Empresa') {
  const fecha = new Date().toLocaleDateString('es-AR')
  const total = productos.reduce((a, p) => a + p.cantidad * p.precio, 0)
  let body = `INVENTARIO - ${empresa}\nFecha: ${fecha}\n\n`
  productos.forEach(p => {
    body += `${p.nombre}: ${p.cantidad} ${p.unidad} × ${fmt(p.precio)} = ${fmt(p.cantidad * p.precio)}\n`
  })
  body += `\nTOTAL: ${fmt(total)}`
  window.open(`mailto:?subject=Inventario ${empresa}&body=${encodeURIComponent(body)}`, '_blank')
}