import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  base: './', // 👈 경로 기준 설정
  build: {
    outDir: 'server/dist',
    emptyOutDir: true,
  },
})
