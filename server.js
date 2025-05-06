const http = require('http');
const fs = require('fs');
const path = require('path');
const { Gpio } = require('pigpio');
const WebSocket = require('ws');

// ======== Servidor HTTP para servir arquivos estáticos ========
const server = http.createServer((req, res) => {
    let filePath = './public' + (req.url === '/' ? '/index.html' : req.url);
    const extname = String(path.extname(filePath)).toLowerCase();
    const mimeTypes = {
        '.html': 'text/html',
        '.js': 'application/javascript',
        '.css': 'text/css'
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

// ======== Servidor WebSocket ========
const wss = new WebSocket.Server({ server });
let socket = null;

wss.on('connection', ws => {
    console.log('Cliente WebSocket conectado');
    socket = ws;
});

// ======== GPIO com pigpio (modo entrada com polling) ========
const botaoDireita = new Gpio(5, { mode: Gpio.INPUT, pullUpDown: Gpio.PUD_UP, alert: true });
const botaoEsquerda = new Gpio(6, { mode: Gpio.INPUT, pullUpDown: Gpio.PUD_UP, alert: true });
const botaoThrust = new Gpio(13, { mode: Gpio.INPUT, pullUpDown: Gpio.PUD_UP, alert: true });

function enviarComando(acao) {
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ acao }));
    }
}

// Configura evento para detecção de borda de descida (botão pressionado)
function configurarBotao(botao, acao) {
    botao.glitchFilter(10000); // debounce de 10ms
    botao.on('alert', (level, tick) => {
        if (level === 0) {
            enviarComando(acao);
        }
    });
}

configurarBotao(botaoDireita, 'giro_direita');
configurarBotao(botaoEsquerda, 'giro_esquerda');
configurarBotao(botaoThrust, 'propulsor');

process.on('SIGINT', () => {
    botaoDireita.disableAlert();
    botaoEsquerda.disableAlert();
    botaoThrust.disableAlert();
    process.exit();
});

// ======== Iniciar servidor ========
const PORT = 8080;
server.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
