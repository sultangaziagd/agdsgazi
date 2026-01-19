import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages repo adı ile aynı olmalı
  base: '/agdsgazi/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  }
})