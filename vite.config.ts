import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { getChatConfig } from './src/features/chat/config.ts'

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [
    react(),
    {
      name: 'validate-chat-configuration',
      configResolved(config) {
        getChatConfig(!config.isProduction, config.env.VITE_CHAT_API_URL)
      },
    },
  ],
  server: {
    proxy: {
      '/api': 'http://127.0.0.1:3001',
    },
  },
})
