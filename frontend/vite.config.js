import path from "path"
import tailwindcss from "@tailwindcss/vite"

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5175, // change this to your preferred port
    host: 'localhost', // or '0.0.0.0' to make it accessible on your network
  }
});
