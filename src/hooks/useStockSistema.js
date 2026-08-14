import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useStockSistema() {
  const [productosBase, setProductosBase] = useState([])
  const [sistemaMap, setSistemaMap] = useState({}) // producto_id -> { id, cantidad }
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let activo = true

    async function cargarInicial() {
      const { data: productosData, error: errProd } = await supabase
        .from('productos')
        .select('id, nombre, categoria, unidad')
        .order('nombre')

      const { data: sistemaData, error: errSist } = await supabase
        .from('stock_sistema')
        .select('id, producto_id, cantidad')

      if (errProd || errSist) {
        console.error(errProd || errSist)
        setLoading(false)
        return
      }

      if (!activo) return

      const mapa = {}
      sistemaData.forEach((s) => {
        mapa[s.producto_id] = { id: s.id, cantidad: s.cantidad }
      })

      setProductosBase(productosData)
      setSistemaMap(mapa)
      setLoading(false)
    }

    cargarInicial()

    // Realtime — solo actualiza la pantalla cuando Supabase confirma el guardado
    const channel = supabase
      .channel('stock_sistema_realtime')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'stock_sistema' },
        (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const row = payload.new
            setSistemaMap((prev) => ({
              ...prev,
              [row.producto_id]: { id: row.id, cantidad: row.cantidad },
            }))
          }
          if (payload.eventType === 'DELETE') {
            const row = payload.old
            setSistemaMap((prev) => {
              const copia = { ...prev }
              delete copia[row.producto_id]
              return copia
            })
          }
        }
      )
      .subscribe()

    return () => {
      activo = false
      supabase.removeChannel(channel)
    }
  }, [])

  const productos = productosBase.map((p) => {
    const registro = sistemaMap[p.id]
    return {
      id: p.id,
      nombre: p.nombre,
      categoria: p.categoria,
      unidad: p.unidad,
      cantidad: registro?.cantidad ?? 0,
      stock_sistema_id: registro?.id ?? null,
    }
  })

  const actualizarCantidad = async (productoId, _stockSistemaId, cantidad) => {
    // No tocamos el estado local a mano: el número en pantalla
    // cambia solo cuando llega la confirmación real por el canal realtime.
    const { error } = await supabase
      .from('stock_sistema')
      .upsert(
        { producto_id: productoId, cantidad, updated_at: new Date().toISOString() },
        { onConflict: 'producto_id' }
      )
    if (error) console.error(error)
  }

  return { productos, loading, actualizarCantidad }
}