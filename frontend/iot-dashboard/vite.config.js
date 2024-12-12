import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    open: true, // Esto abrirá automáticamente el navegador cuando inicies el servidor
    port: 3000, // Puedes cambiar el puerto si lo deseas
  },
  build: {
    outDir: 'dist', // Este es el directorio donde se generarán los archivos de construcción
  },
  resolve: {
    alias: {
      '@': '/src', // Puedes usar alias para rutas más limpias en tu proyecto
    },
  },
});
