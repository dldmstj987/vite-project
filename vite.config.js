import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'server/dist'  // 👉 빌드 결과를 server 폴더 안으로 이동
  }
})

