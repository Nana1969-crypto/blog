'use strict';
// Servidor estático mínimo para verificação local do dist/ (não é produção;
// em produção o dist/ vai direto para CDN — ADR-0004).
const http = require('http');
const fs = require('fs');
const path = require('path');

const DIST = path.join(__dirname, '..', 'dist');
const PORT = process.env.PORT || 8787;
const MIME = { '.html': 'text/html; charset=utf-8', '.xml': 'application/xml', '.txt': 'text/plain' };

http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p.endsWith('/')) p += 'index.html';
  const file = path.join(DIST, path.normalize(p).replace(/^(\.\.[/\\])+/, ''));
  if (!file.startsWith(DIST) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(fs.existsSync(path.join(DIST, '404.html')) ? fs.readFileSync(path.join(DIST, '404.html')) : 'not found');
    return;
  }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
  res.end(fs.readFileSync(file));
}).listen(PORT, () => console.log(`serve: http://localhost:${PORT}`));
