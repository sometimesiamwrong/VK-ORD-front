import path from "path"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from "vite"

export default defineConfig(({ command, mode }) => {
    // В development используем proxy, в production - полный URL
    const CLOUD_API = 'https://criminally-astute-kangaroo.cloudpub.ru'
    const apiBaseUrl = mode === 'production' ? CLOUD_API : ''  // В dev режиме используем proxy

    return {
        plugins: [tailwindcss()],
        resolve: {
            alias: {
                "@": path.resolve(__dirname, "./src"),
            },
        },
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
        base: './', // Относительные пути для static assets
        build: {
            logLevel: 'warn', // Показывать только предупреждения и ошибки, убрать info логи
            reportCompressedSize: false, // Убрать отчет о размерах файлов
            chunkSizeWarningLimit: 1000, // Увеличить лимит до 1000kb чтобы убрать предупреждение о больших chunk'ах
            rollupOptions: {
                onwarn(warning, warn) {
                    // Игнорировать предупреждения о "use client" директивах
                    if (warning.message.includes('Module level directives cause errors when bundled')) {
                        return
                    }
                    // Для остальных предупреждений использовать стандартный warn
                    warn(warning)
                }
            }
        }
    }
})


