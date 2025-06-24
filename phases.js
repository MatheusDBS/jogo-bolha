const phases = {
  fase_1: {
    platforms: [
      { x: 100, y: 340, w: 160, h: 24 }, { x: 320, y: 340, w: 160, h: 24 }, { x: 540, y: 340, w: 160, h: 24 },
      { x: 210, y: 220, w: 160, h: 24 }, { x: 430, y: 220, w: 160, h: 24 },
      { x: 100, y: 100, w: 160, h: 24 }, { x: 320, y: 100, w: 160, h: 24 }, { x: 540, y: 100, w: 160, h: 24 }
    ],
    assets: {
      images: {
        bubble: './assets/imgs/fase_1/Bolha.png',
        miniBubble: './assets/imgs/fase_1/Bolha.png',
        baiacu: './assets/imgs/fase_1/baiacu.webp',
        oasis: './assets/imgs/fase_1/heart.png',
        heart: './assets/imgs/fase_1/heart.png',
        batman: './assets/imgs/fase_1/Batman.png',
        platform: './assets/imgs/fase_1/Plataforma.png',
        moon: './assets/imgs/fase_1/lua.webp',
        boss: './assets/imgs/fase_1/camarao.png',
        bossBullet: './assets/imgs/fase_1/9mm.png',
        explosion: './assets/imgs/fase_1/explosion.png',
        batBolhaAtirando: './assets/imgs/fase_1/BatBolhaAtirando.png',
        bomba: './assets/imgs/fase_1/Bomba.gif'
      },
      sounds: {
        explosion: './assets/audios/fase_1/Explosao.mp3',
        popBaiacu: './assets/audios/fase_1/popbaiacu.mp3',
        glock19: './assets/audios/fase_1/glock19.mp3',
        batmanSound: './assets/audios/fase_1/batman.mp3',
        success: './assets/audios/fase_1/success.mp3',
        hitpop: './assets/audios/fase_1/hitpop.mp3',
        fail: './assets/audios/fase_1/fail.mp3'
      },
      boss: {
        x: width - 200, y: height / 2, radius: 60, hp: 25, speed: 2 // Fácil
      }
    }
  },
  fase_2: {
    platforms: [
      { x: 150, y: 300, w: 200, h: 24 },
      { x: 400, y: 200, w: 150, h: 24 },
      { x: 600, y: 250, w: 180, h: 24 }
    ],
    assets: {
      images: {
        bubble: './assets/imgs/fase_2/Bolha.png',
        miniBubble: './assets/imgs/fase_2/Bolha.png',
        baiacu: './assets/imgs/fase_2/baiacu.webp',
        oasis: './assets/imgs/fase_2/heart.png',
        heart: './assets/imgs/fase_2/heart.png',
        batman: './assets/imgs/fase_2/Batman.png',
        platform: './assets/imgs/fase_2/Plataforma.png',
        moon: './assets/imgs/fase_2/lua.png',
        boss: './assets/imgs/fase_2/camarao.png', // Corrigido para imagem existente
        bossBullet: './assets/imgs/fase_2/9mm.png', // Corrigido para imagem existente
        explosion: './assets/imgs/fase_2/explosion.png',
        batBolhaAtirando: './assets/imgs/fase_2/BatBolhaAtirando.png',
        bomba: './assets/imgs/fase_2/Bomba.gif'
      },
      sounds: {
        explosion: './assets/audios/fase_1/Explosao.mp3',
        popBaiacu: './assets/audios/fase_1/popbaiacu.mp3',
        glock19: './assets/audios/fase_1/glock19.mp3',
        batmanSound: './assets/audios/fase_1/batman.mp3',
        success: './assets/audios/fase_1/success.mp3',
        hitpop: './assets/audios/fase_1/hitpop.mp3',
        fail: './assets/audios/fase_1/fail.mp3'
      },
      boss: {
        x: width - 150, y: height / 2, radius: 70, hp: 70, speed: 3 // Médio
      }
    }
  },
  fase_3: {
    platforms: [
      { x: 180, y: 320, w: 180, h: 24 },
      { x: 420, y: 180, w: 180, h: 24 },
      { x: 650, y: 260, w: 160, h: 24 }
    ],
    assets: {
      images: {
        bubble: './assets/imgs/fase_3/Bolha.png', // Use assets da fase 2 ou crie pasta fase_3
        miniBubble: './assets/imgs/fase_3/Bolha.png',
        baiacu: './assets/imgs/fase_3/baiacu.webp',
        oasis: './assets/imgs/fase_3/heart.png',
        heart: './assets/imgs/fase_3/heart.png',
        batman: './assets/imgs/fase_3/Batman.png',
        platform: './assets/imgs/fase_3/Plataforma.png',
        moon: './assets/imgs/fase_3/lua.png',
        boss: './assets/imgs/fase_3/camarao.png',
        bossBullet: './assets/imgs/fase_3/9mm.png',
        explosion: './assets/imgs/fase_3/explosion.png',
        batBolhaAtirando: './assets/imgs/fase_3/BatBolhaAtirando.png',
        bomba: './assets/imgs/fase_3/Bomba.gif'
      },
      sounds: {
        explosion: './assets/audios/fase_1/Explosao.mp3',
        popBaiacu: './assets/audios/fase_1/popbaiacu.mp3',
        glock19: './assets/audios/fase_1/glock19.mp3',
        batmanSound: './assets/audios/fase_1/batman.mp3',
        success: './assets/audios/fase_1/success.mp3',
        hitpop: './assets/audios/fase_1/hitpop.mp3',
        fail: './assets/audios/fase_1/fail.mp3'
      },
      boss: {
        x: width - 120, y: height / 2, radius: 80, hp: 120, speed: 4 // Difícil
      }
    }
  }
};

