// Imagens e sons principais
let bubbleImg, miniBubbleImg, baiacuImg, oasisImg, explosionSound, heartImg, batmanImg;
// Variáveis de estado do jogo
let score = 0, lives = 3, spawnTimer = 0, oasisTimer = 0, nextPhase = false, finishLineX;
const GRAVITY = 0.4;
const { width, height } = { width: 800, height: 500 };
let miniBubbles = [], obstacles = [], oasisList = [];
let particles = [];
let boss = null;
let gameOver = false;
let bossBullets = [];
let explosionImg;
let explosionFrames = 10;
let explosionScale = 3;
let explosionSpeed = 5;
let explosionActive = false;
let explosionFrame = 0;
let explosionX, explosionY;
// Objeto do jogador
const player = {
  x: 150, y: 200, radius: 25, dy: 0, flapStrength: -6, invincible: false,
  update() {
    if (upPressed) {
      this.y = Math.max(this.radius, this.y - 5);
      this.dy = 0;
    } else if (downPressed) {
      this.y = Math.min(height - this.radius, this.y + 5);
      this.dy = 0;
    } else {
      this.y = Math.max(this.radius, Math.min(height - this.radius, this.y + this.dy));
      this.dy += GRAVITY;
    }
  },
  draw() {
    push();
    translate(this.x, this.y);
    rotate(sin(millis() / 300) / 10);
    scale(1 + sin(millis() / 500) * 0.03, 1 + cos(millis() / 500) * 0.03);
    if (batmanMode) {
      image(batmanImg, -this.radius * 1.3, -this.radius * 1.3, this.radius * 2.6, this.radius * 2.6);
    } else {
      image(bubbleImg, -this.radius, -this.radius, this.radius * 2, this.radius * 2);
    }
    pop();
  },
  flap: () => (player.dy = player.flapStrength)
};
let upPressed = false, downPressed = false;
let batmanMode = false;

// Pré-carrega imagens e sons
function preload() {
  bubbleImg = loadImage('./assets/imgs/Bolha.png');
  miniBubbleImg = loadImage('./assets/imgs/Bolha.png');
  baiacuImg = loadImage('./assets/imgs/puffer-fish.gif');
  oasisImg = loadImage('./assets/imgs/heart.png');
  explosionSound = loadSound('./assets/audios/Explosao.mp3');
  heartImg = loadImage('./assets/imgs/heart.png');
  explosionImg = loadImage('./assets/imgs/explosion.png');
  moonImg = loadImage('./assets/imgs/lua.webp');
  bossImg = loadImage('./assets/imgs/camarao.png');
  popBaiacuSound = loadSound('./assets/audios/popbaiacu.mp3');
  bossBulletImg = loadImage('./assets/imgs/9mm.png');
  glock19Sound = loadSound('./assets/audios/glock19.mp3');
  batmanSound = loadSound('./assets/audios/batman.mp3');
  successSound = loadSound('./assets/audios/success.mp3');
  hitpopSound = loadSound('./assets/audios/hitpop.mp3');
  failSound = loadSound('./assets/audios/fail.mp3');
  batmanImg = loadImage('./assets/imgs/Batman.png');
}

// Controle de início do jogo e vídeo de lore
let gameStarted = false;
let loreVideoPlayed = false;
let loreVideo;
function setup() {
  createCanvas(width, height);
  if (!loreVideoPlayed) {
    loreVideo = createVideo('./assets/videos/lorebolha.mp4', () => {
      // Configura vídeo e botão de pular
      loreVideo.size(640, 360);
      loreVideo.position((windowWidth - 640) / 2, (windowHeight - 360) / 2);
      loreVideo.show();
      loreVideo.volume(1);
      loreVideo.play();
      loreVideo.elt.setAttribute('playsinline', '');
      loreVideo.elt.setAttribute('webkit-playsinline', '');
      loreVideo.elt.setAttribute('controls', '');
      const skipBtn = createButton('Pular Introdução');
      skipBtn.size(180, 48);
      skipBtn.style('font-size', '18px');
      skipBtn.style('background', 'linear-gradient(90deg, #b71cff 0%, #00c3ff 100%)');
      skipBtn.style('color', '#fff');
      skipBtn.style('border', 'none');
      skipBtn.style('border-radius', '24px');
      skipBtn.style('box-shadow', '0 4px 16px rgba(0,0,0,0.2)');
      skipBtn.style('font-weight', 'bold');
      skipBtn.style('cursor', 'pointer');
      skipBtn.position((windowWidth - 180) / 2, (windowHeight + 360) / 2 + 16);
      skipBtn.show();
      function skipIntro() {
        loreVideo.hide();
        loreVideo.remove();
        skipBtn.hide();
        skipBtn.remove();
        loreVideoPlayed = true;
        showStartScreen();
      }
      skipBtn.mousePressed(skipIntro);
      loreVideo.onended(() => {
        skipIntro();
      });
    });
    noLoop();
  } else {
    showStartScreen();
  }
}

