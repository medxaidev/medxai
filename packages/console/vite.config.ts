import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import http from 'node:http';

const BACKEND_HOST = 'localhost';
const BACKEND_PORT = 8080;
const BACKEND = `http://${BACKEND_HOST}:${BACKEND_PORT}`;

// Matches paths starting with an uppercase letter — all FHIR resource types
// e.g. /Patient, /CodeSystem/123, /Observation?code=..., /ValueSet/abc/$expand
const FHIR_RESOURCE_RE = /^\/[A-Z][a-zA-Z]+/;

/**
 * Vite plugin that proxies FHIR resource paths to the backend.
 * Vite's built-in proxy only supports string prefix matching,
 * but FHIR routes use dynamic /:resourceType paths at root.
 */
function fhirProxyPlugin(): Plugin {
  return {
    name: 'fhir-resource-proxy',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url ?? '';
        if (!FHIR_RESOURCE_RE.test(url)) return next();

        const proxyReq = http.request(
          {
            hostname: BACKEND_HOST,
            port: BACKEND_PORT,
            path: url,
            method: req.method,
            headers: { ...req.headers, host: `${BACKEND_HOST}:${BACKEND_PORT}` },
          },
          (proxyRes) => {
            res.writeHead(proxyRes.statusCode ?? 502, proxyRes.headers);
            proxyRes.pipe(res, { end: true });
          },
        );
        proxyReq.on('error', (err) => {
          console.error('[fhir-proxy]', err.message);
          res.writeHead(502, { 'content-type': 'text/plain' });
          res.end('FHIR proxy error: ' + err.message);
        });
        req.pipe(proxyReq, { end: true });
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), fhirProxyPlugin()] as any[],
  resolve: {
    alias: {
      '@medxai/fhir-client': path.resolve(__dirname, '../fhir-client/src'),
    },
  },
  server: {
    port: 3001,
    proxy: {
      '/auth': { target: BACKEND, changeOrigin: true },
      '/oauth2': { target: BACKEND, changeOrigin: true },
      '/admin': { target: BACKEND, changeOrigin: true },
      '/.well-known': { target: BACKEND, changeOrigin: true },
      '/metadata': { target: BACKEND, changeOrigin: true },
    },
  },
});