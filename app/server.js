const { createReadStream, promises: fs } = require('node:fs');
const { createServer } = require('node:http');
const { extname, join, normalize, resolve } = require('node:path');

const HOST = '0.0.0.0';
const PORT = Number(process.env.PORT || 8080);
const STATIC_DIR = resolve(__dirname, 'static');

const MIME_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.gif': 'image/gif',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.pdf': 'application/pdf',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webp': 'image/webp'
};

function sendError(response, statusCode) {
  const message = statusCode === 404 ? 'Not Found' : 'Internal Server Error';
  response.writeHead(statusCode, {
    'Content-Type': 'text/plain; charset=utf-8',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer'
  });
  response.end(message);
}

function resolveStaticPath(requestUrl) {
  const url = new URL(requestUrl, `http://${HOST}:${PORT}`);
  const decodedPath = decodeURIComponent(url.pathname);
  const relativePath = normalize(decodedPath === '/' ? '/index.html' : decodedPath).replace(/^\/+/, '');
  const filePath = resolve(join(STATIC_DIR, relativePath));

  if (!filePath.startsWith(`${STATIC_DIR}/`) && filePath !== STATIC_DIR) {
    return null;
  }

  return filePath;
}

async function handleRequest(request, response) {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.writeHead(405, {
      Allow: 'GET, HEAD',
      'Content-Type': 'text/plain; charset=utf-8'
    });
    response.end('Method Not Allowed');
    return;
  }

  const filePath = resolveStaticPath(request.url || '/');
  if (!filePath) {
    sendError(response, 404);
    return;
  }

  try {
    const stat = await fs.stat(filePath);
    if (!stat.isFile()) {
      sendError(response, 404);
      return;
    }

    response.writeHead(200, {
      'Content-Length': stat.size,
      'Content-Type': MIME_TYPES[extname(filePath).toLowerCase()] || 'application/octet-stream',
      'Last-Modified': stat.mtime.toUTCString(),
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'no-referrer'
    });

    if (request.method === 'HEAD') {
      response.end();
      return;
    }

    createReadStream(filePath).pipe(response);
  } catch (error) {
    if (error.code === 'ENOENT') {
      sendError(response, 404);
      return;
    }

    console.error(error);
    sendError(response, 500);
  }
}

const server = createServer((request, response) => {
  handleRequest(request, response).catch((error) => {
    console.error(error);
    sendError(response, 500);
  });
});

server.listen(PORT, HOST, () => {
  console.log(`pkistudio listening on http://${HOST}:${PORT}`);
});
