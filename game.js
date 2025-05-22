// Variáveis globais
let bubbleImg, miniBubbleImg, cactusImg, oasisImg, explosionSound, heartImg;
let score = 0, lives = 3, spawnTimer = 0, oasisTimer = 0, nextPhase = false, finishLineX;
const GRAVITY = 0.4;
const { width, height } = { width: 800, height: 500 };
let miniBubbles = [], obstacles = [], oasisList = [];

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
preload = () => {
  bubbleImg = loadImage('Bolha.png');
  miniBubbleImg = loadImage('Bolha.png');
  cactusImg = loadImage('Cactus.png');
  oasisImg = loadImage('Oasis.png');
  explosionSound = loadSound('Explosao.mp3');
  heartImg = loadImage('heart.png'); // Novo: carrega imagem do coração
};

// Configuração inicial
setup = () => createCanvas(width, height);

// Desenho do fundo (deserto)
let drawBackground = () => {
  background('#ffe5a1');
  fill('#fff7b2'); noStroke(); ellipse(width - 80, 80, 100, 100); // Sol
  fill('#e2b96f'); rect(0, height - 80, width, 80); // Chão
  fill('#f5d18c'); beginShape(); // Dunas
  vertex(0, height - 80);
  bezierVertex(width * 0.3, height - 120, width * 0.7, height - 40, width, height - 80);
  vertex(width, height); vertex(0, height);
  endShape(CLOSE);
};

// Desenhar cacto
let drawCactus = ({ x, y, radius }) => {
  push();
  translate(x, y);
  image(cactusImg, -radius * 1.1, -radius * 1.65, radius * 2.2, radius * 3.3);
  pop();
};

// Desenhar oásis
let drawOasis = ({ x, y, radius }) => {
  push();
  translate(x, y);
  image(oasisImg, -radius, -radius, radius * 2, radius * 2);
  pop();
};

// Tela de Game Over
const showGameOverScreen = () => {
  fill('rgba(0, 0, 0, 0.6)'); rect(0, 0, width, height);
  fill('#fff'); textSize(40); textAlign(CENTER);
  text("Game Over", width / 2, height / 2 - 10);
  textSize(20); text(`Pontuação final: ${score}`, width / 2, height / 2 + 30);
  text("Vidas restantes: 0", width / 2, height / 2 + 60);
  noLoop();
};

// Gerar obstáculos e oásis
const spawnObstacle = () => obstacles.push({ x: width + 50, y: random(30, height - 60), radius: 20 + random(10), color: "#ff5555" });
const spawnOasis = () => oasisList.push({ x: width + 80, y: random(60, height - 120), radius: 32 + random(12) });

// Atualizar movimento vertical do jogador
const updatePlayerVertical = () => {
  player.y += upPressed ? -5 : downPressed ? 5 : 0;
  player.y = Math.max(player.radius, Math.min(height - player.radius, player.y));
  if (!upPressed && !downPressed) player.dy = 0;
};

// Atualização principal
draw = () => {
  drawBackground();
  updatePlayerVertical();
  player.update();
  player.draw();

  // Mini bolhas
  miniBubbles = miniBubbles.filter(mb => {
    mb.x += mb.speed - 3;
    image(miniBubbleImg, mb.x - mb.radius, mb.y - mb.radius, mb.radius * 2, mb.radius * 2);
    return mb.x - mb.radius <= width;
  });

  // Colisão mini bolhas e obstáculos
  miniBubbles.forEach((mb, i) => {
    obstacles = obstacles.filter((obs, j) => {
      const dist = Math.hypot(mb.x - obs.x, mb.y - obs.y);
      if (dist < mb.radius + obs.radius) {
        miniBubbles.splice(i, 1);
        score++;
        return false;
      }
      return true;
    });
  });

  // Oásis
  if (++oasisTimer > 400) { spawnOasis(); oasisTimer = 0; }
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
  if (++spawnTimer > 80) { spawnObstacle(); spawnTimer = 0; }
  obstacles = obstacles.filter(obs => {
    obs.x -= 3;
    const dist = Math.hypot(player.x - obs.x, player.y - obs.y);
    if (!player.invincible && dist < player.radius + obs.radius) {
      lives--;
      player.invincible = true;
      setTimeout(() => player.invincible = false, 800);
      if (lives <= 0) { showGameOverScreen(); return false; }
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
    stroke('#000'); strokeWeight(8); line(finishLineX, 0, finishLineX, height);
    fill('#fff'); textSize(28); textAlign(LEFT); text('CHEGADA', finishLineX - 60, 60);
    if (player.x + player.radius > finishLineX) {
      nextPhase = true;
      setTimeout(() => { finishLineX = undefined; startNextPhase(); }, 1200);
    }
  } else finishLineX = undefined;

  // Pontuação
  fill('#004466'); textSize(22); textAlign(LEFT); text(`Pontuação: ${score}`, 20, 30);

  // Corações de vida com imagem
  for (let i = 0; i < 3; i++) {
    const x = 30 + i * 35, y = 60;
    if (i < lives) {
      image(heartImg, x - 16, y - 16, 32, 32); // Desenha coração colorido
    } else {
      tint(50, 50, 50, 180); // Coração apagado
      image(heartImg, x - 16, y - 16, 32, 32);
      noTint();
    }
  }
};

// Próxima fase (cozinha)
const startNextPhase = () => {
  [obstacles, oasisList, nextPhase] = [[], [], false];
  [score, lives, player.x, player.y] = [0, 3, 150, 200];
  document.body.style.background = 'linear-gradient(135deg, #e0e0e0 60%, #b0bec5 100%)';
  drawBackground = () => {
    background('#f5f5f5');
    stroke('#d1cfcf');
    for (let y = 0; y < height - 80; y += 40)
      for (let x = 0; x < width; x += 40) strokeRect(x, y, 40, 40);
    fill('#b0bec5'); noStroke(); rect(0, height - 80, width, 80);
    fill('#a1887f'); rect(0, height - 120, 120, 40);
  };
  drawCactus = ({ x, y, radius }) => {
    push();
    translate(x, y);
    stroke('#bdbdbd'); strokeWeight(10); line(0, 0, 0, radius * 1.5);
    stroke('#fff'); strokeWeight(2); line(-5, radius * 1.5, 5, radius * 1.5);
    stroke('#6d4c41'); strokeWeight(12); line(0, 0, 0, -radius * 0.7);
    pop();
  };
  drawOasis = ({ x, y, radius }) => {
    push();
    translate(x, y);
    fill('#e0e0e0'); noStroke(); ellipse(0, 0, radius * 2, radius);
    fill('#4ecbe6'); ellipse(0, 0, radius * 1.4, radius * 0.5);
    pop();
  };
  oasisTimer = 0;
};

// Controles
keyPressed = () => {
  if (keyCode === UP_ARROW) upPressed = true;
  if (keyCode === DOWN_ARROW) downPressed = true;
  if (keyCode === 32) {
    player.flap();
    miniBubbles.push({ x: player.x + player.radius, y: player.y, radius: 10, speed: 10 });
  }
};

keyReleased = () => {
  if (keyCode === UP_ARROW) upPressed = false;
  if (keyCode === DOWN_ARROW) downPressed = false;
};