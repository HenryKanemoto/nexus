// Serve o build de produção (dist/app/browser) como um servidor estático qualquer,
// com fallback para index.html nas rotas internas (/painel, /catalogo...).
// Uso: npm run build && npm run servir   (porta: PORT=8080 npm run servir)
// Só usa o Node, sem dependências, para funcionar até sem internet.
import {createReadStream, existsSync, statSync} from 'node:fs';
import {createServer} from 'node:http';
import {extname, join, normalize, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const raiz = resolve(fileURLToPath(new URL('../dist/app/browser', import.meta.url)));
const porta = Number(process.env.PORT) || 4300;

const tipos = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.txt': 'text/plain; charset=utf-8',
};

if (!existsSync(join(raiz, 'index.html'))) {
  console.error('Build não encontrado em dist/app/browser. Rode antes: npm run build');
  process.exit(1);
}

createServer((req, res) => {
  const caminho = decodeURIComponent(new URL(req.url ?? '/', 'http://localhost').pathname);
  let arquivo = normalize(join(raiz, caminho));
  // Fora da pasta do build, inexistente ou pasta: devolve o index.html (rota do Angular)
  if (!arquivo.startsWith(raiz) || !existsSync(arquivo) || statSync(arquivo).isDirectory()) {
    arquivo = join(raiz, 'index.html');
  }
  res.writeHead(200, {'Content-Type': tipos[extname(arquivo)] ?? 'application/octet-stream'});
  createReadStream(arquivo).pipe(res);
}).listen(porta, () => {
  console.log(`Protem (build de produção) em http://localhost:${porta}`);
});
