import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { GlobalProvider } from './context/GlobalContext.tsx'
import { ErrorBoundary } from './components/ui/ErrorBoundary.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <GlobalProvider>
        <App />
      </GlobalProvider>
    </ErrorBoundary>
  </StrictMode>,
)