// Exibe tela inicial e botões
function showStartScreen() {
  createStartButton();
  createRestartButton();
  redraw();
  noLoop();
}

// Cria botão de iniciar
function createStartButton() {
  const btn = createButton('Iniciar Jogo');
  btn.size(200, 60);
  btn.style('font-size', '26px');
  btn.style('background', 'linear-gradient(90deg, #00c3ff 0%,#b71cff 100%)');
  btn.style('color', '#fff');
  btn.style('border', 'none');
  btn.style('border-radius', '30px');
  btn.style('box-shadow', '0 4px 16px rgba(0,0,0,0.2)');
  btn.style('font-weight', 'bold');
  btn.style('cursor', 'pointer');
  btn.position((windowWidth - 200) / 2, (windowHeight - 60) / 2 + 60);
  btn.mousePressed(() => {
    gameStarted = true;
    btn.hide();
    if (batmanSound) {
      batmanSound.play();
    }
    loop();
  });
  window.startBtn = btn;
}

// Cria botão de reiniciar
function createRestartButton() {
  const btn = createButton('Reiniciar');
  btn.position((windowWidth - 200) / 2, (windowHeight + 40) / 2);
  btn.size(200, 60);
  btn.style('font-size', '26px');
  btn.style('background', 'linear-gradient(90deg, #b71cff 0%, #00c3ff 100%)');
  btn.style('color', '#fff');
  btn.style('border', 'none');
  btn.style('border-radius', '30px');
  btn.style('box-shadow', '0 4px 16px rgba(0,0,0,0.2)');
  btn.style('font-weight', 'bold');
  btn.style('cursor', 'pointer');
  btn.hide();
  btn.mousePressed(() => {
    resetGame();
    btn.hide();
    if (window.startBtn) window.startBtn.hide();
    loop();
  });
  window.restartBtn = btn;
}

// Reinicia variáveis do jogo
function resetGame() {
  score = 0;
  lives = 3;
  spawnTimer = 0;
  oasisTimer = 0;
  nextPhase = false;
  miniBubbles = [];
  obstacles = [];
  oasisList = [];
  particles = [];
  boss = null;
  bossBullets = [];
  explosionActive = false;
  explosionFrame = 0;
  gameOver = false;
  player.x = 150;
  player.y = 200;
  player.dy = 0;
  player.invincible = false;
}

// Desenha fundo do jogo
function drawBackground() {
  background('#012030');
  image(moonImg, width - 130, 30, 100, 100);
  fill('#e2b96f'); rect(0, height - 80, width, 80);
  fill('#f5d18c'); beginShape();
  vertex(0, height - 80);
  bezierVertex(width * 0.3, height - 120, width * 0.7, height - 40, width, height - 80);
  vertex(width, height); vertex(0, height);
  endShape(CLOSE);
}

// Desenha baiacu (obstáculo)
function drawbaiacu({ x, y, radius }) {
  push();
  translate(x, y);
  const scaleOsc = 1;
  const r = radius * scaleOsc * 1.7;
  image(baiacuImg, -r * 1.1, -r * 1.65, r * 2.2, r * 3.3);
  pop();
}

// Desenha oásis (vida extra)
function drawOasis({ x, y, radius }) {
  push();
  translate(x, y);
  image(oasisImg, -16, -16, 32, 32);
  pop();
}

// Desenha explosão e partículas
function drawExplosion() {
  if (!explosionActive) return;
  explosionFrame = floor(frameCount / explosionSpeed) % explosionFrames;
  let frameWidth = explosionImg.width / explosionFrames;
  let frameHeight = explosionImg.height;
  let drawX = explosionX - (frameWidth * explosionScale) / 2;
  let drawY = explosionY - (frameHeight * explosionScale) / 2;
  image(explosionImg, drawX, drawY, frameWidth * explosionScale, frameHeight * explosionScale,
        explosionFrame * frameWidth, 0, frameWidth, frameHeight);
  particles = particles.filter(p => {
    p.x += p.dx;
    p.y += p.dy;
    p.alpha -= 10;
    fill(255, 100, 0, p.alpha);
    noStroke();
    ellipse(p.x, p.y, p.radius * 2);
    return p.alpha > 0;
  });
  if (explosionFrame >= explosionFrames - 1 && particles.length === 0) {
    explosionActive = false;
    showGameOverScreen();
  }
}

