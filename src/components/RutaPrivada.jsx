import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function RutaPrivada({ children }) {
  const [session, setSession] = useState(undefined) // undefined = todavía no sabemos

  useEffect(() => {
    // Chequea la sesión actual al cargar
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    // Escucha cambios de sesión (login/logout) en tiempo real
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  if (session === undefined) {
    return <p>Cargando...</p> // evita parpadeo mientras se verifica la sesión
  }

  if (!session) {
    return <Navigate to="/login" replace />
  }

  return children
}