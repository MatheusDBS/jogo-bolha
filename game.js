const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const GRAVITY = 0.4;
let score = 0;
let lives = 3;

// Carrega a imagem da bolha
const bubbleImg = new Image();
bubbleImg.src = 'Bolha.png';

// Carrega a imagem da mini bolha
const miniBubbleImg = new Image();
miniBubbleImg.src = 'Bolha.png';

// Lista de mini bolhas disparadas
let miniBubbles = [];

// Carrega o spritesheet da explosão
const explosionImg = new Image();
explosionImg.src = './explosion.png';

// Carrega o som de explosão
const explosionSound = new Audio('Explosao.mp3');

// Carrega a imagem do cacto
const cactusImg = new Image();
cactusImg.src = 'Cactus.png';

// Carrega a imagem do oásis
const oasisImg = new Image();
oasisImg.src = 'Oasis.png';

const EXPLOSION_FRAMES = 10;
const EXPLOSION_WIDTH = 68; // largura de cada frame (680px / 10)
const EXPLOSION_HEIGHT = 68;

let burstFrame = 0;
let bursting = false;
function animateBurstFullScreen(centerX, centerY, radius) {
  if (burstFrame === 0) {
    explosionSound.currentTime = 0;
    explosionSound.play();
  }
  ctx.save();
  ctx.globalAlpha = 0.95;
  // Calcula o retângulo para centralizar a explosão na posição da bolha
  const explosionW = canvas.width;
  const explosionH = canvas.height;
  const offsetX = centerX - explosionW / 2;
  const offsetY = centerY - explosionH / 2;
  ctx.drawImage(
    explosionImg,
    burstFrame * EXPLOSION_WIDTH, 0,
    EXPLOSION_WIDTH, EXPLOSION_HEIGHT,
    offsetX, offsetY,
    explosionW, explosionH
  );
  ctx.restore();
  burstFrame++;
  if (burstFrame < EXPLOSION_FRAMES) {
    setTimeout(() => animateBurstFullScreen(centerX, centerY, radius), 50);
  } else {
    burstFrame = 0;
    bursting = false;
    showGameOverScreen();
  }
}

function showGameOverScreen() {
  ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#fff";
  ctx.font = "40px Arial";
  ctx.fillText("Game Over", canvas.width / 2 - 110, canvas.height / 2 - 10);
  ctx.font = "20px Arial";
  ctx.fillText("Pontuação final: " + score, canvas.width / 2 - 80, canvas.height / 2 + 30);
  ctx.fillText("Vidas restantes: 0", canvas.width / 2 - 80, canvas.height / 2 + 60);
}

// Bolha
const player = {
  x: 150,
  y: 200,
  radius: 25,
  color: "#aeeeff",
  dy: 0,
  flapStrength: -6,
  invincible: false,
  update() {
    // Remove a gravidade
    // this.dy += GRAVITY;
    this.y += this.dy;

    // Limites da tela
    if (this.y + this.radius > canvas.height) {
      this.y = canvas.height - this.radius;
      this.dy = 0;
    }
    if (this.y - this.radius < 0) {
      this.y = this.radius;
      this.dy = 0;
    }
  },
  draw() {
    drawPlayerBubble();
  },
  flap() {
    this.dy = this.flapStrength;
  }
};

// Função para desenhar a bolha usando a imagem
function drawPlayerBubble() {
  ctx.save();
  ctx.translate(player.x, player.y);
  ctx.rotate(Math.sin(Date.now() / 300) / 10); // leve rotação animada
  ctx.scale(1 + Math.sin(Date.now() / 500) * 0.03, 1 + Math.cos(Date.now() / 500) * 0.03); // leve pulsação
  ctx.globalAlpha = 0.95;
  ctx.drawImage(bubbleImg, -player.radius, -player.radius, player.radius * 2, player.radius * 2);
  ctx.restore();
}

// Obstáculos
let obstacles = [];
let spawnTimer = 0;

// Oásis
let oasisList = [];
let oasisTimer = 0;

function spawnObstacle() {
  const y = Math.random() * (canvas.height - 60) + 30;
  obstacles.push({
    x: canvas.width + 50,
    y: y,
    radius: 20 + Math.random() * 10,
    color: "#ff5555"
  });
}

function spawnOasis() {
  const y = Math.random() * (canvas.height - 120) + 60;
  oasisList.push({
    x: canvas.width + 80,
    y: y,
    radius: 32 + Math.random() * 12
  });
}

