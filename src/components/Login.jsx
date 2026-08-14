import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    setLoading(false)
    if (error) setError('Email o contraseña incorrectos')
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <h2 style={styles.title}>📦 Bienvenido a Jualmal Stock</h2>
        <p style={styles.subtitle}>Iniciá sesión para continuar</p>

        <form onSubmit={handleLogin}>
          <label style={styles.label}>Email</label>
          <input
            type="email"
            placeholder="nombre@jualmal.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            required
          />

          <label style={styles.label}>Contraseña</label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            required
          />

          {error && <p style={styles.error}>{error}</p>}

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  )
}

const styles = {
  wrapper: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f7f7f5',
  },
  card: {
    width: '100%',
    maxWidth: 380,
    background: '#fff',
    border: '1px solid #eee',
    borderRadius: 16,
    padding: '2rem 1.75rem',
  },
  title: { margin: '0 0 4px', fontSize: 18, fontWeight: 600 },
  subtitle: {
    margin: '0 0 1.5rem',
    fontSize: 13,
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: '0.02em',
  },
  label: { fontSize: 13, color: '#888', display: 'block', marginBottom: 6 },
  input: {
    width: '100%',
    boxSizing: 'border-box',
    marginBottom: '1rem',
    padding: '10px 14px',
    borderRadius: 10,
    border: '1px solid #ddd',
    fontSize: 14,
    outline: 'none',
  },
  error: { color: '#c0392b', fontSize: 13, margin: '0 0 1rem' },
  button: {
    width: '100%',
    background: '#000',
    color: '#fff',
    border: 'none',
    borderRadius: 999,
    height: 40,
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
  },
}