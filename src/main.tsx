import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import useUserStore from './store/user'
import {
  clearAllDecryptStreams,
  ensureDecryptStreamServiceWorker,
} from './utils/decrypt-stream-service-worker-client'

// Register early so the first media preview can already stream through it
ensureDecryptStreamServiceWorker()

// Logout / PIN lock (plain AES key removed) → wipe streaming sessions holding the key
useUserStore.subscribe((state, prev) => {
  if (prev.user.aesKeyPlain && !state.user.aesKeyPlain) clearAllDecryptStreams()
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
