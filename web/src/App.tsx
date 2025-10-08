import './App.css'
import { useEffect } from 'react'
import { Card, Button } from './components'

function App() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.location.replace('/app/index.html');
    }
  }, []);

  return (
    <div className="container flex items-center justify-center" style={{ minHeight: '100vh' }}>
      <Card 
        title="i e store" 
        icon="🏪"
        className="text-center max-w-md"
      >
        <p className="mb-4">Redirecionando para o aplicativo...</p>
        <p className="mb-4 text-gray-600">
          Se não redirecionar automaticamente, clique no botão abaixo.
        </p>
        <Button 
          variant="primary" 
          icon="arrow-right"
          onClick={() => window.location.href = '/app/index.html'}
        >
          Acessar Aplicativo
        </Button>
      </Card>
    </div>
  )
}

export default App
