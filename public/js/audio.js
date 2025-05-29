const audioContext = new (window.AudioContext || window.webkitAudioContext)();

let noiseSource = null;
let gainNode = null;

function ligarSomMotor() {
    if (noiseSource) return; // Já está rodando

    // Criar um buffer com ruído branco
    const bufferSize = 2 * audioContext.sampleRate;
    const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
    }

    noiseSource = audioContext.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    // Filtro para deixar o som mais de motor (grave e abafado)
    const filter = audioContext.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(600, audioContext.currentTime); // Grave
    filter.Q.setValueAtTime(1, audioContext.currentTime);

    // Controle de volume
    gainNode = audioContext.createGain();
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime); // Volume ajustável

    // Conectar tudo: noise -> filter -> gain -> output
    noiseSource.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioContext.destination);

    noiseSource.start();
}

function desligarSomMotor() {
    if (noiseSource) {
        noiseSource.stop();
        noiseSource.disconnect();
        gainNode.disconnect();
        noiseSource = null;
        gainNode = null;
    }
}

function tocarSomExplosao() {
    const ctx = audioContext;

    // Ruído branco (estilhaços e ar)
    const bufferSize = ctx.sampleRate * 1;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1);
    }

    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = false;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.setValueAtTime(5000, ctx.currentTime);
    noiseFilter.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 2);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(2, ctx.currentTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 2);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    noise.start(ctx.currentTime);
    noise.stop(ctx.currentTime + 2);

    // Boom grave (onda de choque)
    const boom = ctx.createOscillator();
    boom.type = 'sine';
    boom.frequency.setValueAtTime(100, ctx.currentTime);
    boom.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 1.5);

    const boomGain = ctx.createGain();
    boomGain.gain.setValueAtTime(2, ctx.currentTime);
    boomGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.5);

    boom.connect(boomGain);
    boomGain.connect(ctx.destination);

    boom.start(ctx.currentTime);
    boom.stop(ctx.currentTime + 1.5);

    // Sub-rumble (tremor profundo da explosão)
    const rumble = ctx.createOscillator();
    rumble.type = 'triangle';
    rumble.frequency.setValueAtTime(40, ctx.currentTime);
    rumble.frequency.exponentialRampToValueAtTime(10, ctx.currentTime + 2);

    const rumbleGain = ctx.createGain();
    rumbleGain.gain.setValueAtTime(1.5, ctx.currentTime);
    rumbleGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 2);

    rumble.connect(rumbleGain);
    rumbleGain.connect(ctx.destination);

    rumble.start(ctx.currentTime);
    rumble.stop(ctx.currentTime + 2);
}
