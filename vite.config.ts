import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Crucial for GitHub Pages deployment in a subpath
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false
  }
});