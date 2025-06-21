const { width, height } = { width: 800, height: 500 };
const GRAVITY = 0.4, GROUND_Y = height - 80, PLAYER_SPEED = 5, JUMP_STRENGTH = -12;
let score = 0, lives = 3, oasisTimer = 0, gameStarted = false, gameOver = false;
let miniBubbles = [], oasisList = [], particles = [], bossBullets = [];
let leftPressed = false, rightPressed = false, downPressed = false, batmanMode = false, atirando = false;
let currentPhase = 'fase_1';
let phaseAssets = {};

// Configuração das fases
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
        x: width - 200, y: height / 2, radius: 60, hp: 50, speed: 2
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
        batman: './assets/imgs/fase_2/miranha.png',
        platform: './assets/imgs/fase_2/Plataforma.png',
        moon: './assets/imgs/fase_2/lua.webp',
        boss: './assets/imgs/fase_2/boss.png',
        bossBullet: './assets/imgs/fase_2/bullet.png',
        explosion: './assets/imgs/fase_2/explosion.png',
        batBolhaAtirando: './assets/imgs/fase_2/BatBolhaAtirando.png',
        bomba: './assets/imgs/fase_2/Bomba.gif'
      },
      sounds: {
        explosion: './assets/audios/fase_2/Explosao.mp3',
        popBaiacu: './assets/audios/fase_2/popbaiacu.mp3',
        glock19: './assets/audios/fase_2/glock19.mp3',
        batmanSound: './assets/audios/fase_2/batman.mp3',
        success: './assets/audios/fase_2/success.mp3',
        hitpop: './assets/audios/fase_2/hitpop.mp3',
        fail: './assets/audios/fase_2/fail.mp3'
      },
      boss: {
        x: width - 150, y: height / 2, radius: 70, hp: 60, speed: 3
      }
    }
  }
};

const player = {
  x: 150, y: GROUND_Y - 25, radius: 25, dy: 0, dx: 0, onGround: true, invincible: false,
  update(platforms) {
    this.dx = leftPressed ? -PLAYER_SPEED : rightPressed ? PLAYER_SPEED : 0;
    this.x += this.dx;
    this.dy += GRAVITY;
    this.y += this.dy;
    let onAnyPlatform = false;
    for (let plat of platforms) {
      if (this.x + this.radius > plat.x && this.x - this.radius < plat.x + plat.w &&
          this.dy >= 0 && this.y + this.radius <= plat.y + 8 && this.y + this.radius + this.dy >= plat.y && !downPressed) {
        this.y = plat.y - this.radius;
        this.dy = 0;
        this.onGround = onAnyPlatform = true;
      }
    }
    if (this.y + this.radius > GROUND_Y) {
      this.y = GROUND_Y - this.radius;
      this.dy = 0;
      this.onGround = onAnyPlatform = true;
    }
    this.onGround = onAnyPlatform;
    this.x = constrain(this.x, this.radius, width - this.radius);
    this.y = constrain(this.y, this.radius, height - this.radius);
  },
  draw() {
    push();
    translate(this.x, this.y);
    rotate(sin(millis() / 300) / 10);
    scale(1 + sin(millis() / 500) * 0.03, 1 + cos(millis() / 500) * 0.03);
    const img = atirando ? phaseAssets.batBolhaAtirando : phaseAssets.batman;
    if (img instanceof p5.Image) {
      image(img, -this.radius * 1.3, -this.radius * 1.3, this.radius * 2.6, this.radius * 2.6);
    } else {
      console.warn("Imagem do jogador inválida, usando fallback");
      fill('red'); ellipse(0, 0, this.radius * 2); // Fallback visual
    }
    pop();
  },
  jump() { if (this.onGround) { this.dy = JUMP_STRENGTH; this.onGround = false; } }
};

