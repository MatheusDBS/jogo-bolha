// Variáveis globais
let bubbleImg, miniBubbleImg, cactusImg, oasisImg, explosionSound, heartImg;
let score = 0, lives = 3, spawnTimer = 0, oasisTimer = 0, nextPhase = false, finishLineX;
const GRAVITY = 0.4;
const { width, height } = { width: 800, height: 500 };
let miniBubbles = [], obstacles = [], oasisList = [];
let particles = [];
let boss = null; // Adicionado: variável global para o boss
let gameOver = false; // Novo: controle de estado do jogo
let bossBullets = []; // Balas disparadas pelo camarão

// Variáveis da animação de explosão
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
    image(bubbleImg, -this.radius, -this.radius, this.radius * 2, this.radius * 2);
    pop();
  },
  flap: () => (player.dy = player.flapStrength)
};

// Controles
let upPressed = false, downPressed = false;

// Carregar assets
function preload() {
  bubbleImg = loadImage('./imgs/Bolha.png');
  miniBubbleImg = loadImage('./imgs/Bolha.png');
  cactusImg = loadImage('./imgs/puffer-fish.gif');
  oasisImg = loadImage('./imgs/Oasis.png');
  explosionSound = loadSound('./Explosao.mp3');
  heartImg = loadImage('./imgs/heart.png');
  explosionImg = loadImage('./imgs/explosion.png');
  moonImg = loadImage('./imgs/lua.webp');
  bossImg = loadImage('./imgs/camarao.png');
  popBaiacuSound = loadSound('./popbaiacu.mp3'); // Adicionado: som do baiacu
  bossBulletImg = loadImage('./imgs/9mm.png'); // Adiciona imagem da bala do camarão
  glock19Sound = loadSound('./glock19.mp3'); // Adiciona som do tiro do camarão
}

// Configuração inicial
function setup() {
  createCanvas(width, height);
}

// Desenho do fundo (deserto)
function drawBackground() {
  background('#012030');
  image(moonImg, width - 130, 30, 100, 100); // Lua
  fill('#e2b96f'); rect(0, height - 80, width, 80); // Chão
  fill('#f5d18c'); beginShape(); // Dunas
  vertex(0, height - 80);
  bezierVertex(width * 0.3, height - 120, width * 0.7, height - 40, width, height - 80);
  vertex(width, height); vertex(0, height);
  endShape(CLOSE);
}

// Desenhar cacto
function drawCactus({ x, y, radius }) {
  push();
  translate(x, y);
  // Oscilação de tamanho mais fluida usando seno com período maior e menor intensidade
  const scaleOsc = 1; // Mantém a oscilação
  const r = radius * scaleOsc * 1.7; // Aumenta o tamanho do baiacu (1.7x maior)
  image(cactusImg, -r * 1.1, -r * 1.65, r * 2.2, r * 3.3);
  pop();
}

// Desenhar oásis
function drawOasis({ x, y, radius }) {
  push();
  translate(x, y);
  image(oasisImg, -radius, -radius, radius * 2, radius * 2);
  pop();
}

// Desenhar explosão
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

// Tela de Game Over
function showGameOverScreen() {
  gameOver = true;
  fill('rgba(0, 0, 0, 0.6)'); 
  rect(0, 0, width, height);
  fill('#fff'); 
  textSize(40); 
  textAlign(CENTER);
  text("Game Over", width / 2, height / 2 - 40);
  textSize(20); 
  text(`Pontuação final: ${score}`, width / 2, height / 2);
  text("Vidas restantes: 0", width / 2, height / 2 + 30);
  noLoop();
}

// Tela de vitória
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

// Gerar obstáculos e oásis
function spawnObstacle() {
  if (!gameOver) {
    obstacles.push({ x: width + 50, y: random(30, height - 60), radius: 20 + random(10), color: "#ff5555" });
  }
}

function spawnOasis() {
  if (!gameOver) {
    oasisList.push({ x: width + 80, y: random(60, height - 120), radius: 32 + random(12) });
  }
}

