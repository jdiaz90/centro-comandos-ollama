import http from 'http';
import https from 'https';
import { URL } from 'url';

/**
 * Verifica si el servidor Ollama está accesible
 * @param {string} hostURL - Dirección completa (ej: http://localhost:11434)
 * @returns {Promise<boolean>}
 */
export async function verificarOllamaDisponible(hostURL) {
  return new Promise((resolve) => {
    try {
      const url = new URL(hostURL);
      const client = url.protocol === 'https:' ? https : http;

      const req = client.request({
        method: 'GET',
        hostname: url.hostname,
        port: url.port,
        path: '/api/tags', // endpoint liviano
        timeout: 3000
      }, res => {
        resolve(res.statusCode === 200);
      });

      req.on('error', () => resolve(false));
      req.on('timeout', () => {
        req.destroy();
        resolve(false);
      });

      req.end();
    } catch {
      resolve(false);
    }
  });
}
