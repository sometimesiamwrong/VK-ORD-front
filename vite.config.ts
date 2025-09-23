import { defineConfig } from 'vite'

export default defineConfig({
    server: {
        port: 5173,
        proxy: {
            '/api': {
                target: 'https://localhost:7169',
                changeOrigin: true,
                secure: false
            }
        }
    },
    define: {
        __API_BASE__: JSON.stringify('https://localhost:7169')
    }
})


