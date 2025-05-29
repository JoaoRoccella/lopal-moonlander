/* 
    Moon Lander | Um jogo de alunissagem
    Autor: João Marcos Roccella Alves
    GitHub: https://github.com/joaoroccella
    Email: joao.a@docente.senai.br
    Versão: 0.1.0 
    Lander: https://www.flaticon.com/br/icones-gratis/lander
*/

/** @type {HTMLCanvasElement} */

// Canvas e contexto do cenário do jogo
const canvasCenario = document.querySelector('#cenario');
const contextoCenario = canvasCenario.getContext('2d');

// Canvas e contexto dos elementos do jogo
const canvasJogo = document.querySelector('#jogo');
const ctxJogo = canvasJogo.getContext('2d');

// Medidas-base para os cálculos de posição e tamanhos
const LARGURA = canvasCenario.width;
const ALTURA = canvasCenario.height;
const CENTRO_HORIZONTAL = LARGURA / 2;
const CENTRO_VERTICAL = ALTURA / 2;
const RAD2DEG = 180 / Math.PI;
const DEG2RAD = Math.PI / 180;

// Quantidade de estrelas baseada na densidade da tela
const DENSIDADE_ESTRELAS = 0.0005; // estrelas por pixel
const QUANTIDADE_ESTRELAS = Math.floor(LARGURA * ALTURA * DENSIDADE_ESTRELAS);

// Canvas offscreen para renderizar fundo
const offscreen = document.createElement('canvas');
offscreen.width = LARGURA;
offscreen.height = ALTURA;
const ctxOff = offscreen.getContext('2d');

// Framerate de redesenho do cenário
let frameAtual = 0;
const INTERVALO_REDESENHO_FUNDO = 3;

// Estrelas da rodada
let estrelas = criarEstrelas();

let inversao = Boolean(Date.now() % 2);
let colisao = false;
let jogoAtivo = false;

// Configuração dos controles e parâmetros
const configuracao = {
    aceleracaoGravidadeLunar: 0.016,
    teclaAceleracao: 'ArrowUp',
    teclaRotacaoNegativa: 'ArrowLeft',
    teclaRotacaoPositiva: 'ArrowRight',
    teclaStart: 'Enter',
    pontuacaoMaxima: 0,
}

// Imagem do lander
const imagemLander = new Image();
imagemLander.src = 'img/lander.png';

// Parâmetros do lander
let moduloLunar = {
    posicao: {
        x: inversao ? 700 : 100,
        y: 100,
    },
    angulo: Math.PI * (inversao ? 0.25 : -0.25),
    largura: 30,
    altura: 30,
    metadeLargura: 15,
    metadeAltura: 15,
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
    razaoRotacao: 2,
}


// Funções do cenário estelar

function criarEstrelas() {
    const estrelas = [];
    for (let i = 0; i < QUANTIDADE_ESTRELAS; i++) {
        estrelas.push({
            x: Math.random() * LARGURA,
            y: Math.random() * ALTURA,
            raio: Math.sqrt(Math.random() * 2),
            brilho: Math.random(),
            apagando: true,
            razaoDeCintilacao: Math.random() * 0.015
        });
    }
    return estrelas;
}

function atualizarCintilacao(estrelas) {
    estrelas.forEach(estrela => {
        estrela.brilho += estrela.apagando ? -estrela.razaoDeCintilacao : estrela.razaoDeCintilacao;
        if (estrela.brilho < 0.3 || estrela.brilho > 0.95) {
            estrela.apagando = !estrela.apagando;
        }
    });
}

function desenharFundoEstrelado(estrelas) {
    ctxOff.fillStyle = '#000';
    ctxOff.fillRect(0, 0, LARGURA, ALTURA);

    estrelas.forEach(estrela => {
        ctxOff.beginPath();
        ctxOff.arc(estrela.x, estrela.y, estrela.raio, 0, 2 * Math.PI);
        ctxOff.fillStyle = `rgba(0, 255, 255, ${estrela.brilho})`;
        ctxOff.fill();
    });
}


function desenharCenario() {
    if (frameAtual % INTERVALO_REDESENHO_FUNDO === 0) {
        atualizarCintilacao(estrelas);
        desenharFundoEstrelado(estrelas);
    }
    contextoCenario.drawImage(offscreen, 0, 0);
    frameAtual++;
    return;
}


// Funções de Física e Atualização do Módulo

