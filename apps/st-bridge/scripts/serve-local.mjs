#!/usr/bin/env node

import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DEFAULT_HOST = '127.0.0.1';
const DEFAULT_PORT = 4173;

function readArg(name, fallback = '') {
  const index = process.argv.indexOf(`--${name}`);
  if (index < 0 || index + 1 >= process.argv.length) return fallback;
  return process.argv[index + 1] || fallback;
}

function normalizeRoot(value) {
  return path.resolve(process.cwd(), value || '.');
}

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.html') return 'text/html; charset=utf-8';
  if (ext === '.js' || ext === '.mjs') return 'text/javascript; charset=utf-8';
  if (ext === '.css') return 'text/css; charset=utf-8';
  if (ext === '.json') return 'application/json; charset=utf-8';
  if (ext === '.svg') return 'image/svg+xml';
  if (ext === '.png') return 'image/png';
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
  if (ext === '.webp') return 'image/webp';
  if (ext === '.gif') return 'image/gif';
  if (ext === '.ico') return 'image/x-icon';
  if (ext === '.woff') return 'font/woff';
  if (ext === '.woff2') return 'font/woff2';
  if (ext === '.ttf') return 'font/ttf';
  if (ext === '.wasm') return 'application/wasm';
  return 'application/octet-stream';
}

function writeCorsHeaders(res, extra = {}) {
  res.writeHead(extra.status || 200, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,HEAD,OPTIONS',
    'Access-Control-Allow-Headers': '*',
    'Cross-Origin-Resource-Policy': 'cross-origin',
    ...extra.headers
  });
}

async function resolveFilePath(rootDir, requestUrl) {
  const url = new URL(requestUrl || '/', 'http://127.0.0.1');
  const decodedPath = decodeURIComponent(url.pathname || '/');
  const candidates = [decodedPath];
  if (decodedPath === '/pkm-pink' || decodedPath.startsWith('/pkm-pink/')) {
    candidates.push(decodedPath.replace(/^\/pkm-pink\/?/, '/'));
  }

  for (const candidatePath of candidates) {
    const relativePath = candidatePath.replace(/^\/+/, '') || 'index.html';
    const candidate = path.resolve(rootDir, relativePath);
    if (!candidate.startsWith(rootDir + path.sep) && candidate !== rootDir) {
      continue;
    }

    const candidateStat = await stat(candidate).catch(() => null);
    if (candidateStat?.isDirectory()) return path.join(candidate, 'index.html');
    if (candidateStat?.isFile()) return candidate;
  }
  return null;
}

async function serveFile(req, res, rootDir) {
  if (req.method === 'OPTIONS') {
    writeCorsHeaders(res, { status: 204 });
    res.end();
    return;
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    writeCorsHeaders(res, { status: 405, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
    res.end('Method Not Allowed');
    return;
  }

  const filePath = await resolveFilePath(rootDir, req.url);
  if (!filePath) {
    writeCorsHeaders(res, { status: 404, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
    res.end('Not Found');
    return;
  }

  const fileStat = await stat(filePath).catch(() => null);
  if (!fileStat?.isFile()) {
    writeCorsHeaders(res, { status: 404, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
    res.end('Not Found');
    return;
  }

  writeCorsHeaders(res, {
    headers: {
      'Content-Type': getMimeType(filePath),
      'Content-Length': String(fileStat.size),
      'Cache-Control': 'no-store'
    }
  });
  if (req.method === 'HEAD') {
    res.end();
    return;
  }
  createReadStream(filePath).pipe(res);
}

const rootDir = normalizeRoot(readArg('root', '.'));
const host = readArg('host', DEFAULT_HOST);
const port = Number(readArg('port', String(DEFAULT_PORT))) || DEFAULT_PORT;

const server = createServer((req, res) => {
  serveFile(req, res, rootDir).catch((error) => {
    console.error('[PKM local server] request failed:', error);
    writeCorsHeaders(res, { status: 500, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
    res.end('Internal Server Error');
  });
});

server.listen(port, host, () => {
  const scriptPath = path.relative(process.cwd(), fileURLToPath(import.meta.url));
  console.log(`[PKM local server] ${scriptPath}`);
  console.log(`[PKM local server] serving ${rootDir}`);
  console.log(`[PKM local server] http://${host}:${port}`);
});