// Exibe tela de game over
function showGameOverScreen() {
  gameOver = true;
  if (batmanSound && batmanSound.isPlaying()) {
    batmanSound.stop();
  }
  if (failSound) {
    failSound.play();
  }
  fill('rgba(0, 0, 0, 0.6)'); 
  rect(0, 0, width, height);
  fill('#fff'); 
  textSize(40); 
  textAlign(CENTER);
  text("Game Over", width / 2, height / 2 - 40);
  textSize(20); 
  text(`Pontuação final: ${score}`, width / 2, height / 2);
  text("Vidas restantes: 0", width / 2, height / 2 + 30);
  if (window.restartBtn) {
    window.restartBtn.position((windowWidth - 200) / 2, (windowHeight) / 2 + 60);
    window.restartBtn.show();
  }
  noLoop();
}

// Exibe tela de vitória
function showVictoryScreen() {
  fill('rgba(0, 0, 0, 0.6)'); 
  rect(0, 0, width, height);
  fill('#fff'); 
  textSize(40); 
  textAlign(CENTER);
  text("Você venceu!", width / 2, height / 2 - 40);
  textSize(20); 
  text(`Pontuação final: ${score}`, width / 2, height / 2);
  text(`Vidas restantes: ${lives}`, width / 2, height / 2 + 30);
  noLoop();
}

// Gera obstáculo
function spawnObstacle() {
  if (!gameOver) {
    obstacles.push({ x: width + 50, y: random(30, height - 60), radius: 20 + random(10), color: "#ff5555" });
  }
}

// Gera oásis
function spawnOasis() {
  if (!gameOver) {
    oasisList.push({ x: width + 80, y: random(60, height - 120), radius: 32 + random(12) });
  }
}

// Atualiza posição vertical do jogador
function updatePlayerVertical() {
  if (!gameOver) {
    player.y += upPressed ? -5 : downPressed ? 5 : 0;
    player.y = Math.max(player.radius, Math.min(height - player.radius, player.y));
    if (!upPressed && !downPressed) player.dy = 0;
  }
}

