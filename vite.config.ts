import { defineConfig } from 'vite'

export default defineConfig(({ command, mode }) => {
    // В development используем proxy, в production - полный URL
    const CLOUD_API = 'https://criminally-astute-kangaroo.cloudpub.ru'
    const apiBaseUrl = mode === 'production' ? CLOUD_API : ''  // В dev режиме используем proxy

    return {
        server: {
            port: 5173,
            proxy: command === 'serve' ? {
                '/api': {
                    target: 'http://localhost:5000',
                    changeOrigin: true,
                    secure: false
                }
            } : undefined
        },
        define: {
            __API_BASE__: JSON.stringify(apiBaseUrl)
        },
        base: './' // Относительные пути для static assets
    }
})


