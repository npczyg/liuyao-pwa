import { createReadStream, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = normalize(join(fileURLToPath(new URL('.', import.meta.url)), '..'));
const port = Number(process.env.PORT || 4173);
const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
};

createServer((request, response) => {
  const relative = decodeURIComponent(new URL(request.url, `http://${request.headers.host}`).pathname).replace(/^\/+/, '');
  let path = normalize(join(root, relative || 'index.html'));
  if (!path.startsWith(root)) {
    response.writeHead(403).end('Forbidden');
    return;
  }
  try {
    if (statSync(path).isDirectory()) path = join(path, 'index.html');
    response.writeHead(200, { 'Content-Type': mimeTypes[extname(path)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    createReadStream(path).pipe(response);
  } catch {
    response.writeHead(404).end('Not found');
  }
}).listen(port, '127.0.0.1', () => {
  process.stdout.write(`六爻排盘预览：http://127.0.0.1:${port}\n`);
});
