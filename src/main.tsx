import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)


if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then((registration) => {
        console.log('✅ SW registrado (Solo en Producción):', registration.scope);
      })
      .catch((err) => {
        console.log('❌ Fallo al registrar SW:', err);
      });
  });
}

// if ('serviceWorker' in navigator) {
//   window.addEventListener('load', () => {
//     navigator.serviceWorker.register('/service-worker.js')
//       .then((registration) => {
//         console.log('SW registrado con éxito:', registration.scope);
//       })
//       .catch((err) => {
//         console.log('Fallo al registrar SW:', err);
//       });
//   });
// }
