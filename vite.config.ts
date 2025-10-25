import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // ✅ ensures correct asset paths in Vercel build
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
