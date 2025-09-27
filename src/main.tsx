import { createRoot } from 'react-dom/client'
import './styles/index.css'
import { App } from './App'

const container = document.getElementById('app')
if (!container) {
    throw new Error('Root container #app not found')
}

createRoot(container).render(<App />)


