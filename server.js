const http = require('http');
const fs = require('fs');
const path = require('path');
const { Gpio } = require('onoff');
const WebSocket = require('ws');

// ======== Servidor HTTP para arquivos estáticos ========
const server = http.createServer((req, res) => {
    let filePath = './public' + (req.url === '/' ? '/index.html' : req.url);
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
            res.writeHead(404);
            res.end(`Arquivo não encontrado: ${filePath}`);
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

// ======== Servidor WebSocket embutido ========
const wss = new WebSocket.Server({ server });

let socket = null;
wss.on('connection', ws => {
    console.log('Cliente WebSocket conectado');
    socket = ws;
});

// ======== GPIO: Botões físicos ========
/* const btnDir = new Gpio(5, 'in', 'rising', { debounceTimeout: 10 });
const btnEsq = new Gpio(6, 'in', 'rising', { debounceTimeout: 10 });
const btnThrust = new Gpio(13, 'in', 'rising', { debounceTimeout: 10 });

function enviarComando(comando) {
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ acao: comando }));
    }
}

btnDir.watch((err, value) => {
    if (err) throw err;
    enviarComando('giro_direita');
});

btnEsq.watch((err, value) => {
    if (err) throw err;
    enviarComando('giro_esquerda');
});

btnThrust.watch((err, value) => {
    if (err) throw err;
    enviarComando('propulsor');
});

process.on('SIGINT', () => {
    btnDir.unexport();
    btnEsq.unexport();
    btnThrust.unexport();
    process.exit();
}); */

// ======== Iniciar servidor ========
const PORT = 8080;
server.listen(PORT, () => {
    console.log(`Servidor HTTP rodando em http://localhost:${PORT}`);
});
