import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from "vite-tsconfig-paths";

// https://vite.dev/config/
export default defineConfig({
  base: './',
  build: {
    sourcemap: false,
    target: 'es2020',
  },
  plugins: [
    react(),
    tsconfigPaths()
  ],
})
