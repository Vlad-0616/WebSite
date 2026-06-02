import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
plugins: [vue()],

// Для GitHub Pages
base: '/WebSite/',

resolve: {
alias: {
'@': fileURLToPath(new URL('./src', import.meta.url))
}
},

server: {
port: 5173,
proxy: {
'/api': {
target: process.env.VITE_API_URL || 'http://localhost:3000',
changeOrigin: true
}
}
},

preview: {
port: 8080,
host: '0.0.0.0'
}
})
