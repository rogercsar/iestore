import './App.css'
import { useEffect } from 'react'

function App() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.location.replace('/app/index.html');
    }
  }, []);

  return (
    <div className="card" style={{ padding: 24 }}>
      <h1 style={{ marginBottom: 12 }}>i e store</h1>
      <p>Redirecionando para o aplicativo...</p>
      <p>
        Se não redirecionar automaticamente, clique
        {' '}
        <a href="/app/index.html">aqui</a>.
      </p>
    </div>
  )
}

export default App
