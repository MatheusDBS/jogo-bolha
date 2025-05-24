// Variáveis globais
let bubbleImg, miniBubbleImg, cactusImg, oasisImg, explosionSound, heartImg;
let score = 0, lives = 3, spawnTimer = 0, oasisTimer = 0, nextPhase = false, finishLineX;
const GRAVITY = 0.4;
const { width, height } = { width: 800, height: 500 };
let miniBubbles = [], obstacles = [], oasisList = [];
let particles = [];
let gameOver = false; // Novo: controle de estado do jogo

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
    this.y = Math.max(this.radius, Math.min(height - this.radius, this.y + this.dy));
    this.dy += GRAVITY;
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
  bubbleImg = loadImage('Bolha.png');
  miniBubbleImg = loadImage('Bolha.png');
  cactusImg = loadImage('Cactus.png');
  oasisImg = loadImage('Oasis.png');
  explosionSound = loadSound('Explosao.mp3');
  heartImg = loadImage('heart.png');
  explosionImg = loadImage('explosion.png');
}

// Configuração inicial
function setup() {
  createCanvas(width, height);
}

// Desenho do fundo (deserto)
function drawBackground() {
  background('#ffe5a1');
  fill('#fff7b2'); noStroke(); ellipse(width - 80, 80, 100, 100); // Sol
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
  image(cactusImg, -radius * 1.1, -radius * 1.65, radius * 2.2, radius * 3.3);
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

    // Mini bolhas
    miniBubbles = miniBubbles.filter(mb => {
      mb.x += mb.speed - 3;
      image(miniBubbleImg, mb.x - mb.radius, mb.y - mb.radius, mb.radius * 2, mb.radius * 2);
      return mb.x - mb.radius <= width;
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

    // Linha de chegada
    if (score >= 10 && !nextPhase) {
      finishLineX ??= width + 200;
      finishLineX -= 3;
      stroke('#000'); 
      strokeWeight(8); 
      line(finishLineX, 0, finishLineX, height);
      fill('#fff'); 
      textSize(28); 
      textAlign(LEFT); 
      text('CHEGADA', finishLineX - 60, 60);
      if (player.x + player.radius > finishLineX) {
        nextPhase = true;
        setTimeout(() => { finishLineX = undefined; showVictoryScreen(); }, 1200);
      }
    } else {
      finishLineX = undefined;
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