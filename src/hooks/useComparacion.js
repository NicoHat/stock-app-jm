import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useComparacion() {
  const [productosBase, setProductosBase] = useState([])
  const [sistemaMap, setSistemaMap] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let activo = true

    async function cargarInicial() {
      const { data: productosData, error: errProd } = await supabase
        .from('productos')
        .select('id, nombre, categoria, unidad, cantidad')
        .order('nombre')

      const { data: sistemaData, error: errSist } = await supabase
        .from('stock_sistema')
        .select('producto_id, cantidad')

      if (errProd || errSist) {
        console.error(errProd || errSist)
        setLoading(false)
        return
      }

      if (!activo) return

      const mapa = {}
      sistemaData.forEach((s) => {
        mapa[s.producto_id] = s.cantidad
      })

      setProductosBase(productosData)
      setSistemaMap(mapa)
      setLoading(false)
    }

    cargarInicial()

    // Realtime en ambas tablas — la vista se mantiene al día sola,
    // pero acá nunca se escribe nada, solo se lee.
    const channelProductos = supabase
      .channel('comparacion_productos')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'productos' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setProductosBase((prev) => [...prev, payload.new])
          }
          if (payload.eventType === 'UPDATE') {
            setProductosBase((prev) =>
              prev.map((p) => (p.id === payload.new.id ? payload.new : p))
            )
          }
          if (payload.eventType === 'DELETE') {
            setProductosBase((prev) => prev.filter((p) => p.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    const channelSistema = supabase
      .channel('comparacion_sistema')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'stock_sistema' },
        (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const row = payload.new
            setSistemaMap((prev) => ({ ...prev, [row.producto_id]: row.cantidad }))
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
      supabase.removeChannel(channelProductos)
      supabase.removeChannel(channelSistema)
    }
  }, [])

  const productos = productosBase.map((p) => ({
    id: p.id,
    nombre: p.nombre,
    categoria: p.categoria,
    unidad: p.unidad,
    cantidad_fisico: p.cantidad,
    cantidad_sistema: sistemaMap[p.id] ?? 0,
  }))

  return { productos, loading }
}