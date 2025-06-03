// Fase 2 - BatBolha
// Imagens e sons principais
let bubbleImg, miniBubbleImg, baiacuImg, oasisImg, explosionSound, heartImg, batmanImg, platformImg;
let moonImg, bossImg, popBaiacuSound, bossBulletImg, glock19Sound, batmanSound, successSound, hitpopSound, failSound;
let explosionImg, ceuNoiteImg, bombaGif;
// Variáveis de estado do jogo
let score = 0, lives = 3, spawnTimer = 0, oasisTimer = 0, nextPhase = false;
const GRAVITY = 0.4;
const { width, height } = { width: 800, height: 500 };
// Coleções usadas na lógica do jogo
let miniBubbles = []; // Bolhas disparadas pelo jogador
let obstacles = [];   // Obstáculos (ex: baiacus)
let oasisList = [];   // Oásis (vidas extras)
let particles = [];   // Partículas de explosão
let boss = null;      // Boss da fase
let bossBullets = []; // Tiros do boss
let explosionFrames = 10, explosionScale = 3, explosionSpeed = 5, explosionActive = false, explosionFrame = 0, explosionX, explosionY;
let gameOver = false;
let gameStarted = false;
const GROUND_Y = height - 80;
const PLAYER_SPEED = 5;
const JUMP_STRENGTH = -12;
let leftPressed = false, rightPressed = false, batmanMode = false, downPressed = false;
let platforms = [
  { x: 100, y: 340, w: 160, h: 24 },
  { x: 320, y: 340, w: 160, h: 24 },
  { x: 540, y: 340, w: 160, h: 24 },
  { x: 210, y: 220, w: 160, h: 24 },
  { x: 430, y: 220, w: 160, h: 24 },
  { x: 100, y: 100, w: 160, h: 24 },
  { x: 320, y: 100, w: 160, h: 24 },
  { x: 540, y: 100, w: 160, h: 24 }
];

const player = {
  x: 150, y: GROUND_Y - 25, radius: 25, dy: 0, dx: 0, onGround: true, invincible: false,
  update() {
    if (leftPressed) this.dx = -PLAYER_SPEED;
    else if (rightPressed) this.dx = PLAYER_SPEED;
    else this.dx = 0;
    this.x += this.dx;
    this.dy += GRAVITY;
    this.y += this.dy;
    let onAnyPlatform = false;
    for (let plat of platforms) {
      if (
        this.x + this.radius > plat.x &&
        this.x - this.radius < plat.x + plat.w
      ) {
        if (
          this.dy >= 0 &&
          this.y + this.radius <= plat.y + 8 &&
          this.y + this.radius + this.dy >= plat.y &&
          !downPressed
        ) {
          this.y = plat.y - this.radius;
          this.dy = 0;
          this.onGround = true;
          onAnyPlatform = true;
        }
      }
    }
    if (this.y + this.radius > GROUND_Y) {
      this.y = GROUND_Y - this.radius;
      this.dy = 0;
      this.onGround = true;
      onAnyPlatform = true;
    }
    if (!onAnyPlatform) this.onGround = false;
    this.x = constrain(this.x, this.radius, width - this.radius);
    this.y = constrain(this.y, this.radius, height - this.radius);
  },
  draw() {
    push();
    translate(this.x, this.y);
    rotate(sin(millis() / 300) / 10);
    scale(1 + sin(millis() / 500) * 0.03, 1 + cos(millis() / 500) * 0.03);
    if (batmanMode) image(batmanImg, -this.radius * 1.3, -this.radius * 1.3, this.radius * 2.6, this.radius * 2.6);
    else image(bubbleImg, -this.radius, -this.radius, this.radius * 2, this.radius * 2);
    pop();
  },
  jump() {
    if (this.onGround) {
      this.dy = JUMP_STRENGTH;
      this.onGround = false;
    }
  }
};

