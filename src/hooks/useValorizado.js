import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useValorizado() {
  const [valorFisico, setValorFisico] = useState(0)
  const [valorVerduleria, setValorVerduleria] = useState(0)
  const [loading, setLoading] = useState(true)

  const cargar = useCallback(async () => {
    const { data: productos } = await supabase
      .from('productos')
      .select('cantidad, precio')

    const { data: verduleria } = await supabase
      .from('verduleria')
      .select('cantidad, precio')

    setValorFisico((productos || []).reduce((acc, p) => acc + p.cantidad * p.precio, 0))
    setValorVerduleria((verduleria || []).reduce((acc, p) => acc + p.cantidad * p.precio, 0))
    setLoading(false)
  }, [])

  useEffect(() => {
    cargar()

    const canalProductos = supabase
      .channel('valorizado_productos')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'productos' }, cargar)
      .subscribe()

    const canalVerduleria = supabase
      .channel('valorizado_verduleria')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'verduleria' }, cargar)
      .subscribe()

    return () => {
      supabase.removeChannel(canalProductos)
      supabase.removeChannel(canalVerduleria)
    }
  }, [cargar])

  return { valorFisico, valorVerduleria, loading }
}