let boss = null;
const bossConfig = {
  init(phase) {
    boss = { ...phases[phase].assets.boss, direction: 1, attackTimer: 0,
      attackMode: 'normal', burstCount: 0, burstShots: 0, specialMode: false, specialCharge: 0, specialActive: false, bomb: null, bombTarget: null };
  },
  update() {
    if (!boss) this.init(currentPhase);
    boss.y += boss.direction * boss.speed;
    if (boss.y < boss.radius || boss.y > height - boss.radius) boss.direction *= -1;
    boss.attackTimer++;
    if (!boss.specialMode && !boss.specialActive && boss.attackTimer % 60 === 0 && random() < 0.5) {
      boss.specialMode = true;
      boss.attackMode = 'special';
      boss.bombTarget = { x: player.x, y: player.y };
    }
    if (boss.attackMode === 'special') {
      boss.specialCharge++;
      if (boss.specialCharge >= 300 && !boss.specialActive) {
        let dist = Math.hypot(boss.bombTarget.x - boss.x, boss.bombTarget.y - boss.y);
        let steps = Math.max(40, Math.min(80, Math.floor(dist / 8)));
        boss.bomb = { x: boss.x - boss.radius, y: boss.y, radius: 32, dx: (boss.bombTarget.x - boss.x) / steps, dy: (boss.bombTarget.y - boss.y) / steps, active: true };
        boss.specialActive = true;
      }
      if (boss.bomb?.active) {
        boss.bomb.x += boss.bomb.dx;
        boss.bomb.y += boss.bomb.dy;
        if (Math.hypot(player.x - boss.bomb.x, player.y - boss.bomb.y) < player.radius + boss.bomb.radius) {
          lives = 0;
          triggerExplosion(player.x, player.y);
          boss.bomb.active = false;
          this.resetAttack();
        }
        if (boss.bomb.x < -boss.bomb.radius || boss.bomb.x > width + boss.bomb.radius || boss.bomb.y < -boss.bomb.radius || boss.bomb.y > height + boss.bomb.radius) {
          boss.bomb.active = false;
          this.resetAttack();
        }
      }
      if (boss.bomb && !boss.bomb.active && boss.specialActive) this.resetAttack();
    } else if (boss.attackMode === 'normal') {
      if (boss.attackTimer > 60) {
        bossBullets.push({ x: boss.x - boss.radius, y: boss.y, radius: 24, speed: 7, dx: -7, dy: 0, type: 'normal' });
        try { phaseAssets.glock19.play(); } catch (e) { console.warn("Erro ao reproduzir glock19 sound:", e); }
        boss.attackTimer = 0;
        if (random() < 0.33) {
          boss.attackMode = 'burst';
          boss.burstCount = 0;
          boss.burstShots = floor(random(5, 8));
        }
      }
    } else if (boss.attackMode === 'burst') {
      boss.speed = 5;
      if (boss.attackTimer > 10 && boss.burstCount < boss.burstShots) {
        bossBullets.push({ x: boss.x - boss.radius, y: boss.y, radius: 18, speed: 11, dx: -11, dy: 0, type: 'burst' });
        try { phaseAssets.glock19.play(); } catch (e) { console.warn("Erro ao reproduzir glock19 sound:", e); }
        boss.attackTimer = 0;
        boss.burstCount++;
      } else if (boss.burstCount >= boss.burstShots) {
        boss.attackMode = 'normal';
        boss.attackTimer = 0;
        boss.speed = phases[currentPhase].assets.boss.speed;
      }
    }
  },
  draw() {
    if (!boss) return;
    if (phaseAssets.boss instanceof p5.Image) {
      image(phaseAssets.boss, boss.x - boss.radius, boss.y - boss.radius, boss.radius * 2, boss.radius * 2);
    } else {
      console.warn("Imagem do boss inválida, usando fallback");
      fill('purple'); ellipse(boss.x, boss.y, boss.radius * 2);
    }
    fill('red'); rect(boss.x - 50, boss.y - boss.radius - 20, 100, 10);
    fill('lime'); rect(boss.x - 50, boss.y - boss.radius - 20, 100 * (boss.hp / phases[currentPhase].assets.boss.hp), 10);
    if (boss.attackMode === 'special') {
      push(); noFill(); stroke(255, 0, 0); strokeWeight(4);
      ellipse(boss.x, boss.y, boss.radius * 2 + 20 + sin(frameCount * 0.2) * 10);
      pop();
    }
    if (boss.bomb?.active) {
      if (phaseAssets.bomba instanceof p5.Image) {
        image(phaseAssets.bomba, boss.bomb.x - boss.bomb.radius, boss.bomb.y - boss.bomb.radius, boss.bomb.radius * 2, boss.bomb.radius * 2);
      } else {
        console.warn("Imagem da bomba inválida, usando fallback");
        fill('black'); ellipse(boss.bomb.x, boss.bomb.y, boss.bomb.radius * 2);
      }
    }
  },
  resetAttack() {
    boss.specialMode = boss.specialActive = false;
    boss.attackMode = 'normal';
    boss.attackTimer = 0;
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

function setup() {
  createCanvas(width, height);
  try {
    startLore();
  } catch (e) {
    console.warn("Erro ao chamar startLore, iniciando tela inicial diretamente:", e);
    showStartScreen();
  }
}

function drawBackground() {
  background('#012030');
  if (phaseAssets.moon instanceof p5.Image) {
    image(phaseAssets.moon, width - 130, 30, 100, 100);
  } else {
    console.warn("Imagem da lua inválida, usando fallback");
    fill('gray'); ellipse(width - 80, 80, 100);
  }
  fill('#e2b96f'); rect(0, height - 80, width, 80);
  fill('#f5d18c'); beginShape();
  vertex(0, height - 80); bezierVertex(width * 0.3, height - 120, width * 0.7, height - 40, width, height - 80);
  vertex(width, height); vertex(0, height); endShape(CLOSE);
  phases[currentPhase].platforms.forEach(plat => {
    if (phaseAssets.platform instanceof p5.Image) {
      image(phaseAssets.platform, plat.x, plat.y, plat.w, plat.h);
    } else {
      console.warn("Imagem da plataforma inválida, usando fallback");
      fill('brown'); rect(plat.x, plat.y, plat.w, plat.h);
    }
  });
}

function drawOasis({ x, y }) {
  push(); translate(x, y);
  if (phaseAssets.oasis instanceof p5.Image) {
    image(phaseAssets.oasis, -16, -16, 32, 32);
  } else {
    console.warn("Imagem do oasis inválida, usando fallback");
    fill('green'); ellipse(0, 0, 32);
  }
  pop();
}

let explosionActive = false, explosionFrame = 0, explosionX, explosionY;
function triggerExplosion(x, y) {
  explosionActive = true; explosionX = x; explosionY = y; explosionFrame = 0;
  try { phaseAssets.explosionSound.play(); } catch (e) { console.warn("Erro ao reproduzir explosionSound:", e); }
  for (let i = 0; i < 20; i++) particles.push({ x, y, dx: random(-5, 5), dy: random(-5, 5), radius: random(2, 5), alpha: 255 });
}

function drawExplosion() {
  if (!explosionActive) return;
  if (phaseAssets.explosion instanceof p5.Image) {
    let frameWidth = phaseAssets.explosion.width / 10, frameHeight = phaseAssets.explosion.height;
    image(phaseAssets.explosion, explosionX - (frameWidth * 3) / 2, explosionY - (frameHeight * 3) / 2, frameWidth * 3, frameHeight * 3,
          (explosionFrame = floor(frameCount / 5) % 10) * frameWidth, 0, frameWidth, frameHeight);
  } else {
    console.warn("Imagem da explosão inválida, usando fallback");
    fill('orange'); ellipse(explosionX, explosionY, 50);
  }
  particles = particles.filter(p => {
    p.x += p.dx; p.y += p.dy; p.alpha -= 10;
    fill(255, 100, 0, p.alpha); noStroke(); ellipse(p.x, p.y, p.radius * 2);
    return p.alpha > 0;
  });
  if (explosionFrame >= 9 && particles.length === 0) { explosionActive = false; showGameOverScreen(); }
}

function showGameOverScreen() {
  gameOver = true;
  if (phaseAssets.batmanSound?.isPlaying()) phaseAssets.batmanSound.stop();
  try { phaseAssets.fail.play(); } catch (e) { console.warn("Erro ao reproduzir fail sound:", e); }
  fill('rgba(0, 0, 0, 0.6)'); rect(0, 0, width, height);
  fill('#fff'); textSize(40); textAlign(CENTER);
  text("Game Over", width / 2, height / 2 - 40);
  textSize(20); text(`Pontuação final: ${score}`, width / 2, height / 2);
  text("Vidas restantes: 0", width / 2, height / 2 + 30);
  window.restartBtn?.position((windowWidth - 200) / 2, windowHeight / 2 + 60).show();
  noLoop();
}

function spawnOasis() {
  if (!gameOver) oasisList.push({ x: width + 80, y: random(60, height - 120), radius: 32 + random(12) });
}

function createButtonStyled(text, x, y, w, h, onClick) {
  const btn = createButton(text).size(w, h).position(x, y)
    .style('font-size', `${h / 2.3}px`)
    .style('background', 'linear-gradient(90deg, #00c3ff 0%,#b71cff 100%)')
    .style('color', '#fff').style('border', 'none').style('border-radius', `${h / 2}px`)
    .style('box-shadow', '0 4px 16px rgba(0,0,0,0.2)').style('font-weight', 'bold').style('cursor', 'pointer');
  btn.mousePressed(onClick);
  return btn;
}

function showStartScreen() {
  window.startBtn = createButtonStyled('Iniciar Jogo', (windowWidth - 200) / 2, (windowHeight - 60) / 2 + 60, 200, 60, () => {
    gameStarted = true;
    window.startBtn.hide();
    try { phaseAssets.batmanSound.play(); } catch (e) { console.warn("Erro ao reproduzir batmanSound:", e); }
    loop();
  });
  window.restartBtn = createButtonStyled('Reiniciar', (windowWidth - 200) / 2, (windowHeight + 40) / 2, 200, 60, () => {
    resetGame();
    window.restartBtn.hide();
    window.startBtn?.hide();
    loop();
  }).hide();
  redraw();
  noLoop();
}

function showEndGameScreen() {
  gameOver = true;
  if (phaseAssets.batmanSound?.isPlaying()) phaseAssets.batmanSound.stop();
  try { phaseAssets.success.play(); } catch (e) { console.warn("Erro ao reproduzir success sound:", e); }
  fill('rgba(0, 0, 0, 0.6)'); rect(0, 0, width, height);
  fill('#fff'); textSize(40); textAlign(CENTER);
  text("Parabéns! Você venceu o jogo!", width / 2, height / 2 - 40);
  textSize(20); text(`Pontuação final: ${score}`, width / 2, height / 2);
  text(`Vidas restantes: ${lives}`, width / 2, height / 2 + 30);
  window.restartBtn?.position((windowWidth - 200) / 2, windowHeight / 2 + 60).show();
  noLoop();
}

function resetGame() {
  score = 0; lives = 3; oasisTimer = 0; gameOver = false;
  miniBubbles = []; oasisList = []; particles = []; bossBullets = []; boss = null;
  player.x = 150; player.y = GROUND_Y - 25; player.dy = 0; player.invincible = false;
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

function draw() {
  if (!gameStarted) {
    background('#012030'); fill('white'); textAlign(CENTER);
    textSize(36); text('Bem-vindo ao BatBolha!', width / 2, height / 2 - 60);
    textSize(20); text('Clique em Iniciar Jogo para começar', width / 2, height / 2 - 20);
    noLoop(); return;
  }
  drawBackground(); drawExplosion();
  if (explosionActive) return;
  fill('white'); textSize(22); textAlign(LEFT);
  text(score < 10 ? `Elimine os Baiacus: ${score}/10` : 'Derrote o Camarão Pistola', 20, 30);
  for (let i = 0; i < 3; i++) {
    let x = 30 + i * 35, y = 60;
    if (phaseAssets.heart instanceof p5.Image) {
      i < lives ? image(phaseAssets.heart, x - 16, y - 16, 32, 32) :
        (tint(50, 50, 50, 180), image(phaseAssets.heart, x - 16, y - 16, 32, 32), noTint());
    } else {
      console.warn("Imagem do coração inválida, usando fallback");
      fill(i < lives ? 'red' : 'gray'); ellipse(x, y, 32);
    }
  }
  if (!gameOver) {
    player.update(phases[currentPhase].platforms); player.draw(); bossConfig.update(); bossConfig.draw();
    bossBullets = bossBullets.filter(b => {
      b.x += b.dx; b.y += b.dy;
      if (phaseAssets.bossBullet instanceof p5.Image) {
        image(phaseAssets.bossBullet, b.x - b.radius, b.y - b.radius, b.radius * 2, b.radius * 2);
      } else {
        console.warn("Imagem do bossBullet inválida, usando fallback");
        fill('yellow'); ellipse(b.x, b.y, b.radius * 2);
      }
      if (!player.invincible && Math.hypot(player.x - b.x, player.y - b.y) < player.radius + b.radius) {
        lives--; try { phaseAssets.hitpop.play(); } catch (e) { console.warn("Erro ao reproduzir hitpop sound:", e); }
        player.invincible = true;
        setTimeout(() => player.invincible = false, 800);
        if (lives <= 0) triggerExplosion(player.x, player.y);
        return false;
      }
      return b.x + b.radius > 0;
    });
    miniBubbles = miniBubbles.filter(mb => {
      mb.x += mb.speed;
      if (phaseAssets.miniBubble instanceof p5.Image) {
        image(phaseAssets.miniBubble, mb.x - mb.radius, mb.y - mb.radius, mb.radius * 2, mb.radius * 2);
      } else {
        console.warn("Imagem da miniBubble inválida, usando fallback");
        fill('blue'); ellipse(mb.x, mb.y, mb.radius * 2);
      }
      if (boss && Math.hypot(mb.x - boss.x, mb.y - boss.y) < boss.radius) { boss.hp--; return false; }
      return mb.x - mb.radius <= width;
    });
    if (++oasisTimer > 400) { spawnOasis(); oasisTimer = 0; }
    oasisList = oasisList.filter(o => {
      o.x -= 3; drawOasis(o);
      if (Math.hypot(player.x - o.x, player.y - o.y) < player.radius + o.radius * 0.7) {
        if (lives < 3) lives++; return false;
      }
      return o.x + o.radius > 0;
    });
    if (boss?.hp <= 0) {
      if (phaseAssets.batmanSound?.isPlaying()) phaseAssets.batmanSound.stop();
      if (currentPhase === 'fase_2') {
        showEndGameScreen();
      } else {
        try { phaseAssets.success.play(); } catch (e) { console.warn("Erro ao reproduzir success sound:", e); }
        fill('rgba(0, 0, 0, 0.6)'); rect(0, 0, width, height); fill('#fff'); textAlign(CENTER);
        textSize(40); text(`Você venceu a ${currentPhase}!`, width / 2, height / 2 - 40);
        textSize(20); text(`Pontuação final: ${score}`, width / 2, height / 2);
        text(`Vidas restantes: ${lives}`, width / 2, height / 2 + 30);
        if (!window.nextPhaseBtn) {
          window.nextPhaseBtn = createButtonStyled('Ir para Próxima Fase', (windowWidth - 200) / 2, windowHeight / 2 + 80, 200, 60, () => {
            if (currentPhase === 'fase_1') {
              trocarFase('fase_2');
            }
          });
        } else window.nextPhaseBtn.position((windowWidth - 200) / 2, windowHeight / 2 + 80).show();
        window.restartBtn?.hide(); noLoop();
      }
    }
  } else showGameOverScreen();
}

function keyPressed() {
  if (key.toLowerCase() === 'a') leftPressed = true;
  if (key.toLowerCase() === 'd') rightPressed = true;
  if ((key.toLowerCase() === 'w' || keyCode === 32) && !gameOver) player.jump();
  if (key.toLowerCase() === 's') downPressed = true;
  if (key.toLowerCase() === 'b') batmanMode = !batmanMode;
}

function keyReleased() {
  if (key.toLowerCase() === 'a') leftPressed = false;
  if (key.toLowerCase() === 'd') rightPressed = false;
  if (key.toLowerCase() === 's') downPressed = false;
}

let atirandoTimeout;
function mousePressed() {
  if (gameStarted && !gameOver && mouseButton === LEFT) {
    miniBubbles.push({ x: player.x + player.radius, y: player.y, radius: 10, speed: 10 });
    atirando = true; clearTimeout(atirandoTimeout); atirandoTimeout = setTimeout(() => atirando = false, 120);
  }
}