function preload() {
  loadPhase(currentPhase);
}

function loadPhase(phase) {
  if (!phases[phase]) {
    console.error(`Fase ${phase} não encontrada! Carregando fase_1 como fallback.`);
    phase = 'fase_1';
  }
  try {
    phaseAssets = {
      bubble: loadImage(phases[phase].assets.images.bubble, () => {}, (err) => console.error(`Erro ao carregar bubble: ${err}`)),
      miniBubble: loadImage(phases[phase].assets.images.miniBubble, () => {}, (err) => console.error(`Erro ao carregar miniBubble: ${err}`)),
      baiacu: loadImage(phases[phase].assets.images.baiacu, () => {}, (err) => console.error(`Erro ao carregar baiacu: ${err}`)),
      oasis: loadImage(phases[phase].assets.images.oasis, () => {}, (err) => console.error(`Erro ao carregar oasis: ${err}`)),
      heart: loadImage(phases[phase].assets.images.heart, () => {}, (err) => console.error(`Erro ao carregar heart: ${err}`)),
      batman: loadImage(phases[phase].assets.images.batman, () => {}, (err) => console.error(`Erro ao carregar batman: ${err}`)),
      platform: loadImage(phases[phase].assets.images.platform, () => {}, (err) => console.error(`Erro ao carregar platform: ${err}`)),
      moon: loadImage(phases[phase].assets.images.moon, () => {}, (err) => console.error(`Erro ao carregar moon: ${err}`)),
      boss: loadImage(phases[phase].assets.images.boss, () => {}, (err) => console.error(`Erro ao carregar boss: ${err}`)),
      bossBullet: loadImage(phases[phase].assets.images.bossBullet, () => {}, (err) => console.error(`Erro ao carregar bossBullet: ${err}`)),
      explosion: loadImage(phases[phase].assets.images.explosion, () => {}, (err) => console.error(`Erro ao carregar explosion: ${err}`)),
      batBolhaAtirando: loadImage(phases[phase].assets.images.batBolhaAtirando, () => {}, (err) => console.error(`Erro ao carregar batBolhaAtirando: ${err}`)),
      bomba: loadImage(phases[phase].assets.images.bomba, () => {}, (err) => console.error(`Erro ao carregar bomba: ${err}`)),
      explosionSound: loadSound(phases[phase].assets.sounds.explosion, () => {}, (err) => console.error(`Erro ao carregar explosionSound: ${err}`)),
      popBaiacu: loadSound(phases[phase].assets.sounds.popBaiacu, () => {}, (err) => console.error(`Erro ao carregar popBaiacu: ${err}`)),
      glock19: loadSound(phases[phase].assets.sounds.glock19, () => {}, (err) => console.error(`Erro ao carregar glock19: ${err}`)),
      batmanSound: loadSound(phases[phase].assets.sounds.batmanSound, () => {}, (err) => console.error(`Erro ao carregar batmanSound: ${err}`)),
      success: loadSound(phases[phase].assets.sounds.success, () => {}, (err) => console.error(`Erro ao carregar success: ${err}`)),
      hitpop: loadSound(phases[phase].assets.sounds.hitpop, () => {}, (err) => console.error(`Erro ao carregar hitpop: ${err}`)),
      fail: loadSound(phases[phase].assets.sounds.fail, () => {}, (err) => console.error(`Erro ao carregar fail: ${err}`))
    };
  } catch (e) {
    console.error(`Erro ao carregar assets da fase ${phase}:`, e);
  }
}

function trocarFase(phase) {
  if (phases[phase]) {
    currentPhase = phase;
    resetGame();
    loadPhase(phase);
    gameStarted = true;
    window.nextPhaseBtn?.hide();
    window.restartBtn?.hide();
    loop();
  } else {
    console.error(`Fase ${phase} não encontrada! Carregando fase_1 como fallback.`);
    trocarFase('fase_1');
  }
}