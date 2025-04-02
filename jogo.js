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
        x: 300,
        y: 100
    },
    velocidadeInicialModuloLunar: {
        x: 0,
        y: 0
    },
    combustivelInicialModuloLunar: 1000,
    anguloInicialModuloLunar: Math.PI * -.5,
    aceleracaoGravidadeLunar: 0.016,
    teclaAceleracao: 38,
    teclaRotacaoNegativa: 37,
    teclaRotacaoPositiva: 39,
}

let inversao = Boolean(Date.now() % 2);
let jogoAtivo = true;

let moduloLunar = {
    posicao: {
        x: inversao ? 700 : 300,
        y: 100,
    },
    angulo: Math.PI * (inversao ? .5 : -.5),
    largura: 20,
    altura: 20,
    cor: 'lightgray',
    motorLigado: false,
    rotacaoNegativa: false,
    rotacaoPositiva: false,
    velocidade: {
        x: inversao ? -2 : 2,
        y: 0,
    },
    aceleracao: 0.02,
    tamanhoChama: 20,
    combustivel: config.combustivelInicialModuloLunar,
    taxaConsumoCombustivel: 1
};

function desenharModuloLunar() {

    /* Design do módulo lunar */
    contexto.save();
    contexto.beginPath();
    contexto.translate(moduloLunar.posicao.x, moduloLunar.posicao.y);
    contexto.rotate(moduloLunar.angulo);
    contexto.rect(
        moduloLunar.largura * -.5,
        moduloLunar.altura * -.5,
        moduloLunar.largura,
        moduloLunar.altura
    );

    contexto.fillStyle = moduloLunar.cor;
    contexto.fill();
    contexto.closePath();

    detectarQueimaMotor();
    detectarRotacao();

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

function detectarRotacao() {

    if (moduloLunar.rotacaoNegativa) {
        moduloLunar.angulo -= Math.PI / 180;
    }
    else if (moduloLunar.rotacaoPositiva) {
        moduloLunar.angulo += Math.PI / 180;
    }

}

function detectarContato() {

    if (moduloLunar.posicao.y > (canvas.height - moduloLunar.altura * .5)) {

        let dadosAlunissagem;

        if (moduloLunar.velocidade.y > .5 || moduloLunar.velocidade.x > .5 || moduloLunar.angulo > 1) {

            dadosAlunissagem = {
                velocidadeFinal: moduloLunar.velocidade.y
            }
            mensagemFracasso(dadosAlunissagem);

        } else {
            dadosAlunissagem = {
                velocidadeFinal: moduloLunar.velocidade.y
            }
            mensagemVitoria(dadosAlunissagem);

        }
        jogoAtivo = false;
        finalizaJogo();

    }
}

function finalizaJogo() {

    jogoAtivo = false;
    
    moduloLunar.velocidade = {x: 0, y: 0};
    config.aceleracaoGravidadeLunar = 0;
    moduloLunar.motorLigado = false;
    moduloLunar.angulo = 0;
}

function reiniciarJogo() {

    window.location.reload();

    moduloLunar.posicao = { x: 400, y: 100 };
    moduloLunar.velocidade = { x: 0, y: 0 };
    moduloLunar.combustivel = config.combustivelInicialModuloLunar;
    moduloLunar.motorLigado = false;
    moduloLunar.angulo = config.anguloInicialModuloLunar;
    moduloLunar.rotacaoNegativa = false;
    moduloLunar.rotacaoPositiva = false;

}

function desenharChama() {

    contexto.beginPath();
    contexto.moveTo(moduloLunar.largura * -.5, moduloLunar.altura * .5);
    contexto.lineTo(moduloLunar.largura * .5, moduloLunar.altura * .5);
    contexto.lineTo(0, moduloLunar.altura * .5 + Math.random() * moduloLunar.tamanhoChama);
    /* contexto.moveTo(0, 20);
    contexto.lineTo(20, 20);
    contexto.lineTo(10, 20 + Math.random() * moduloLunar.tamanhoChama); */
    contexto.closePath();
    contexto.fillStyle = 'orange';
    contexto.fill();
}

function mostrarVelocidade() {
    contexto.font = "bold 18px Arial";
    contexto.textBaseline = "middle";
    contexto.fillStyle = "lightgray";
    let velocidade = `Velocidade: V: ${Math.abs(Math.round(10 * moduloLunar.velocidade.y))} m/s | H: ${Math.abs(Math.round(10 * moduloLunar.velocidade.x))} m/s`;
    contexto.fillText(velocidade, 60, 60);
}

function mostrarCombustivel() {
    contexto.font = "bold 18px Arial";
    contexto.textBaseline = "middle";
    contexto.fillStyle = "lightgray";
    let combustivel = `Combustível: ${Math.round(moduloLunar.combustivel / config.combustivelInicialModuloLunar * 100)}%`;
    contexto.fillText(combustivel, 60, 80);
}

function mostrarAngulo() {
    contexto.font = "bold 18px Arial";
    contexto.textBaseline = "middle";
    contexto.fillStyle = "lightgray";
    let angulo = `Ângulo: ${Math.abs(Math.round(moduloLunar.angulo * 180 / Math.PI) % 360)}°`;
    contexto.fillText(angulo, 60, 100);
}

function mostrarAltitude() {
    contexto.font = "bold 18px Arial";
    contexto.textBaseline = "middle";
    contexto.fillStyle = "lightgray";
    let angulo = `Altitude: ${Math.abs(Math.round(canvas.height - moduloLunar.posicao.y - (moduloLunar.altura * .5)))}m`;
    contexto.fillText(angulo, 60, 120);
}

function mensagemVitoria(dadosAlunissagem) {
    contexto.save();
    contexto.font = "bold 18px Consolas";
    contexto.textAlign = "center";
    contexto.textBaseline = "middle";
    contexto.fillStyle = "lightgray";
    let mensagem = `
        VOCÊ ALUNISSOU COM SUCESSO!\n 
        Velocidade Final: V: ${Math.abs(Math.round(10 * dadosAlunissagem.velocidadeFinal))}m/s | H: `;
    contexto.fillText(mensagem, 400, 300);
    contexto.restore();
}

function mensagemFracasso(dadosAlunissagem) {
    contexto.save();
    contexto.font = "bold 18px Consolas";
    contexto.textAlign = "center";
    contexto.textBaseline = "middle";
    contexto.fillStyle = "lightgray";
    let mensagem = `VOCÊ E SEUS COLEGAS ESTÃO MORTOS 😵`;
    let velocidade = `Velocidade Final: V: ${Math.abs(Math.round(10 * dadosAlunissagem.velocidadeFinal))}m/s | H: ${dadosAlunissagem.velocidadeFinal}`;
    contexto.fillText(mensagem, 400, 300);
    contexto.fillText(velocidade, 400, 320);
    contexto.restore();
}

function desenhar() {

    if (jogoAtivo) {
        // limpar a tela
        contexto.clearRect(0, 0, canvas.width, canvas.height);

        detectarContato();
        atracaoGravitacional();
        desenharModuloLunar();
        mostrarVelocidade();
        mostrarCombustivel();
        mostrarAngulo();
        mostrarAltitude();

        // chama a função desenhar a cada quadro
        requestAnimationFrame(desenhar);
    }
    
}

/*  Seção de controle */

document.addEventListener('keydown', teclaPressionada);

function teclaPressionada(evento) {

    // Pressionando a tecla "seta para cima" para ligar o motor
    if (evento.keyCode === config.teclaAceleracao && moduloLunar.combustivel > 0) {
        moduloLunar.motorLigado = true;
    }

    // Pressionando a tecla "seta à esquerda" para rotacionar negativamente
    else if (evento.keyCode === config.teclaRotacaoNegativa) {
        moduloLunar.rotacaoNegativa = true;
    }

    // Pressionando a tecla "seta à direita" para rotacionar positivamente
    else if (evento.keyCode === config.teclaRotacaoPositiva) {
        moduloLunar.rotacaoPositiva = true;
    }

}

document.addEventListener('keyup', teclaSolta);

function teclaSolta(evento) {

    // Soltando a tecla "seta para cima" para desligar o motor
    if (evento.keyCode === config.teclaAceleracao) {
        moduloLunar.motorLigado = false;
    }

    // Soltando a tecla "seta à esquerda"
    else if (evento.keyCode === config.teclaRotacaoNegativa) {
        moduloLunar.rotacaoNegativa = false;
    }

    // Soltando a tecla "seta à direita"
    else if (evento.keyCode === config.teclaRotacaoPositiva) {
        moduloLunar.rotacaoPositiva = false;
    }

}

function atracaoGravitacional() {

    moduloLunar.posicao.x += moduloLunar.velocidade.x;
    moduloLunar.posicao.y += moduloLunar.velocidade.y;
    if (moduloLunar.motorLigado) {

        moduloLunar.velocidade.y -= moduloLunar.aceleracao * Math.cos(moduloLunar.angulo);
        moduloLunar.velocidade.x += moduloLunar.aceleracao * Math.sin(moduloLunar.angulo);

    }
    moduloLunar.velocidade.y += config.aceleracaoGravidadeLunar;

}

desenhar();