function drawBackground() {
  // Céu
  ctx.fillStyle = '#ffe5a1';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  // Sol
  ctx.beginPath();
  ctx.arc(canvas.width - 80, 80, 50, 0, Math.PI * 2);
  ctx.fillStyle = '#fff7b2';
  ctx.fill();
  // Chão
  ctx.fillStyle = '#e2b96f';
  ctx.fillRect(0, canvas.height - 80, canvas.width, 80);
  // Dunas
  ctx.beginPath();
  ctx.moveTo(0, canvas.height - 80);
  ctx.bezierCurveTo(canvas.width * 0.3, canvas.height - 120, canvas.width * 0.7, canvas.height - 40, canvas.width, canvas.height - 80);
  ctx.lineTo(canvas.width, canvas.height);
  ctx.lineTo(0, canvas.height);
  ctx.closePath();
  ctx.fillStyle = '#f5d18c';
  ctx.fill();
}

function drawCactus(obs) {
  ctx.save();
  ctx.translate(obs.x, obs.y);
  ctx.drawImage(cactusImg, -obs.radius * 1.1, -obs.radius * 1.65, obs.radius * 2.2, obs.radius * 3.3);
  ctx.restore();
}

function drawOasis(oasis) {
  ctx.save();
  ctx.translate(oasis.x, oasis.y);
  ctx.globalAlpha = 0.95;
  ctx.drawImage(oasisImg, -oasis.radius, -oasis.radius, oasis.radius * 2, oasis.radius * 2);
  ctx.restore();
}

// Controles
let upPressed = false;
let downPressed = false;

document.addEventListener("keydown", e => {
  if (e.code === "ArrowUp") upPressed = true;
  if (e.code === "ArrowDown") downPressed = true;
  if (e.code === "Space") {
    player.flap();
    // Dispara uma mini bolha para frente
    miniBubbles.push({
      x: player.x + player.radius,
      y: player.y,
      radius: 10,
      speed: 10
    });
  }
});
document.addEventListener("keyup", e => {
  if (e.code === "ArrowUp") upPressed = false;
  if (e.code === "ArrowDown") downPressed = false;
});

function updatePlayerVertical() {
  if (upPressed) {
    player.y -= 5;
  }
  if (downPressed) {
    player.y += 5;
  }
  // Limites da tela
  if (player.y + player.radius > canvas.height) {
    player.y = canvas.height - player.radius;
    player.dy = 0;
  }
  if (player.y - player.radius < 0) {
    player.y = player.radius;
    player.dy = 0;
  }
  // Quando não está pressionando, para o movimento vertical
  if (!upPressed && !downPressed) {
    player.dy = 0;
  }
}

function updateGame() {
  drawBackground();
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  updatePlayerVertical();
  player.update();
  // Desenha a bolha com imagem
  drawPlayerBubble();

  // Atualiza e desenha mini bolhas
  for (let i = miniBubbles.length - 1; i >= 0; i--) {
    const mb = miniBubbles[i];
    mb.x += mb.speed - 3;
    ctx.save();
    ctx.globalAlpha = 0.85;
    ctx.drawImage(miniBubbleImg, mb.x - mb.radius, mb.y - mb.radius, mb.radius * 2, mb.radius * 2);
    ctx.restore();
    // Remove se sair da tela
    if (mb.x - mb.radius > canvas.width) {
      miniBubbles.splice(i, 1);
    }
  }

  // Verifica colisão entre mini bolhas e obstáculos
  for (let i = miniBubbles.length - 1; i >= 0; i--) {
    const mb = miniBubbles[i];
    for (let j = obstacles.length - 1; j >= 0; j--) {
      const obs = obstacles[j];
      const dx = mb.x - obs.x;
      const dy = mb.y - obs.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < mb.radius + obs.radius) {
        // Remove a mini bolha e o obstáculo atingido
        miniBubbles.splice(i, 1);
        obstacles.splice(j, 1);
        score++;
        break; // Sai do loop de obstáculos para evitar erro de índice
      }
    }
  }

  // Oásis
  oasisTimer++;
  if (oasisTimer > 400) {
    spawnOasis();
    oasisTimer = 0;
  }
  for (let i = oasisList.length - 1; i >= 0; i--) {
    const oasis = oasisList[i];
    oasis.x -= 3;
    drawOasis(oasis);
    // Colisão com oásis
    const dx = player.x - oasis.x;
    const dy = player.y - oasis.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < player.radius + oasis.radius * 0.7) {
      if (lives < 3) lives++;
      oasisList.pop(); // remove o último oásis (exemplo de uso de pop)
      continue;
    }
    if (oasis.x + oasis.radius < 0) {
      oasisList.splice(i, 1);
    }
  }

  // Obstáculos
  spawnTimer++;
  if (spawnTimer > 80) {
    spawnObstacle();
    spawnTimer = 0;
  }

  for (let i = obstacles.length - 1; i >= 0; i--) {
    const obs = obstacles[i];
    obs.x -= 3;

    // Colisão circular
    const dx = player.x - obs.x;
    const dy = player.y - obs.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (player.invincible) {
      drawCactus(obs);
      if (obs.x + obs.radius < 0) {
        obstacles.splice(i, 1);
        score++;
      }
      continue;
    }
    if (dist < player.radius + obs.radius) {
      // Remove o obstáculo atingido (não o último)
      obstacles.splice(i, 1);
      lives--;
      if (lives <= 0) {
        if (!bursting) {
          bursting = true;
          animateBurstFullScreen(player.x, player.y, player.radius);
        }
        return;
      }
      // Adiciona um pequeno tempo de invencibilidade após perder uma vida
      player.invincible = true;
      setTimeout(() => { player.invincible = false; }, 800);
      continue;
    }
    drawCactus(obs);
    if (obs.x + obs.radius < 0) {
      obstacles.splice(i, 1);
      score++;
    }
  }

  // Pontuação e vidas
  ctx.fillStyle = "#004466";
  ctx.font = "22px Arial";
  ctx.fillText("Pontuação: " + score, 20, 30);

  // Linha de chegada móvel após score >= 50
  if (score >= 10 && !window.nextPhase) {
    // Calcula a posição da linha de chegada acompanhando o cenário
    if (typeof window.finishLineX === 'undefined') {
      window.finishLineX = canvas.width + 200; // aparece fora da tela e vem andando
    }
    window.finishLineX -= 3; // move junto com o cenário
    // Desenha linha de chegada móvel
    ctx.save();
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(window.finishLineX, 0);
    ctx.lineTo(window.finishLineX, canvas.height);
    ctx.stroke();
    ctx.font = '28px Arial';
    ctx.fillStyle = '#fff';
    ctx.fillText('CHEGADA', window.finishLineX - 60, 60);
    ctx.restore();
    // Detecta se o player cruzou a linha
    if (player.x + player.radius > window.finishLineX) {
      window.nextPhase = true;
      setTimeout(() => {
        window.finishLineX = undefined;
        startNextPhase();
      }, 1200);
    }
  } else {
    window.finishLineX = undefined;
  }

  // Desenhar corações de vida
  for (let i = 0; i < 3; i++) {
    const x = 30 + i * 35;
    const y = 60;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.bezierCurveTo(x - 10, y - 12, x - 22, y + 10, x, y + 18);
    ctx.bezierCurveTo(x + 22, y + 10, x + 10, y - 12, x, y);
    ctx.closePath();
    ctx.fillStyle = i < lives ? '#e53935' : '#222';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#222';
    ctx.stroke();
    ctx.restore();
  }

  requestAnimationFrame(updateGame);
}

