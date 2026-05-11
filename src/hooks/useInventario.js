import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useInventario() {
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Carga inicial
    supabase.from('productos').select('*').order('nombre')
      .then(({ data }) => {
        setProductos(data || [])
        setLoading(false)
      })

    // Realtime — escucha cambios de otros usuarios
    const channel = supabase
      .channel('inventario')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'productos' },
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
    const { error } = await supabase.from('productos').insert([producto])
    return { error }
  }

  const actualizar = async (id, cambios) => {
    const { error } = await supabase.from('productos')
      .update({ ...cambios, updated_at: new Date().toISOString() })
      .eq('id', id)
    return { error }
  }

  const eliminar = async (id) => {
    const { error } = await supabase.from('productos').delete().eq('id', id)
    return { error }
  }

  return { productos, loading, agregar, actualizar, eliminar }
}