import { useState, useEffect, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import { limpiarMarcas } from '../utils/palta'

// Normaliza filas de palta_marcas → { [producto_id]: [{ marca, kg, precio }] }
function agruparMarcas(filas) {
  const mapa = {}
  ;(filas || [])
    .slice()
    .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))
    .forEach((f) => {
      if (!mapa[f.producto_id]) mapa[f.producto_id] = []
      mapa[f.producto_id].push({
        marca: f.marca || '',
        kg: Number(f.kg) || 0,
        precio: Number(f.precio) || 0,
      })
    })
  return mapa
}

// Trae las marcas de palta. Si la tabla todavía no existe, devuelve null
// y la app sigue funcionando igual.
async function fetchMarcas() {
  const { data, error } = await supabase
    .from('palta_marcas')
    .select('producto_id, marca, kg, precio, orden')
  if (error) {
    console.warn('palta_marcas:', error.message)
    return null
  }
  return agruparMarcas(data)
}

export function useInventario() {
  const [productosRaw, setProductosRaw] = useState([])
  const [marcasMap, setMarcasMap] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Carga inicial
    const cargarMarcas = () =>
      fetchMarcas().then((mapa) => { if (mapa) setMarcasMap(mapa) })

    Promise.all([
      supabase.from('productos').select('*').order('nombre'),
      cargarMarcas(),
    ]).then(([{ data }]) => {
      setProductosRaw(data || [])
      setLoading(false)
    })

    // Realtime — escucha cambios de otros usuarios
    const channel = supabase
      .channel('inventario')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'productos' },
        (payload) => {
          if (payload.eventType === 'INSERT')
            setProductosRaw(prev => [...prev, payload.new])
          if (payload.eventType === 'UPDATE')
            setProductosRaw(prev => prev.map(p => p.id === payload.new.id ? payload.new : p))
          if (payload.eventType === 'DELETE')
            setProductosRaw(prev => prev.filter(p => p.id !== payload.old.id))
        }
      )
      .subscribe()

    const channelMarcas = supabase
      .channel('inventario_palta_marcas')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'palta_marcas' },
        () => cargarMarcas()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
      supabase.removeChannel(channelMarcas)
    }
  }, [])

  // Los productos por marca (palta) traen su lista de marcas
  const productos = useMemo(
    () => productosRaw.map((p) => (p.por_marca ? { ...p, marcas: marcasMap[p.id] || [] } : p)),
    [productosRaw, marcasMap]
  )

  const agregar = async (producto) => {
    const { error } = await supabase.from('productos').insert([producto])
    return { error }
  }

  const actualizar = async (id, cambios) => {
    const { error } = await supabase.from('productos')
      .update({ ...cambios, updated_at: new Date().toISOString() })
      .eq('id', id)
    return { error }
  }

  // Guarda de una sola vez todos los cambios pendientes del borrador.
  // cambios = { [id]: { cantidad?, precio?, observaciones?, marcas? } }
  const guardarCambios = async (cambios) => {
    const ahora = new Date().toISOString()

    const guardarUno = async (id, parcial) => {
      const { marcas, ...resto } = parcial

      if (marcas) {
        // Palta: marcas + total kg + precio promedio, todo junto en la base
        const { error } = await supabase.rpc('guardar_palta_marcas', {
          p_producto_id: id,
          p_marcas: limpiarMarcas(marcas),
        })
        if (error) return { error }
        // cantidad y precio los calcula la base a partir de las marcas
        delete resto.cantidad
        delete resto.precio
      }

      if (Object.keys(resto).length > 0) {
        const { error } = await supabase.from('productos')
          .update({ ...resto, updated_at: ahora })
          .eq('id', id)
        if (error) return { error }
      }
      return { error: null }
    }

    const entradas = Object.entries(cambios)
    const resultados = await Promise.all(entradas.map(([id, parcial]) => guardarUno(id, parcial)))

    // Reflejamos lo guardado al instante, sin esperar al realtime
    const ok = entradas.filter((_, i) => !resultados[i].error)
    const okIds = new Set(ok.map(([id]) => id))
    setProductosRaw(prev => prev.map(p => {
      if (!okIds.has(String(p.id))) return p
      const { marcas, ...resto } = cambios[p.id]
      return marcas ? { ...p, ...resto } : { ...p, ...cambios[p.id] }
    }))
    setMarcasMap(prev => {
      const copia = { ...prev }
      ok.forEach(([id, parcial]) => {
        if (parcial.marcas) copia[id] = limpiarMarcas(parcial.marcas)
      })
      return copia
    })

    const fallo = resultados.find(r => r.error)
    return { error: fallo ? fallo.error : null }
  }

  return { productos, loading, agregar, actualizar, guardarCambios }
}
