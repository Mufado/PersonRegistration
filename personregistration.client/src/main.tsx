import { AuthProvider } from './context/AuthContext.tsx'
import { ApiVersionProvider } from './context/ApiVersionContext.tsx'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <AuthProvider>
    <ApiVersionProvider>
      <App />
    </ApiVersionProvider>
  </AuthProvider>,
)
