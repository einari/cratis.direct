// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

// Dependency-free static server for the site. Opens the default browser once listening.
//   yarn serve | npm run serve            -> http://localhost:4321
//   PORT=8080 npm run serve               -> http://localhost:8080
//   npm run serve -- --no-open            -> don't launch a browser

import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { exec } from 'node:child_process';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('.', import.meta.url)));
const startPort = Number(process.env.PORT ?? 4321);
const shouldOpen = !process.argv.includes('--no-open');

const types = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.mjs': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.ico': 'image/x-icon',
    '.txt': 'text/plain; charset=utf-8',
    '.xml': 'application/xml; charset=utf-8'
};

async function resolveFile(urlPath) {
    const decoded = decodeURIComponent(urlPath.split('?')[0]);
    let file = normalize(join(root, decoded));
    if (file !== root && !file.startsWith(root + sep)) return null; // path traversal guard
    try {
        const info = await stat(file);
        if (info.isDirectory()) file = join(file, 'index.html');
        await stat(file);
        return file;
    } catch {
        return null;
    }
}

const server = createServer(async (req, res) => {
    const file = await resolveFile(req.url ?? '/');
    if (!file) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Not found');
        return;
    }
    try {
        const body = await readFile(file);
        res.writeHead(200, {
            'Content-Type': types[extname(file).toLowerCase()] ?? 'application/octet-stream',
            'Cache-Control': 'no-store'
        });
        res.end(body);
    } catch {
        res.writeHead(500);
        res.end('Server error');
    }
});

function openBrowser(url) {
    const command = process.platform === 'darwin' ? `open "${url}"`
        : process.platform === 'win32' ? `start "" "${url}"`
        : `xdg-open "${url}"`;
    exec(command, error => {
        if (error) console.log(`Could not open a browser automatically. Visit ${url}`);
    });
}

function listen(port) {
    server.once('error', error => {
        if (error.code === 'EADDRINUSE' && port < startPort + 20) {
            listen(port + 1);
        } else {
            console.error(error.message);
            process.exit(1);
        }
    });
    server.listen(port, () => {
        const url = `http://localhost:${port}`;
        console.log(`cratis.direct  →  ${url}`);
        console.log('Ctrl-C to stop.');
        if (shouldOpen) openBrowser(url);
    });
}

listen(startPort);
