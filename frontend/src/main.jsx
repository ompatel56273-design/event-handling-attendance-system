import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Suppress third-party browser extension exceptions
if (typeof window !== 'undefined') {
  window.addEventListener('error', (e) => {
    if (e?.message?.includes('startTime') || e?.filename === '' || e?.filename?.includes('anonymous')) {
      e.stopImmediatePropagation();
      e.preventDefault();
      return true;
    }
  });
}

// Register PWA Service Worker
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.log('SW registration failed: ', err);
    });
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