// Atualizar movimento vertical do jogador
function updatePlayerVertical() {
  if (!gameOver) {
    player.y += upPressed ? -5 : downPressed ? 5 : 0;
    player.y = Math.max(player.radius, Math.min(height - player.radius, player.y));
    if (!upPressed && !downPressed) player.dy = 0;
  }
}

// Atualização principal
function draw() {
  drawBackground();
  drawExplosion();
  if (explosionActive) {
    return;
  }
  
  // Elementos que sempre aparecem
  fill('#004466'); 
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

  // Se não for game over, desenha os elementos do jogo
  if (!gameOver) {
    updatePlayerVertical();
    player.update();
    player.draw();
    // Mini bolhas (tiros) e obstáculos
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
            popBaiacuSound.play(); // Toca o som ao eliminar o baiacu
            return false;
          }
          return true;
        });
        return mb.x - mb.radius <= width && !hit;
      });
      // Oásis
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

      // Obstáculos
      if (++spawnTimer > 80) { 
        spawnObstacle(); 
        spawnTimer = 0; 
      }
      
      obstacles = obstacles.filter(obs => {
        obs.x -= 3;
        const dist = Math.hypot(player.x - obs.x, player.y - obs.y);
        if (!player.invincible && dist < player.radius + obs.radius) {
          lives--;
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
        drawCactus(obs);
        if (obs.x + obs.radius < 0) score++;
        return obs.x + obs.radius > 0;
      });
    } else {
      // Boss Camarão
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
      // Movimento do boss
      boss.y += boss.direction * 2;
      if (boss.y < boss.radius || boss.y > height - boss.radius) boss.direction *= -1;
      image(bossImg, boss.x - boss.radius, boss.y - boss.radius, boss.radius * 2, boss.radius * 2);
      // Barra de vida
      fill('red');
      rect(boss.x - 50, boss.y - boss.radius - 20, 100, 10);
      fill('lime');
      rect(boss.x - 50, boss.y - boss.radius - 20, 100 * (boss.hp / 50), 10);
      noStroke();
      // Disparo do camarão
      boss.shootTimer = (boss.shootTimer || 0) + 1;
      if (boss.shootTimer > 60) { // A cada 1 segundo
        bossBullets.push({
          x: boss.x - boss.radius,
          y: boss.y,
          radius: 24,
          speed: 7
        });
        glock19Sound.play(); // Toca o som do tiro
        boss.shootTimer = 0;
      }
      // Atualiza e desenha as balas do camarão
      bossBullets = bossBullets.filter(bullet => {
        bullet.x -= bullet.speed;
        image(bossBulletImg, bullet.x - bullet.radius, bullet.y - bullet.radius, bullet.radius * 2, bullet.radius * 2);
        // Colisão com o jogador
        const dist = Math.hypot(player.x - bullet.x, player.y - bullet.y);
        if (!player.invincible && dist < player.radius + bullet.radius) {
          lives--;
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
      // Mini bolhas só colidem com o boss
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
      // Oásis continuam funcionando normalmente
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
      // Fim do jogo só quando o boss for derrotado
      if (boss.hp <= 0) {
        fill('yellow');
        textSize(40);
        textAlign(CENTER);
        text('Você derrotou o Boss!', width / 2, height / 2);
        noLoop();
      }
    }
  } else {
    // Mostra apenas a tela de game over
    showGameOverScreen();
  }
}

// Controles
function keyPressed() {
  if (keyCode === UP_ARROW) upPressed = true;
  if (keyCode === DOWN_ARROW) downPressed = true;
  if (keyCode === 32 && !gameOver) {
    player.flap();
    miniBubbles.push({ x: player.x + player.radius, y: player.y, radius: 10, speed: 10 });
  }
}

function keyReleased() {
  if (keyCode === UP_ARROW) upPressed = false;
  if (keyCode === DOWN_ARROW) downPressed = false;
}