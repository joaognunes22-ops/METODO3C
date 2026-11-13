// Servidor estático mínimo para desenvolvimento/testes (sem dependências).
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, extname, normalize, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const base = join(dirname(fileURLToPath(import.meta.url)), '..', process.argv[2] || 'dist');
const port = Number(process.argv[3] || 4173);
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.png': 'image/png' };

export function serve(dir = base, p = port) {
  return new Promise((resolve) => {
    const server = createServer(async (req, res) => {
      let path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
      if (path.endsWith('/')) path += 'index.html';
      const file = normalize(join(dir, path));
      if (!file.startsWith(dir)) { res.writeHead(403).end(); return; }
      try {
        const body = await readFile(file);
        res.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream' }).end(body);
      } catch { res.writeHead(404).end('404'); }
    });
    server.listen(p, () => resolve(server));
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await serve();
  console.log(`Servindo ${base} em http://localhost:${port}`);
}
