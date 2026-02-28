import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path'



export default defineConfig({
  plugins: [react()] as any[],
  resolve: {
    alias: {
      '@medxai/ui': path.resolve(__dirname, '../ui/src'),
      '@medxai/fhir-ui': path.resolve(__dirname, '../fhir-ui/src'),
    }
  }
});