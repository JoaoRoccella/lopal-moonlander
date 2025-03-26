/** @type {HTMLCanvasElement} */

let canvas = document.querySelector('#jogo');
let contexto = canvas.getContext('2d');

// contexto.beginPath();
// contexto.rect(0, 0, 100, 100);
// contexto.fillStyle = 'purple';
// contexto.fill();
// contexto.strokeStyle = 'black';
// contexto.stroke();

// contexto.beginPath();
// contexto.moveTo(100, 100);
// contexto.lineTo(200, 100);
// contexto.lineTo(100, 200);
// contexto.lineTo(100, 100);
// contexto.fillStyle = 'red';
// contexto.fill();

let moduloLunar = {
    posicao: {
        x: 100,
        y: 100
    },
    angulo: 0,
    largura: 20,
    altura: 20,
    cor: '#333',
    motorLigado: false,
    velocidade: {
        x: 0,
        y: 0
    }
};

function desenharModuloLunar() {
    contexto.save();
    contexto.beginPath();
    contexto.translate(moduloLunar.posicao.x, moduloLunar.posicao.y);
    contexto.rotate(moduloLunar.angulo);
    contexto.rect(moduloLunar.largura * -0.5, moduloLunar.altura * -0.5, moduloLunar.largura, moduloLunar.altura);
    contexto.fillStyle = moduloLunar.cor;
    contexto.fill();
    contexto.closePath();
    
    if (moduloLunar.motorLigado) {
        desenharChama();
    }

    contexto.restore();
}

function desenharChama() {
    contexto.beginPath();
    contexto.moveTo(moduloLunar.largura * -0.5, moduloLunar.altura * 0.5);
    contexto.lineTo(moduloLunar.largura * 0.5, moduloLunar.altura * 0.5);
    contexto.lineTo(0, moduloLunar.altura * 0.5 + Math.random() * 20);
    // contexto.lineTo(moduloLunar.largura * -0.5, moduloLunar.altura * 0.5);
    contexto.closePath();
    contexto.fillStyle = 'orange';
    contexto.fill();
}

let x = 100;

function desenhar() {
    // limpar a tela
    contexto.clearRect(0, 0, canvas.width, canvas.height);

    
    contexto.save();
    contexto.translate(canvas.width / 2, canvas.height / 2);
    contexto.beginPath();
    // contexto.arc(x, 100, 25, 0, 2 * Math.PI);
    contexto.rotate(Math.PI / 4);
    contexto.rect(x, 100, 25, 10);
    contexto.fillStyle = '#333';
    contexto.fill();
    contexto.restore();
    
    x += 1;

    atracaoGravitacional();
    desenharModuloLunar();
    requestAnimationFrame(desenhar);
}

document.addEventListener('keydown', teclaPressionada);

// Pressionando a tecla "seta para cima" para ligar o motor
function teclaPressionada(evento) {
    
    if (evento.keyCode == 38) {
        moduloLunar.motorLigado = true;
    }
    
}

document.addEventListener('keyup', teclaSolta);

// Soltando a tecla "seta para cima" para desligar o motor
function teclaSolta(evento) {

    if (evento.keyCode == 38) {
        moduloLunar.motorLigado = false;
    }

}

let gravidade = 0.01;

function atracaoGravitacional() {

    moduloLunar.posicao.x += moduloLunar.velocidade.x;
    moduloLunar.posicao.y += moduloLunar.velocidade.y;
    if (moduloLunar.motorLigado) {

        moduloLunar.velocidade.y -= 0.02;
    }
    moduloLunar.velocidade.y += gravidade;

}

desenhar();
