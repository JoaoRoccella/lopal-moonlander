/* 
    Moon Lander | Um jogo de alunissagem
    Autor: João Marcos Roccella Alves
    GitHub: https://github.com/joaoroccella
    Email: joao.a@docente.senai.br
    Versão: 0.1.0 
    Lander: https://www.flaticon.com/br/icones-gratis/lander
*/

/** @type {HTMLCanvasElement} */

/*  Seção de modelagem de dados */

let canvas = document.querySelector('#jogo');
let contexto = canvas.getContext('2d');

let configuracao = {
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
let colisao = false;
let jogoAtivo = true;
let estrelas = criarEstrelas();

let moduloLunar = {
    posicao: {
        x: inversao ? 700 : 100,
        y: 100,
    },
    angulo: Math.PI * (inversao ? .5 : -.5),
    largura: 30,
    altura: 30,
    cor: 'lightgray',
    motorLigado: false,
    rotacaoNegativa: false,
    rotacaoPositiva: false,
    velocidade: {
        x: inversao ? -3 : 3,
        y: 0,
    },
    aceleracao: 0.02,
    tamanhoChama: 20,
    combustivel: configuracao.combustivelInicialModuloLunar,
    razaoConsumoCombustivel: 1,
    razaoRotacao: 1.1,
};

function criarEstrelas() {

    let estrelas = [{}];

    for (let i = 0; i < 500; i++) {
        estrelas[i] = {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            raio: Math.sqrt(Math.random() * 2),
            transparencia: .95,
            diminuicao: true,
            razaoDeCintilacao: Math.random() * 0.05
        };
    }

    return estrelas;

}

function desenharEstrelas(estrelas) {
    for (let i = 0; i < estrelas.length; i++) {
        contexto.save();
        let estrela = estrelas[i];
        contexto.beginPath();
        contexto.arc(estrela.x, estrela.y, estrela.raio, 0, 2 * Math.PI);
        contexto.closePath();
        contexto.fillStyle = "rgba(255, 255, 255, " + estrela.transparencia + ")";
        contexto.fill();
        contexto.restore();
    }
}

const imagemLander = new Image();
imagemLander.src = 'lander.png';

function desenharModuloLunar() {

    /* Design do módulo lunar */
    contexto.save();
    contexto.beginPath();
    contexto.translate(moduloLunar.posicao.x, moduloLunar.posicao.y);
    contexto.rotate(moduloLunar.angulo);

    contexto.drawImage(imagemLander, -moduloLunar.largura / 2, -moduloLunar.altura / 2, moduloLunar.largura, moduloLunar.altura);
    /* contexto.rect(
        moduloLunar.largura * -.5,
        moduloLunar.altura * -.5,
        moduloLunar.largura,
        moduloLunar.altura
    );

    contexto.fillStyle = moduloLunar.cor;
    contexto.fill(); */
    contexto.closePath();
    
    detectarQueimaMotor();
    detectarRotacao();
    
    contexto.restore();
}

function detectarQueimaMotor() {

    if (moduloLunar.motorLigado) {

        if (moduloLunar.combustivel > 0) {

            desenharChama();
            moduloLunar.combustivel -= moduloLunar.razaoConsumoCombustivel;

        } else {

            moduloLunar.motorLigado = false;
        }
    }

}

function detectarRotacao() {

    if (moduloLunar.rotacaoNegativa) {
        moduloLunar.angulo -= (Math.PI / 180) / moduloLunar.razaoRotacao;
    }
    else if (moduloLunar.rotacaoPositiva) {
        moduloLunar.angulo += (Math.PI / 180) / moduloLunar.razaoRotacao;
    }

}

function detectarContato() {

    if (moduloLunar.posicao.y > (canvas.height - moduloLunar.altura * .5)) {

        let dadosAlunissagem;

        if (
            Math.abs(moduloLunar.velocidade.y) > .5 ||
            Math.abs(moduloLunar.velocidade.x) > .5 ||
            Math.abs(Math.round(moduloLunar.angulo * 180 / Math.PI) % 360) > 3) {
            
            colisao = true;
            dadosAlunissagem = obterDadosAlunissagem(moduloLunar);
            mensagemFracasso(dadosAlunissagem);

        } else {
            
            mensagemVitoria();


        }
        jogoAtivo = false;
        finalizarJogo();

    }
}

function obterDadosAlunissagem(moduloLunar) {
    
    return {
        velocidadeFinal: {
            x: moduloLunar.velocidade.x,
            y: moduloLunar.velocidade.y,
        },
        angulo: moduloLunar.angulo,
        combustivel: moduloLunar.combustivel,
    }
}

function calcularPontuacao(moduloLunar) {

    const dadosAlunissagem = obterDadosAlunissagem(moduloLunar);

    const pontuacaoInicial = 1000;
    let pontuacaoJogador = pontuacaoInicial;

    console.log(pontuacaoJogador);
    pontuacaoJogador -= Math.abs(Math.round(dadosAlunissagem.velocidadeFinal.x * 1000));
    console.log(pontuacaoJogador);
    pontuacaoJogador -= Math.abs(Math.round(dadosAlunissagem.velocidadeFinal.y * 1000));
    console.log(pontuacaoJogador);
    pontuacaoJogador -= Math.abs(Math.round(moduloLunar.angulo * 1800 / Math.PI) % 360);
    console.log(pontuacaoJogador);
    pontuacaoJogador += Math.abs(Math.round(dadosAlunissagem.combustivel));
    console.log(pontuacaoJogador);

    return pontuacaoJogador;

}

function finalizarJogo() {

    jogoAtivo = false;
    
    moduloLunar.velocidade = { x: 0, y: 0 };
    configuracao.aceleracaoGravidadeLunar = 0;
    moduloLunar.motorLigado = false;
    moduloLunar.angulo = colisao ? moduloLunar.angulo : 0;

    colisao = false;
}

function reiniciarJogo() {

    window.location.reload();

    moduloLunar.posicao = { x: 400, y: 100 };
    moduloLunar.velocidade = { x: 0, y: 0 };
    moduloLunar.combustivel = configuracao.combustivelInicialModuloLunar;
    moduloLunar.motorLigado = false;
    moduloLunar.angulo = configuracao.anguloInicialModuloLunar;
    moduloLunar.rotacaoNegativa = false;
    moduloLunar.rotacaoPositiva = false;

}

function desenharChama() {

    contexto.beginPath();
    contexto.moveTo((moduloLunar.largura * -.5) + 10, (moduloLunar.altura * .5) -5);
    contexto.lineTo((moduloLunar.largura * .5) -10, (moduloLunar.altura * .5) -5);
    contexto.lineTo(0, moduloLunar.altura * .5 + Math.random() * moduloLunar.tamanhoChama);
    contexto.closePath();
    contexto.fillStyle = 'orange';
    contexto.fill();
}

function mostrarVelocidade() {
    contexto.font = "bold 18px Arial";
    contexto.textBaseline = "middle";
    contexto.fillStyle = "lightgray";
    let velocidade = `Velocidade: V: ${Math.abs(Math.round(10 * moduloLunar.velocidade.y))} m/s | H: ${Math.abs(Math.round(10 * moduloLunar.velocidade.x))} m/s`;
    contexto.fillText(velocidade, 40, 40);
}

function mostrarCombustivel() {
    contexto.font = "bold 18px Arial";
    contexto.textBaseline = "middle";
    contexto.fillStyle = "lightgray";
    let combustivel = `Combustível: ${Math.round(moduloLunar.combustivel / configuracao.combustivelInicialModuloLunar * 100)} %`;
    contexto.fillText(combustivel, 40, 60);
}

function mostrarAngulo() {
    contexto.font = "bold 18px Arial";
    contexto.textBaseline = "middle";
    contexto.fillStyle = "lightgray";
    let angulo = `Ângulo: ${Math.abs(Math.round(moduloLunar.angulo * 180 / Math.PI) % 360)} °`;
    contexto.fillText(angulo, 40, 80);
}

function mostrarAltitude() {
    contexto.font = "bold 18px Arial";
    contexto.textBaseline = "middle";
    contexto.fillStyle = "lightgray";
    let angulo = `Altitude: ${Math.abs(Math.round(canvas.height - moduloLunar.posicao.y - (moduloLunar.altura * .5)))} m`;
    contexto.fillText(angulo, 40, 100);
}

function mensagemVitoria() {
    contexto.save();
    contexto.font = "bold 18px Consolas";
    contexto.textAlign = "center";
    contexto.textBaseline = "middle";
    contexto.fillStyle = "lightgray";
    let mensagem = `VOCÊ ALUNISSOU COM SUCESSO!`;
    let pontuacao = `PONTUAÇÃO: ${calcularPontuacao(moduloLunar)}`;
    contexto.fillText(mensagem, canvas.width / 2, canvas.height / 2);
    contexto.fillText(pontuacao, canvas.width / 2, (canvas.height / 2) + 20);
    contexto.restore();
}

function mensagemFracasso(dadosAlunissagem) {
    
    contexto.save();
    contexto.font = "bold 18px Consolas";
    contexto.textAlign = "center";
    contexto.textBaseline = "middle";
    contexto.fillStyle = "lightgray";
    let mensagem = `VOCÊ VIROU POEIRA ESPACIAL 😵`;

    let velocidadeFinal = `Velocidade Final: V: ${Math.abs(Math.round(10 * dadosAlunissagem.velocidadeFinal.y))} m/s | H: ${Math.abs(Math.round(10 * dadosAlunissagem.velocidadeFinal.x))} m/s`;
    
    let anguloFinal = `Angulo Final: ${Math.abs(Math.round(dadosAlunissagem.angulo * 180 / Math.PI) % 360)} °`;
    contexto.fillText(mensagem, canvas.width / 2, canvas.height / 2);
    contexto.fillText(velocidadeFinal, canvas.width / 2, (canvas.height / 2) + 20);
    contexto.fillText(anguloFinal, canvas.width / 2, (canvas.height / 2) + 40);
    contexto.restore();
}

function desenharTela() {

    if (jogoAtivo) {
        // limpar a tela
        contexto.clearRect(0, 0, canvas.width, canvas.height);

        detectarContato();
        atracaoGravitacional();
        desenharEstrelas(estrelas);
        desenharModuloLunar();
        mostrarVelocidade();
        mostrarCombustivel();
        mostrarAngulo();
        mostrarAltitude();

        // chama a função desenhar a cada quadro
        requestAnimationFrame(desenharTela);
    }

}

/*  Seção de controle */

document.addEventListener('keydown', teclaPressionada);

function teclaPressionada(evento) {

    // Pressionando a tecla "seta para cima" para ligar o motor
    if (evento.keyCode === configuracao.teclaAceleracao && moduloLunar.combustivel > 0) {
        moduloLunar.motorLigado = true;
    }

    // Pressionando a tecla "seta à esquerda" para rotacionar negativamente
    else if (evento.keyCode === configuracao.teclaRotacaoNegativa) {
        moduloLunar.rotacaoNegativa = true;
    }

    // Pressionando a tecla "seta à direita" para rotacionar positivamente
    else if (evento.keyCode === configuracao.teclaRotacaoPositiva) {
        moduloLunar.rotacaoPositiva = true;
    }

}

document.addEventListener('keyup', teclaSolta);

function teclaSolta(evento) {

    // Soltando a tecla "seta para cima" para desligar o motor
    if (evento.keyCode === configuracao.teclaAceleracao) {
        moduloLunar.motorLigado = false;
    }

    // Soltando a tecla "seta à esquerda"
    else if (evento.keyCode === configuracao.teclaRotacaoNegativa) {
        moduloLunar.rotacaoNegativa = false;
    }

    // Soltando a tecla "seta à direita"
    else if (evento.keyCode === configuracao.teclaRotacaoPositiva) {
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
    moduloLunar.velocidade.y += configuracao.aceleracaoGravidadeLunar;

}

desenharTela();
