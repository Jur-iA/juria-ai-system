import { useEffect, useState } from 'react'

const backendUrl = import.meta.env.VITE_BACKEND_URL as string | undefined

export default function App() {
  const [health, setHealth] = useState<string>('')
  const [error, setError] = useState<string>('')

  useEffect(() => {
    async function ping() {
      if (!backendUrl) return
      try {
        const res = await fetch(`${backendUrl}/api/health`)
        const json = await res.json()
        setHealth(JSON.stringify(json))
      } catch (e: any) {
        setError(e?.message || 'Erro ao chamar backend')
      }
    }
    ping()
  }, [])

  return (
    <div style={{ fontFamily: 'system-ui, Arial, sans-serif', padding: 24 }}>
      <h1>JurIA Frontend</h1>
      <p><b>Backend:</b> {backendUrl || 'VITE_BACKEND_URL não definida'}</p>
      {health && (
        <p style={{ color: 'green' }}>
          <b>Health:</b> {health}
        </p>
      )}
      {error && (
        <p style={{ color: 'crimson' }}>
          <b>Erro:</b> {error}
        </p>
      )}
    </div>
  )
}
