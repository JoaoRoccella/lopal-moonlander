/* 
    Moon Lander | Um jogo de alunissagem
    Autor: João Marcos Roccella Alves
    GitHub: https://github.com/joaoroccella
    Email: joao.a@docente.senai.br
    Versão: 0.1.0 
*/

/** @type {HTMLCanvasElement} */

/*  Seção de modelagem de dados */

let canvas = document.querySelector('#jogo');
let contexto = canvas.getContext('2d');

let config = {
    posicaoInicialModuloLunar: {
        x: 400,
        y: 100
    },
    velocidadeInicialModuloLunar: 0,
    combustivelInicialModuloLunar: 1000,
    aceleracaoGravidadeLunar: 0.016,
    teclaAceleracao: 38,
}

let moduloLunar = {
    posicao: {
        x: config.posicaoInicialModuloLunar.x,
        y: config.posicaoInicialModuloLunar.y
    },
    angulo: 0,
    largura: 20,
    altura: 20,
    cor: 'lightgray',
    motorLigado: false,
    velocidade: {
        x: 0,
        y: 0
    },
    aceleracao: 0.032,
    tamanhoChama: 20,
    combustivel: config.combustivelInicialModuloLunar,
    taxaConsumoCombustivel: 1
};

function desenharModuloLunar() {

    /*  Design do módulo lunar */
    contexto.save();
    contexto.beginPath();
    contexto.translate(moduloLunar.posicao.x, moduloLunar.posicao.y);
    contexto.rotate(moduloLunar.angulo);
    contexto.rect(moduloLunar.largura * -0.5, moduloLunar.altura * -0.5, moduloLunar.largura, moduloLunar.altura);
    contexto.fillStyle = moduloLunar.cor;
    contexto.fill();
    contexto.closePath();
    
    detectarQueimaMotor();
    // detectarColisao();
    
    contexto.restore();
}

function detectarQueimaMotor() {

    if (moduloLunar.motorLigado) {

        if (moduloLunar.combustivel > 0) {

            desenharChama();
            moduloLunar.combustivel -= moduloLunar.taxaConsumoCombustivel;

        } else {

            moduloLunar.motorLigado = false;
        }
    }

}

function detectarContato() {

    if (moduloLunar.posicao.y > (canvas.height - moduloLunar.altura * .5)) {
        
        if (moduloLunar.velocidade.y <= 0.5) {
            
            alert('Pousou com sucesso!');
        } else {

            alert('COLISÃO!');
        }

        reiniciarJogo();

    }
}

function reiniciarJogo() {

    moduloLunar.posicao.y = config.posicaoInicialModuloLunar.y;
    moduloLunar.velocidade.y = config.velocidadeInicialModuloLunar;
    moduloLunar.combustivel = config.combustivelInicialModuloLunar;
    moduloLunar.motorLigado = false;

}

function desenharChama() {

    contexto.beginPath();
    contexto.moveTo(moduloLunar.largura * -0.5, moduloLunar.altura * 0.5);
    contexto.lineTo(moduloLunar.largura * 0.5, moduloLunar.altura * 0.5);
    contexto.lineTo(0, moduloLunar.altura * 0.5 + Math.random() * moduloLunar.tamanhoChama);
    contexto.closePath();
    contexto.fillStyle = 'orange';
    contexto.fill();
}

function mostrarVelocidade() {
    contexto.font = "bold 18px Arial";
    // contexto.textAlign = "center";
    contexto.textBaseline = "middle";
    contexto.fillStyle = "lightgray";
    let velocidade = `Velocidade: ${Math.floor(10 * moduloLunar.velocidade.y)} m/s`;
    contexto.fillText(velocidade, 60, 60);
}

function mostrarCombustivel() {
    contexto.font = "bold 18px Arial";
    // contexto.textAlign = "center";
    contexto.textBaseline = "middle";
    contexto.fillStyle = "lightgray";
    let combustivel = `Combustível: ${Math.floor(moduloLunar.combustivel)}`;
    contexto.fillText(combustivel, 60, 80);
}

function desenhar() {
    // limpar a tela
    contexto.clearRect(0, 0, canvas.width, canvas.height);

    detectarContato();
    atracaoGravitacional();
    desenharModuloLunar();
    mostrarVelocidade();
    mostrarCombustivel();

    // chama a função desenhar a cada quadro
    requestAnimationFrame(desenhar);
}

/*  Seção de controle */

document.addEventListener('keydown', teclaPressionada);

// Pressionando a tecla "seta para cima" para ligar o motor
function teclaPressionada(evento) {

    if (evento.keyCode === config.teclaAceleracao && moduloLunar.combustivel > 0) {
        moduloLunar.motorLigado = true;
    }

}

document.addEventListener('keyup', teclaSolta);

// Soltando a tecla "seta para cima" para desligar o motor
function teclaSolta(evento) {

    if (evento.keyCode === config.teclaAceleracao) {
        moduloLunar.motorLigado = false;
    }

}

function atracaoGravitacional() {

    moduloLunar.posicao.x += moduloLunar.velocidade.x;
    moduloLunar.posicao.y += moduloLunar.velocidade.y;
    if (moduloLunar.motorLigado) {

        moduloLunar.velocidade.y -= moduloLunar.aceleracao;
    }
    moduloLunar.velocidade.y += config.aceleracaoGravidadeLunar;

}

desenhar();
