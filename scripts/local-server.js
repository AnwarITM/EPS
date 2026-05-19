const fs = require('fs');
const http = require('http');
const path = require('path');

const host = process.env.HOST || '127.0.0.1';
const port = Number(process.env.PORT || 5173);
const root = path.join(__dirname, '..');

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png'
};

const server = http.createServer((request, response) => {
  const url = new URL(request.url, `http://${host}:${port}`);
  let requestPath = decodeURIComponent(url.pathname);
  if (requestPath === '/') requestPath = '/index.html';

  const filePath = path.normalize(path.join(root, requestPath));
  if (!filePath.startsWith(root)) {
    response.writeHead(403);
    response.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      response.writeHead(404);
      response.end('Not found');
      return;
    }

    response.writeHead(200, {
      'Content-Type': contentTypes[path.extname(filePath).toLowerCase()] || 'application/octet-stream'
    });
    response.end(data);
  });
});

server.listen(port, host, () => {
  console.log(`EPS local server running at http://${host}:${port}/`);
});
