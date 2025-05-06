import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
//import './index.css'
//import Login from './pages/Login.tsx'
import Router from './Router.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router />
  </StrictMode>,
)
