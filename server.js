const http = require('http');
const fs = require('fs');
const path = require('path');

//*** Servidor Web ***//

const server = http.createServer((request, response) => {
    let filePath = './public' + (request.url === '/' ? '/index.html' : request.url);
    const extname = String(path.extname(filePath)).toLowerCase();
    const mimeTypes = {
        '.html': 'text/html',
        '.js': 'application/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpg',
        '.wav': 'audio/wav',
    };

    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            response.writeHead(404, { 'Content-Type': 'text/plain' });
            response.end(`Arquivo não encontrado: ${filePath}`);
            
            console.log(`[${new Date().toISOString()}] ${request.method} ${request.url} -> 404 (Arquivo não encontrado)`);
        } else {
            response.writeHead(200, { 'Content-Type': contentType });
            response.end(content, 'utf-8');
            
            console.log(`[${new Date().toISOString()}] ${request.method} ${request.url} -> 200 (${contentType})`);
        }
    });
});


//*** Iniciar servidor ***//

const PORT = 8050;
server.listen(PORT, () => {
    console.log(`Servidor HTTP rodando em http://localhost:${PORT}`);
});