function preload() {
  bubbleImg = loadImage('./assets/imgs/Bolha.png');
  miniBubbleImg = loadImage('./assets/imgs/Bolha.png');
  baiacuImg = loadImage('./assets/imgs/puffer-fish.gif');
  oasisImg = loadImage('./assets/imgs/heart.png');
  explosionSound = loadSound('./assets/audios/Explosao.mp3');
  heartImg = loadImage('./assets/imgs/heart.png');
  explosionImg = loadImage('./assets/imgs/explosion.png');
  ceuNoiteImg = loadImage('./assets/imgs/CéuNoite.jpg');
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
  platformImg = loadImage('./assets/imgs/Plataforma.png');
  bombaGif = loadImage('./assets/imgs/Bomba.gif');
}

function setup() {
  createCanvas(width, height);
  showStartScreen();
}

function showStartScreen() {
  createStartButton();
  createRestartButton();
  redraw();
  noLoop();
}

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
    loop();
  });
  window.startBtn = btn;
}

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
  player.y = GROUND_Y - 25;
  player.dy = 0;
  player.invincible = false;
}

function drawBackground() {
  background(ceuNoiteImg);
  fill('#e2b96f'); rect(0, height - 80, width, 80);
  fill('#f5d18c'); beginShape();
  vertex(0, height - 80);
  bezierVertex(width * 0.3, height - 120, width * 0.7, height - 40, width, height - 80);
  vertex(width, height); vertex(0, height);
  endShape(CLOSE);
  for (let plat of platforms) {
    image(platformImg, plat.x, plat.y, plat.w, plat.h);
  }
}

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

// Desenha baiacu (obstáculo)
function drawbaiacu({ x, y, radius }) {
  push();
  translate(x, y);
  image(baiacuImg, -radius * 1.1 * 1.7, -radius * 1.65 * 1.7, radius * 2.2 * 1.7, radius * 3.3 * 1.7);
  pop();
}

// Desenha oásis (vida extra)
function drawOasis({ x, y, radius }) {
  push();
  translate(x, y);
  image(oasisImg, -16, -16, 32, 32);
  pop();
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

// Loop principal do jogo
function draw() {
  if (!gameStarted) {
    drawBackground();
    fill('white');
    textSize(36);
    textAlign(CENTER);
    text('Bem-vindo à Fase 2!', width / 2, height / 2 - 60);
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
    player.update();
    player.draw();
    // Obstáculos e oásis
    miniBubbles = miniBubbles.filter(mb => {
      mb.x += mb.speed;
      image(miniBubbleImg, mb.x - mb.radius, mb.y - mb.radius, mb.radius * 2, mb.radius * 2);
      let hit = false;
      obstacles = obstacles.filter(obs => {
        const dist = Math.hypot(mb.x - obs.x, mb.y - obs.y);
        if (!hit && dist < mb.radius + obs.radius) {
          score++;
          hit = true;
          if (popBaiacuSound) popBaiacuSound.play();
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
          if (explosionSound) explosionSound.play();
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
    showGameOverScreen();
  }
}

// Controles do teclado
function keyPressed() {
  if (key === 'a' || key === 'A') leftPressed = true;
  if (key === 'd' || key === 'D') rightPressed = true;
  if ((key === 'w' || key === 'W' || keyCode === 32) && !gameOver) {
    player.jump();
  }
  if (key === 's' || key === 'S') downPressed = true;
  if (key === 'b' || key === 'B') {
    batmanMode = !batmanMode;
  }
}
function keyReleased() {
  if (key === 'a' || key === 'A') leftPressed = false;
  if (key === 'd' || key === 'D') rightPressed = false;
  if (key === 's' || key === 'S') downPressed = false;
}

// Disparo com o mouse
function mousePressed() {
  if (gameStarted && !gameOver && mouseButton === LEFT) {
    miniBubbles.push({ x: player.x + player.radius, y: player.y, radius: 10, speed: 10 });
  }
}