function atualizarEstadoModulo() {

    detectarAcionamentoMotor();
    detectarRotacao();
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

function detectarAcionamentoMotor() {

    if (moduloLunar.motorLigado && moduloLunar.combustivel > 0) {

        moduloLunar.combustivel -= moduloLunar.razaoConsumoCombustivel;
        ligarSomMotor();

    } else {

        moduloLunar.motorLigado = false;
        desligarSomMotor();
    }

}

function detectarRotacao() {
    const passoRotacao = DEG2RAD / moduloLunar.razaoRotacao;

    if (moduloLunar.rotacaoNegativa) {
        moduloLunar.angulo -= passoRotacao;
    }
    else if (moduloLunar.rotacaoPositiva) {
        moduloLunar.angulo += passoRotacao;
    }

}

function detectarContato() {

    if (moduloLunar.posicao.y > (ALTURA - moduloLunar.altura * 0.5)) {

        let dadosAlunissagem;

        if (
            Math.abs(moduloLunar.velocidade.y) > 0.5 ||
            Math.abs(moduloLunar.velocidade.x) > 0.5 ||
            Math.abs(Math.round(moduloLunar.angulo * RAD2DEG) % 360) > 3) {

            tocarSomExplosao();
            colisao = true;
            dadosAlunissagem = obterDadosAlunissagem(moduloLunar);
            exibirMensagemFracasso(dadosAlunissagem);

        } else {

            const pontuacao = calcularPontuacao(moduloLunar);
            exibirMensagemVitoria(pontuacao);

        }

        exibirReiniciarJogo();

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
    desligarSomMotor();

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
    moduloLunar.angulo = Math.PI * (inversao ? 0.25 : -0.25);
    moduloLunar.rotacaoNegativa = false;
    moduloLunar.rotacaoPositiva = false;

    colisao = false;
    jogoAtivo = true;
    estrelas = criarEstrelas();

    requestAnimationFrame(loopPrincipal);

}

function loopPrincipal() {

    if (!jogoAtivo) return;

    ctxJogo.clearRect(0, 0, LARGURA, ALTURA);

    atualizarEstadoModulo();
    desenharCenario();
    detectarContato();
    atracaoGravitacional();
    desenharModuloLunar();
    exibirVelocidade();
    exibirCombustivel();
    exibirAngulo();
    exibirAltitude();
    exibirPontuacao();

    requestAnimationFrame(loopPrincipal);
}

function desenharModuloLunar() {

    ctxJogo.save();
    // ctxJogo.beginPath();
    ctxJogo.translate(moduloLunar.posicao.x, moduloLunar.posicao.y);
    ctxJogo.rotate(moduloLunar.angulo);

    if (moduloLunar.motorLigado && moduloLunar.combustivel > 0) {
        desenharChama();
    }

    ctxJogo.drawImage(imagemLander, -moduloLunar.metadeLargura, -moduloLunar.metadeAltura, moduloLunar.largura, moduloLunar.altura);
    // ctxJogo.closePath();
    ctxJogo.restore();

    // atualizarEstadoModulo();

}

function desenharChama() {

    ctxJogo.beginPath();
    ctxJogo.moveTo(-5, 10);
    ctxJogo.lineTo(5, 10);
    ctxJogo.lineTo(0, 15 + Math.random() * moduloLunar.tamanhoChama);
    ctxJogo.closePath();
    ctxJogo.fillStyle = 'orange';
    ctxJogo.fill();
}

function exibirIndicador(indicador, posicaoX, posicaoY, textAlign = 'left', color = 'lightgray', fontWeight = 'normal', fontSize = '16px', fontFamily = '"Ubuntu Mono", monospace', textBaseline = 'middle') {

    // contexto.save()
    ctxJogo.font = `${fontWeight} ${fontSize} ${fontFamily}`;
    ctxJogo.textBaseline = textBaseline;
    ctxJogo.textAlign = textAlign;
    ctxJogo.fillStyle = color;
    ctxJogo.fillText(indicador, posicaoX, posicaoY);
    // contexto.restore();

}

function exibirVelocidade() {

    const velocidade = `Velocidade: V: ${Math.abs(Math.round(10 * moduloLunar.velocidade.y))} m/s   H: ${Math.abs(Math.round(10 * moduloLunar.velocidade.x))} m/s`;

    exibirIndicador(velocidade, 40, 40);
}

function exibirCombustivel() {

    const combustivel = `Combustível: ${Math.round(moduloLunar.combustivel / moduloLunar.combustivelInicial * 100)}%`;

    exibirIndicador(combustivel, 40, 60);

}

function exibirAngulo() {

    let angulo = `Ângulo: ${Math.abs(Math.round(moduloLunar.angulo * RAD2DEG) % 360)}°`;

    exibirIndicador(angulo, 40, 80);
}

function exibirAltitude() {

    let angulo = `Altitude: ${Math.abs(Math.round(ALTURA - moduloLunar.posicao.y - (moduloLunar.altura * 0.5)))} m`;

    exibirIndicador(angulo, 40, 100);
}

function exibirPontuacao() {

    let pontuacaoMaxima = `RECORDE: ${configuracao.pontuacaoMaxima}`;
    exibirIndicador(pontuacaoMaxima, 760, 40, 'right', 'cyan');

}

function exibirMensagemVitoria(pontuacaoCalculada) {

    let mensagemVitoria = `VOCÊ ALUNISSOU COM SUCESSO!`;
    let pontuacao = `PONTUAÇÃO: ${pontuacaoCalculada.pontuacao}`;
    let avisoRecorde = '-- NOVO RECORDE --';

    exibirIndicador(mensagemVitoria, CENTRO_HORIZONTAL, CENTRO_VERTICAL, 'center', 'cyan');
    exibirIndicador(pontuacao, CENTRO_HORIZONTAL, CENTRO_VERTICAL + 20, 'center', 'cyan');

    if (pontuacaoCalculada.novoRecorde) {

        configuracao.pontuacaoMaxima = pontuacaoCalculada.pontuacao;
        exibirIndicador(avisoRecorde, CENTRO_HORIZONTAL, CENTRO_VERTICAL - 40, 'center', 'cyan', 'bold', '20px');
    }
}

function exibirMensagemFracasso(dadosAlunissagem) {

    const velocidadeFinalY = Math.abs(Number(10 * dadosAlunissagem.velocidadeFinal.y).toFixed(2));
    const velocidadeFinalX = Math.abs(Number(10 * dadosAlunissagem.velocidadeFinal.x).toFixed(2));
    const anguloFinal = Math.abs(Number(dadosAlunissagem.angulo * RAD2DEG).toFixed(1) % 360);

    const msgFracasso = `VOCÊ VIROU POEIRA ESPACIAL 😵`;
    const msgVelocidadeFinalY = `Velocidade vertical: ${velocidadeFinalY} m/s`;
    const msgVelocidadeFinalX = `Velocidade horizontal: ${velocidadeFinalX} m/s`;
    const msgAnguloFinal = `Angulo final: ${anguloFinal}°`;

    exibirIndicador(msgFracasso, CENTRO_HORIZONTAL, CENTRO_VERTICAL - 40, 'center', 'crimson', 'bold', '20px');

    exibirIndicador(msgVelocidadeFinalY, CENTRO_HORIZONTAL, CENTRO_VERTICAL, 'center', velocidadeFinalY > 5.0 ? 'crimson' : 'lightgray');

    exibirIndicador(msgVelocidadeFinalX, CENTRO_HORIZONTAL, CENTRO_VERTICAL + 20, 'center', velocidadeFinalX > 5.0 ? 'crimson' : 'lightgray');

    exibirIndicador(msgAnguloFinal, CENTRO_HORIZONTAL, CENTRO_VERTICAL + 40, 'center', anguloFinal > 3 ? 'crimson' : 'lightgray');
}

function exibirReiniciarJogo() {

    const msgReiniciar = 'Pressione ENTER para jogar novamente';
    exibirIndicador(msgReiniciar, CENTRO_HORIZONTAL, CENTRO_VERTICAL + 80, 'center');
}

function exibirIniciarJogo() {
    const msgIniciar = 'Pressione ENTER para jogar';
    exibirIndicador(msgIniciar, CENTRO_HORIZONTAL, CENTRO_VERTICAL + 20, 'center')
}

function exibirTelaInicial() {

    if (jogoAtivo) return;

    ctxJogo.clearRect(0, 0, LARGURA, ALTURA);
    desenharCenario();
    exibirVelocidade();
    exibirCombustivel();
    exibirAngulo();
    exibirAltitude();
    exibirPontuacao();
    exibirIniciarJogo();
}

exibirTelaInicial();


/*** Controles ****/

document.addEventListener('keydown', (e) => {
    switch (e.key) {
        case configuracao.teclaAceleracao:
            moduloLunar.motorLigado = true;
            break;
        case configuracao.teclaRotacaoNegativa:
            moduloLunar.rotacaoNegativa = true;
            break;
        case configuracao.teclaRotacaoPositiva:
            moduloLunar.rotacaoPositiva = true;
            break;
        case configuracao.teclaStart:
            if (!jogoAtivo) iniciarJogo();
            break;
    }
});

document.addEventListener('keyup', (e) => {
    switch (e.key) {
        case configuracao.teclaAceleracao:
            moduloLunar.motorLigado = false;
            break;
        case configuracao.teclaRotacaoNegativa:
            moduloLunar.rotacaoNegativa = false;
            break;
        case configuracao.teclaRotacaoPositiva:
            moduloLunar.rotacaoPositiva = false;
            break;
    }
});