function gameOver() {
  showGameOverScreen();
}

// Próxima fase (cozinha)
function startNextPhase() {
  obstacles = [];
  oasisList = [];
  score = 0;
  lives = 3;
  player.x = 150;
  player.y = 200;
  window.nextPhase = false;
  // Muda o fundo do body via CSS para a segunda fase
  document.body.style.background = 'linear-gradient(135deg, #e0e0e0 60%, #b0bec5 100%)';
  // Fundo de cozinha
  drawBackground = function() {
    // Parede
    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // Azulejos
    ctx.strokeStyle = '#d1cfcf';
    for (let y = 0; y < canvas.height - 80; y += 40) {
      for (let x = 0; x < canvas.width; x += 40) {
        ctx.strokeRect(x, y, 40, 40);
      }
    }
    // Pia
    ctx.fillStyle = '#b0bec5';
    ctx.fillRect(0, canvas.height - 80, canvas.width, 80);
    // Armário
    ctx.fillStyle = '#a1887f';
    ctx.fillRect(0, canvas.height - 120, 120, 40);
  };
  // Obstáculos agora são facas
  drawCactus = function(obs) {
    ctx.save();
    ctx.translate(obs.x, obs.y);
    // Lâmina
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, obs.radius * 1.5);
    ctx.lineWidth = 10;
    ctx.strokeStyle = '#bdbdbd';
    ctx.stroke();
    // Fio da lâmina
    ctx.beginPath();
    ctx.moveTo(-5, obs.radius * 1.5);
    ctx.lineTo(5, obs.radius * 1.5);
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#fff';
    ctx.stroke();
    // Cabo
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -obs.radius * 0.7);
    ctx.lineWidth = 12;
    ctx.strokeStyle = '#6d4c41';
    ctx.stroke();
    ctx.restore();
  };
  // Oásis vira pano de chão com água
  drawOasis = function(oasis) {
    ctx.save();
    ctx.translate(oasis.x, oasis.y);
    // Pano
    ctx.beginPath();
    ctx.ellipse(0, 0, oasis.radius, oasis.radius * 0.5, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#e0e0e0';
    ctx.globalAlpha = 1;
    ctx.fill();
    // Água
    ctx.beginPath();
    ctx.ellipse(0, 0, oasis.radius * 0.7, oasis.radius * 0.25, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#4ecbe6';
    ctx.globalAlpha = 0.7;
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.restore();
  };
  // Garante que oásis (panos de chão) continuem aparecendo normalmente
  oasisTimer = 0;
}

updateGame();
