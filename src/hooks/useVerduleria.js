import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useVerduleria() {
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('verduleria').select('*').order('nombre')
      .then(({ data }) => {
        setProductos(data || [])
        setLoading(false)
      })

    const channel = supabase
      .channel('verduleria')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'verduleria' },
        (payload) => {
          if (payload.eventType === 'INSERT')
            setProductos(prev => [...prev, payload.new])
          if (payload.eventType === 'UPDATE')
            setProductos(prev => prev.map(p => p.id === payload.new.id ? payload.new : p))
          if (payload.eventType === 'DELETE')
            setProductos(prev => prev.filter(p => p.id !== payload.old.id))
        }
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  const agregar = async (producto) => {
    const { error } = await supabase.from('verduleria').insert([producto])
    return { error }
  }

  const actualizar = async (id, cambios) => {
    const { error } = await supabase.from('verduleria')
      .update({ ...cambios, updated_at: new Date().toISOString() })
      .eq('id', id)
    return { error }
  }

  // Guarda de una sola vez todos los cambios pendientes del borrador.
  // cambios = { [id]: { cantidad?, precio?, observaciones? } }
  const guardarCambios = async (cambios) => {
    const ahora = new Date().toISOString()
    const resultados = await Promise.all(
      Object.entries(cambios).map(([id, parcial]) =>
        supabase.from('verduleria').update({ ...parcial, updated_at: ahora }).eq('id', id)
      )
    )
    // Reflejamos lo guardado al instante, sin esperar al realtime
    const okIds = new Set(
      Object.keys(cambios).filter((_, i) => !resultados[i].error)
    )
    setProductos(prev => prev.map(p => okIds.has(String(p.id)) ? { ...p, ...cambios[p.id] } : p))
    const fallo = resultados.find(r => r.error)
    return { error: fallo ? fallo.error : null }
  }

  return { productos, loading, agregar, actualizar, guardarCambios }
}