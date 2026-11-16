import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Para GitHub Pages: el workflow define VITE_BASE="/nombre-del-repo/".
// Si no se define, se usa una ruta relativa ("./"), que también funciona en Pages.
export default defineConfig({
  base: process.env.VITE_BASE || './',
  plugins: [react()],
})
