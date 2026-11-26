import { useState, useEffect, useMemo, useCallback, useRef } from 'react'

// Guarda las ediciones en el celular (memoria + localStorage) hasta que se
// toca "Guardar stock". Así escribir en las cards es instantáneo y no se
// pierde nada si se cierra la pestaña o se corta internet.

const hoy = () => new Date().toLocaleDateString('es-AR')

function leerGuardado(clave) {
  try {
    const raw = localStorage.getItem(`borrador_${clave}`)
    if (!raw) return {}
    const { fecha, cambios } = JSON.parse(raw)
    // Un borrador de otro día no se reaplica (sería un conteo viejo)
    return fecha === hoy() && cambios ? cambios : {}
  } catch {
    return {}
  }
}

// "" / null / undefined cuentan como vacío; números se comparan como número
function iguales(a, b) {
  const vacio = (v) => v === null || v === undefined || v === ''
  if (vacio(a) && vacio(b)) return true
  if (typeof a === 'number' || typeof b === 'number') return Number(a) === Number(b)
  // Listas (ej. marcas de palta): se comparan por contenido
  if (typeof a === 'object' || typeof b === 'object') return JSON.stringify(a ?? []) === JSON.stringify(b ?? [])
  return a === b
}

export function useBorrador(clave, productosBase) {
  const [cambios, setCambios] = useState(() => leerGuardado(clave))
  const cambiosRef = useRef(cambios)

  const pendientes = Object.keys(cambios).length

  // Persistir en el dispositivo
  useEffect(() => {
    cambiosRef.current = cambios
    try {
      if (pendientes === 0) localStorage.removeItem(`borrador_${clave}`)
      else localStorage.setItem(`borrador_${clave}`, JSON.stringify({ fecha: hoy(), cambios }))
    } catch {
      // localStorage no disponible: seguimos solo en memoria
    }
  }, [clave, cambios, pendientes])

  // Avisar si se intenta cerrar con cambios sin guardar
  useEffect(() => {
    if (pendientes === 0) return
    const aviso = (e) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', aviso)
    return () => window.removeEventListener('beforeunload', aviso)
  }, [pendientes])

  // Productos de la base con las ediciones locales encima.
  // Los que no cambiaron mantienen la misma referencia (las cards no se re-renderizan).
  const productos = useMemo(
    () => productosBase.map((p) => (cambios[p.id] ? { ...p, ...cambios[p.id] } : p)),
    [productosBase, cambios]
  )

  // Referencia a los valores guardados, para saber si una edición volvió al original
  const baseRef = useRef({})
  useEffect(() => {
    const mapa = {}
    productosBase.forEach((p) => { mapa[p.id] = p })
    baseRef.current = mapa
  }, [productosBase])

  const editar = useCallback((id, parcial) => {
    setCambios((prev) => {
      const nuevo = { ...prev[id], ...parcial }
      const base = baseRef.current[id]
      // Quitamos los campos que quedaron igual a lo guardado (ej. +1 y después −1)
      if (base) {
        for (const campo of Object.keys(nuevo)) {
          if (iguales(nuevo[campo], base[campo])) delete nuevo[campo]
        }
      }
      const resto = { ...prev }
      if (Object.keys(nuevo).length === 0) delete resto[id]
      else resto[id] = nuevo
      return resto
    })
  }, [])

  const descartar = useCallback(() => setCambios({}), [])

  // persistir(cambios) debe devolver { error }. Solo se limpian las ediciones
  // que se guardaron; si alguien siguió tipeando mientras se guardaba, eso queda pendiente.
  const guardar = useCallback(async (persistir) => {
    const snapshot = cambiosRef.current
    if (Object.keys(snapshot).length === 0) return { error: null }
    const { error } = await persistir(snapshot)
    if (!error) {
      setCambios((prev) => {
        const resto = { ...prev }
        for (const id of Object.keys(snapshot)) {
          if (resto[id] === snapshot[id]) delete resto[id]
        }
        return resto
      })
    }
    return { error }
  }, [])

  return { productos, cambios, pendientes, editar, descartar, guardar }
}
