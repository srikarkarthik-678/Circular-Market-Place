import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:5000',
      '/sell': 'http://localhost:5000',
      '/products': 'http://localhost:5000',
      '/login': 'http://localhost:5000',
      '/signup': 'http://localhost:5000',
      '/search': 'http://localhost:5000',
      '/repair': 'http://localhost:5000',
      '/repair-request': 'http://localhost:5000',
      '/repair-requests': 'http://localhost:5000',
      '/admin': 'http://localhost:5000',
      '/product': 'http://localhost:5000',
      '/purchase': 'http://localhost:5000',
      '/my-products': 'http://localhost:5000',
      '/my-orders': 'http://localhost:5000',
      '/sync-products': 'http://localhost:5000',
    }
  }
})