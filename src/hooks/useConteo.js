import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useConteo(tipo) {
  const [ultimoConteo, setUltimoConteo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    supabase
      .from('conteos')
      .select('fecha')
      .eq('tipo', tipo)
      .order('fecha', { ascending: false })
      .limit(1)
      .then(({ data }) => {
        setUltimoConteo(data && data[0] ? data[0].fecha : null)
        setLoading(false)
      })

    const channel = supabase
      .channel(`conteos_${tipo}`)
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'conteos', filter: `tipo=eq.${tipo}` },
        (payload) => {
          setUltimoConteo(payload.new.fecha)
        }
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [tipo])

  const finalizarConteo = async () => {
    setGuardando(true)
    const { error } = await supabase.from('conteos').insert({ tipo })
    setGuardando(false)
    return { error }
  }

  return { ultimoConteo, loading, guardando, finalizarConteo }
}