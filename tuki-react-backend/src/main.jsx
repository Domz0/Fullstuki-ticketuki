import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { limpiarAlmacenamientoAntiguo } from './utils/limpiarAlmacenamientoAntiguo'
import { migrarCompraAnterior } from './utils/compra'

limpiarAlmacenamientoAntiguo()
migrarCompraAnterior()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
