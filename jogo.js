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

let inversao = Boolean(Date.now() % 2);
let colisao = false;
let jogoAtivo = true;
let estrelas = criarEstrelas();

let configuracao = {
    aceleracaoGravidadeLunar: 0.016,
    teclaAceleracao: 38,
    teclaRotacaoNegativa: 37,
    teclaRotacaoPositiva: 39,
    pontuacaoMaxima: 0,
}

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
    combustivelInicial: 1000,
    combustivel: 1000,
    razaoConsumoCombustivel: 1,
    razaoRotacao: 1.1,
};

function criarEstrelas() {

    let estrelas = [];

    for (let i = 0; i < 500; i++) {
        estrelas[i] = {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            raio: Math.sqrt(Math.random() * 2),
            brilho: Math.random(),
            apagando: true,
            razaoDeCintilacao: Math.random() * .01
        };
    }

    return estrelas;

}

function desenharEstrelas(estrelas) {
    contexto.save();

    contexto.fillStyle = '#000';
    contexto.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < estrelas.length; i++) {
        let estrela = estrelas[i];
        contexto.beginPath();
        contexto.arc(estrela.x, estrela.y, estrela.raio, 0, 2 * Math.PI);
        contexto.closePath();
        contexto.fillStyle = `rgba(255, 0, 255, ${estrela.brilho})`;
        contexto.fill();

        if (estrela.apagando) {
            
            estrela.brilho -= estrela.razaoDeCintilacao;

            if (estrela.brilho < .3) {

                estrela.apagando = false;
            }
        } else {

            estrela.brilho += estrela.razaoDeCintilacao;

            if (estrela.brilho > .9) {
                
                estrela.apagando = true;
            }
        }
        
    }
    contexto.restore();
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
            exibirMensagemFracasso(dadosAlunissagem);

        } else {
            
            const pontuacao = calcularPontuacao(moduloLunar);
            exibirMensagemVitoria(pontuacao);

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

    pontuacaoJogador -= Math.abs(Math.round(dadosAlunissagem.velocidadeFinal.x * 1000));
    pontuacaoJogador -= Math.abs(Math.round(dadosAlunissagem.velocidadeFinal.y * 1000));
    pontuacaoJogador -= Math.abs(Math.round(moduloLunar.angulo * 1800 / Math.PI) % 360);
    pontuacaoJogador += Math.abs(Math.round(dadosAlunissagem.combustivel));

    return {
        pontuacao: pontuacaoJogador,
        novoRecorde: pontuacaoJogador > configuracao.pontuacaoMaxima
    };

}

function finalizarJogo() {

    jogoAtivo = false;
    
    moduloLunar.velocidade = { x: 0, y: 0 };
    moduloLunar.motorLigado = false;
    moduloLunar.angulo = colisao ? moduloLunar.angulo : 0;

    colisao = false;
}

function iniciarJogo() {

    inversao = Boolean(Date.now() % 2);
    
    moduloLunar.posicao.x = inversao ? 700 : 100;
    moduloLunar.posicao.y = 100;
    moduloLunar.velocidade.x = inversao ? -3 : 3;
    moduloLunar.velocidade.y = 0;
    moduloLunar.combustivel = moduloLunar.combustivelInicial;
    moduloLunar.motorLigado = false;
    moduloLunar.angulo = Math.PI * (inversao ? .5 : -.5);
    moduloLunar.rotacaoNegativa = false;
    moduloLunar.rotacaoPositiva = false;
    
    colisao = false;
    jogoAtivo = true;
    estrelas = criarEstrelas();
    desenharTela();

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

function exibirIndicador(indicador, posicaoX, posicaoY, fontWeight='bold', fontSize='18px', fontFamily='Consolas', textAlign='left', textBaseline='middle', color='lightgray') {
    
    contexto.font = `${fontWeight} ${fontSize} ${fontFamily}`;
    contexto.textBaseline = textBaseline;
    contexto.textAlign = textAlign;
    contexto.fillStyle = color;
    contexto.fillText(indicador, posicaoX, posicaoY);

}

function exibirVelocidade() {
    
    const velocidade = `Velocidade: V: ${Math.abs(Math.round(10 * moduloLunar.velocidade.y))} m/s | H: ${Math.abs(Math.round(10 * moduloLunar.velocidade.x))} m/s`;

    exibirIndicador(velocidade, 40, 40);
}

function exibirCombustivel() {
    
    const combustivel = `Combustível: ${Math.round(moduloLunar.combustivel / moduloLunar.combustivelInicial * 100)} %`;

    exibirIndicador(combustivel, 40, 60);

}

function exibirAngulo() {
    
    let angulo = `Ângulo: ${Math.abs(Math.round(moduloLunar.angulo * 180 / Math.PI) % 360)} °`;

    exibirIndicador(angulo, 40, 80);
}

function exibirAltitude() {

    let angulo = `Altitude: ${Math.abs(Math.round(canvas.height - moduloLunar.posicao.y - (moduloLunar.altura * .5)))} m`;

    exibirIndicador(angulo, 40, 100);
}

function exibirPontuacao() {
    
    contexto.save();

    contexto.font = "bold 18px Consolas";
    contexto.textBaseline = "middle";
    contexto.fillStyle = "lightgray";
    contexto.textAlign = "right";
    
    let pontuacaoMaxima = `Maior pontuação: ${configuracao.pontuacaoMaxima}`;
    contexto.fillText(pontuacaoMaxima, 760, 40);

    contexto.restore();
}

function exibirMensagemVitoria(pontuacaoCalculada) {
    contexto.save();
    
    contexto.font = "bold 18px Consolas";
    contexto.textAlign = "center";
    contexto.textBaseline = "middle";
    contexto.fillStyle = "cyan";
    
    let mensagem = `VOCÊ ALUNISSOU COM SUCESSO!`;
    let pontuacao = `PONTUAÇÃO: ${pontuacaoCalculada.pontuacao}`;
    let avisoRecorde = '-- NOVO RECORDE --';
    
    contexto.fillText(mensagem, canvas.width / 2, canvas.height / 2);
    contexto.fillText(pontuacao, canvas.width / 2, (canvas.height / 2) + 20);
    
    if (pontuacaoCalculada.novoRecorde) {
        configuracao.pontuacaoMaxima = pontuacaoCalculada.pontuacao;
        contexto.fillText(avisoRecorde, canvas.width / 2, (canvas.height / 2) + 40);
    }

    contexto.restore();
}

function exibirMensagemFracasso(dadosAlunissagem) {
    
    contexto.save();
    contexto.font = "bold 18px Consolas";
    contexto.textAlign = "center";
    contexto.textBaseline = "middle";
    contexto.fillStyle = "crimson";
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

        desenharEstrelas(estrelas);
        detectarContato();
        atracaoGravitacional();
        desenharModuloLunar();
        exibirVelocidade();
        exibirCombustivel();
        exibirAngulo();
        exibirAltitude();
        exibirPontuacao();

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

    else if (evento.keyCode === 13) {
        iniciarJogo();
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
