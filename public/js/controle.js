let gamepadConectado = false;

window.addEventListener("gamepadconnected", (e) => {
    gamepadConectado = true;
    console.log("Gamepad conectado:", e.gamepad);
    loopGamepad();
});

window.addEventListener("gamepaddisconnected", (e) => {
    gamepadConectado = false;
    console.log("Gamepad desconectado:", e.gamepad);
});

function loopGamepad() {
    
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];

    if (gamepads[0]) {
        const gp = gamepads[0];

        // Leitura dos eixos
        gp.axes.forEach((valor, indice) => {
            const deadZone = 0.2;
            if (Math.abs(valor) > deadZone) {
                const direcao = valor > 0 ? 'positivo' : 'negativo';
                console.log(`Eixo ${indice} movido para ${direcao}: valor ${valor.toFixed(2)}`);
            }
        });

        // Leitura dos botões
        gp.buttons.forEach((btn, index) => {
            if (btn.pressed) {
                console.log(`Botão ${index} pressionado`);
            }
        });

        // Mapeamento dos botões (ajuste conforme seu controle)
        const botaoAceleracao = 0; // X
        const botaoRotacaoNegativa = 4; // L - Esquerda
        const botaoRotacaoPositiva = 5; // R - Direita
        const botaoStart = 9; // Start

        // Lógica para comandos contínuos
        moduloLunar.motorLigado = gp.buttons[botaoAceleracao].pressed;
        moduloLunar.rotacaoNegativa = gp.buttons[botaoRotacaoNegativa].pressed;
        moduloLunar.rotacaoPositiva = gp.buttons[botaoRotacaoPositiva].pressed;

        // Lógica para Start (acionamento único)
        if (gp.buttons[botaoStart].pressed && !jogoAtivo) {
            iniciarJogo();
        }
    }

    requestAnimationFrame(loopGamepad);
}