// Loop principal do jogo
function draw() {
  if (!gameStarted) {
    background('#012030');
    fill('white');
    textSize(36);
    textAlign(CENTER);
    text('Bem-vindo ao BatBolha!', width / 2, height / 2 - 60);
    textSize(20);
    text('Clique em Iniciar Jogo para começar', width / 2, height / 2 - 20);
    noLoop();
    return;
  }
  drawBackground();
  drawExplosion();
  if (explosionActive) {
    return;
  }
  fill('white'); 
  textSize(22); 
  textAlign(LEFT); 
  text(`Pontuação: ${score}`, 20, 30);
  for (let i = 0; i < 3; i++) {
    const x = 30 + i * 35, y = 60;
    if (i < lives) {
      image(heartImg, x - 16, y - 16, 32, 32);
    } else {
      tint(50, 50, 50, 180);
      image(heartImg, x - 16, y - 16, 32, 32);
      noTint();
    }
  }
  if (!gameOver) {
    updatePlayerVertical();
    player.update();
    player.draw();
    // Fase 1: obstáculos e oásis
    if (score < 10) {
      miniBubbles = miniBubbles.filter(mb => {
        mb.x += mb.speed;
        image(miniBubbleImg, mb.x - mb.radius, mb.y - mb.radius, mb.radius * 2, mb.radius * 2);
        let hit = false;
        obstacles = obstacles.filter(obs => {
          const dist = Math.hypot(mb.x - obs.x, mb.y - obs.y);
          if (!hit && dist < mb.radius + obs.radius) {
            score++;
            hit = true;
            popBaiacuSound.play();
            return false;
          }
          return true;
        });
        return mb.x - mb.radius <= width && !hit;
      });
      if (++oasisTimer > 400) { 
        spawnOasis(); 
        oasisTimer = 0; 
      }
      oasisList = oasisList.filter(oasis => {
        oasis.x -= 3;
        drawOasis(oasis);
        const dist = Math.hypot(player.x - oasis.x, player.y - oasis.y);
        if (dist < player.radius + oasis.radius * 0.7) {
          if (lives < 3) lives++;
          return false;
        }
        return oasis.x + oasis.radius > 0;
      });
      if (++spawnTimer > 80) { 
        spawnObstacle(); 
        spawnTimer = 0; 
      }
      obstacles = obstacles.filter(obs => {
        obs.x -= 3;
        const dist = Math.hypot(player.x - obs.x, player.y - obs.y);
        if (!player.invincible && dist < player.radius + obs.radius) {
          lives--;
          if (hitpopSound) hitpopSound.play();
          player.invincible = true;
          setTimeout(() => player.invincible = false, 800);
          if (lives <= 0) {
            explosionActive = true;
            explosionX = player.x;
            explosionY = player.y;
            explosionFrame = 0;
            explosionSound.play();
            for (let i = 0; i < 20; i++) {
              particles.push({
                x: player.x,
                y: player.y,
                dx: random(-5, 5),
                dy: random(-5, 5),
                radius: random(2, 5),
                alpha: 255
              });
            }
            return false;
          }
          return false;
        }
        drawbaiacu(obs);
        if (obs.x + obs.radius < 0) score++;
        return obs.x + obs.radius > 0;
      });
    } else {
      // Fase do boss
      if (!boss) {
        boss = {
          x: width - 200,
          y: height / 2,
          radius: 60,
          hp: 50,
          speed: 2,
          direction: 1,
          shootTimer: 0
        };
      }
      boss.y += boss.direction * 2;
      if (boss.y < boss.radius || boss.y > height - boss.radius) boss.direction *= -1;
      image(bossImg, boss.x - boss.radius, boss.y - boss.radius, boss.radius * 2, boss.radius * 2);
      fill('red');
      rect(boss.x - 50, boss.y - boss.radius - 20, 100, 10);
      fill('lime');
      rect(boss.x - 50, boss.y - boss.radius - 20, 100 * (boss.hp / 50), 10);
      noStroke();
      boss.shootTimer = (boss.shootTimer || 0) + 1;
      if (boss.shootTimer > 60) {
        bossBullets.push({
          x: boss.x - boss.radius,
          y: boss.y,
          radius: 24,
          speed: 7
        });
        glock19Sound.play();
        boss.shootTimer = 0;
      }
      bossBullets = bossBullets.filter(bullet => {
        bullet.x -= bullet.speed;
        image(bossBulletImg, bullet.x - bullet.radius, bullet.y - bullet.radius, bullet.radius * 2, bullet.radius * 2);
        const dist = Math.hypot(player.x - bullet.x, player.y - bullet.y);
        if (!player.invincible && dist < player.radius + bullet.radius) {
          lives--;
          if (hitpopSound) hitpopSound.play();
          player.invincible = true;
          setTimeout(() => player.invincible = false, 800);
          if (lives <= 0) {
            explosionActive = true;
            explosionX = player.x;
            explosionY = player.y;
            explosionFrame = 0;
            explosionSound.play();
            for (let i = 0; i < 20; i++) {
              particles.push({
                x: player.x,
                y: player.y,
                dx: random(-5, 5),
                dy: random(-5, 5),
                radius: random(2, 5),
                alpha: 255
              });
            }
            return false;
          }
          return false;
        }
        return bullet.x + bullet.radius > 0;
      });
      miniBubbles = miniBubbles.filter(mb => {
        mb.x += mb.speed;
        image(miniBubbleImg, mb.x - mb.radius, mb.y - mb.radius, mb.radius * 2, mb.radius * 2);
        let hitBoss = false;
        if (boss && Math.hypot(mb.x - boss.x, mb.y - boss.y) < boss.radius) {
          boss.hp--;
          hitBoss = true;
        }
        return mb.x - mb.radius <= width && !hitBoss;
      });
      if (++oasisTimer > 400) { 
        spawnOasis(); 
        oasisTimer = 0; 
      }
      oasisList = oasisList.filter(oasis => {
        oasis.x -= 3;
        drawOasis(oasis);
        const dist = Math.hypot(player.x - oasis.x, player.y - oasis.y);
        if (dist < player.radius + oasis.radius * 0.7) {
          if (lives < 3) lives++;
          return false;
        }
        return oasis.x + oasis.radius > 0;
      });
      if (boss.hp <= 0) {
        if (batmanSound && batmanSound.isPlaying()) {
          batmanSound.stop();
        }
        if (successSound) {
          successSound.play();
        }
        fill('rgba(0, 0, 0, 0.6)');
        rect(0, 0, width, height);
        fill('#fff');
        textSize(40);
        textAlign(CENTER);
        text('Você derrotou o Boss!', width / 2, height / 2 - 40);
        textSize(20);
        text(`Pontuação final: ${score}`, width / 2, height / 2);
        text(`Vidas restantes: ${lives}`, width / 2, height / 2 + 30);
        if (window.restartBtn) {
          window.restartBtn.position((windowWidth - 200) / 2, (windowHeight) / 2 + 60);
          window.restartBtn.show();
        }
        noLoop();
      }
    }
  } else {
    showGameOverScreen();
  }
}

// Controles do teclado
function keyPressed() {
  if (keyCode === UP_ARROW) upPressed = true;
  if (keyCode === DOWN_ARROW) downPressed = true;
  if (keyCode === 32 && !gameOver) {
    player.flap();
    miniBubbles.push({ x: player.x + player.radius, y: player.y, radius: 10, speed: 10 });
  }
  if (key === 'b' || key === 'B') {
    batmanMode = !batmanMode;
  }
}
function keyReleased() {
  if (keyCode === UP_ARROW) upPressed = false;
  if (keyCode === DOWN_ARROW) downPressed = false;
}