import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/postcss7-compat';
import autoprefixer from 'autoprefixer';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['react-pro-sidebar']
  },
  css: {
    postcss: {
      plugins: [tailwindcss, autoprefixer]
    }
  }
});
