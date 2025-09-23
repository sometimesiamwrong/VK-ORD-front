import { defineConfig } from 'vite'

export default defineConfig(({ command, mode }) => {
    // В development используем proxy, в production - полный URL
    const apiBaseUrl = mode === 'production'
        ? process.env.VITE_API_BASE || 'http://89.104.65.201:5000'  // HTTP вместо HTTPS для избежания SSL проблем
        : ''  // В dev режиме используем proxy

    return {
        server: {
            port: 5173,
            proxy: command === 'serve' ? {
                '/api': {
                    target: process.env.VITE_API_BASE || 'http://89.104.65.201:5000',  // HTTP вместо HTTPS
                    changeOrigin: true,
                    secure: false  // Отключаем проверку SSL для HTTP
                }
            } : undefined
        },
        define: {
            __API_BASE__: JSON.stringify(apiBaseUrl)
        },
        base: './' // Относительные пути для static assets
    }
})


