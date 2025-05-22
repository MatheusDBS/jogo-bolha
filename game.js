const canvas = document.getElementById('game'), ctx = canvas.getContext('2d');
const GRAVITY = 0.4;
let score = 0, lives = 3, spawnTimer = 0, oasisTimer = 0, burstFrame = 0, bursting = false;
const bubbleImg = Object.assign(new Image(), {src: 'Bolha.png'});
const miniBubbleImg = bubbleImg;
const explosionImg = Object.assign(new Image(), {src: './explosion.png'});
const explosionSound = new Audio('Explosao.mp3');
const cactusImg = Object.assign(new Image(), {src: 'Cactus.png'});
const oasisImg = Object.assign(new Image(), {src: 'Oasis.png'});
const EXPLOSION_FRAMES = 10, EXPLOSION_WIDTH = 68, EXPLOSION_HEIGHT = 68;
let miniBubbles = [], obstacles = [], oasisList = [];
const player = {
  x: 150, y: 200, radius: 25, dy: 0, flapStrength: -6, invincible: false,
  update() { this.y += this.dy; this.y = Math.max(this.radius, Math.min(canvas.height - this.radius, this.y)); },
  draw() { drawPlayerBubble(); },
  flap() { this.dy = this.flapStrength; }
};
function drawPlayerBubble() {
  ctx.save();
  ctx.translate(player.x, player.y);
  ctx.rotate(Math.sin(Date.now() / 300) / 10);
  ctx.scale(1 + Math.sin(Date.now() / 500) * 0.03, 1 + Math.cos(Date.now() / 500) * 0.03);
  ctx.globalAlpha = 0.95;
  ctx.drawImage(bubbleImg, -player.radius, -player.radius, player.radius * 2, player.radius * 2);
  ctx.restore();
}
function spawnObstacle() {
  obstacles.push({x: canvas.width + 50, y: Math.random() * (canvas.height - 60) + 30, radius: 20 + Math.random() * 10});
}
function spawnOasis() {
  oasisList.push({x: canvas.width + 80, y: Math.random() * (canvas.height - 120) + 60, radius: 32 + Math.random() * 12});
}
function drawBackground() {
  ctx.fillStyle = '#ffe5a1'; ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath(); ctx.arc(canvas.width - 80, 80, 50, 0, Math.PI * 2); ctx.fillStyle = '#fff7b2'; ctx.fill();
  ctx.fillStyle = '#e2b96f'; ctx.fillRect(0, canvas.height - 80, canvas.width, 80);
  ctx.beginPath(); ctx.moveTo(0, canvas.height - 80);
  ctx.bezierCurveTo(canvas.width * 0.3, canvas.height - 120, canvas.width * 0.7, canvas.height - 40, canvas.width, canvas.height - 80);
  ctx.lineTo(canvas.width, canvas.height); ctx.lineTo(0, canvas.height); ctx.closePath();
  ctx.fillStyle = '#f5d18c'; ctx.fill();
}
function drawCactus(obs) {
  ctx.save(); ctx.translate(obs.x, obs.y);
  ctx.drawImage(cactusImg, -obs.radius * 1.1, -obs.radius * 1.65, obs.radius * 2.2, obs.radius * 3.3);
  ctx.restore();
}
function drawOasis(oasis) {
  ctx.save(); ctx.translate(oasis.x, oasis.y); ctx.globalAlpha = 0.95;
  ctx.drawImage(oasisImg, -oasis.radius, -oasis.radius, oasis.radius * 2, oasis.radius * 2);
  ctx.restore();
}
let upPressed = false, downPressed = false;
document.addEventListener("keydown", e => {
  if (e.code === "ArrowUp") upPressed = true;
  if (e.code === "ArrowDown") downPressed = true; // corrigido aqui
  if (e.code === "Space") {
    player.flap();
    miniBubbles.push({x: player.x + player.radius, y: player.y, radius: 10, speed: 10});
  }
});
document.addEventListener("keyup", e => {
  if (e.code === "ArrowUp") upPressed = false;
  if (e.code === "ArrowDown") downPressed = false;
});
function updatePlayerVertical() {
  if (upPressed) player.y -= 5;
  if (downPressed) player.y += 5;
  player.y = Math.max(player.radius, Math.min(canvas.height - player.radius, player.y));
  if (!upPressed && !downPressed) player.dy = 0;
}
function animateBurstFullScreen(cx, cy, r) {
  if (!burstFrame) { explosionSound.currentTime = 0; explosionSound.play(); }
  ctx.save(); ctx.globalAlpha = 0.95;
  const w = canvas.width, h = canvas.height, ox = cx - w / 2, oy = cy - h / 2;
  ctx.drawImage(explosionImg, burstFrame * EXPLOSION_WIDTH, 0, EXPLOSION_WIDTH, EXPLOSION_HEIGHT, ox, oy, w, h);
  ctx.restore(); burstFrame++;
  if (burstFrame < EXPLOSION_FRAMES) setTimeout(() => animateBurstFullScreen(cx, cy, r), 50);
  else { burstFrame = 0; bursting = false; showGameOverScreen(); }
}
function showGameOverScreen() {
  ctx.fillStyle = "rgba(0,0,0,0.6)"; ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#fff"; ctx.font = "40px Arial";
  ctx.fillText("Game Over", canvas.width / 2 - 110, canvas.height / 2 - 10);
  ctx.font = "20px Arial";
  ctx.fillText("Pontuação final: " + score, canvas.width / 2 - 80, canvas.height / 2 + 30);
  ctx.fillText("Vidas restantes: 0", canvas.width / 2 - 80, canvas.height / 2 + 60);
}
function updateGame() {
  drawBackground(); ctx.clearRect(0, 0, canvas.width, canvas.height);
  updatePlayerVertical(); player.update(); drawPlayerBubble();
  for (let i = miniBubbles.length - 1; i >= 0; i--) {
    let mb = miniBubbles[i]; mb.x += mb.speed - 3;
    ctx.save(); ctx.globalAlpha = 0.85;
    ctx.drawImage(miniBubbleImg, mb.x - mb.radius, mb.y - mb.radius, mb.radius * 2, mb.radius * 2); ctx.restore();
    if (mb.x - mb.radius > canvas.width) miniBubbles.splice(i, 1);
  }
  for (let i = miniBubbles.length - 1; i >= 0; i--) {
    let mb = miniBubbles[i];
    for (let j = obstacles.length - 1; j >= 0; j--) {
      let obs = obstacles[j], dx = mb.x - obs.x, dy = mb.y - obs.y, dist = Math.hypot(dx, dy);
      if (dist < mb.radius + obs.radius) { miniBubbles.splice(i, 1); obstacles.splice(j, 1); score++; break; }
    }
  }
  if (++oasisTimer > 400) { spawnOasis(); oasisTimer = 0; }
  for (let i = oasisList.length - 1; i >= 0; i--) {
    let oasis = oasisList[i]; oasis.x -= 3; drawOasis(oasis);
    let dx = player.x - oasis.x, dy = player.y - oasis.y, dist = Math.hypot(dx, dy);
    if (dist < player.radius + oasis.radius * 0.7) { if (lives < 3) lives++; oasisList.pop(); continue; }
    if (oasis.x + oasis.radius < 0) oasisList.splice(i, 1);
  }
  if (++spawnTimer > 80) { spawnObstacle(); spawnTimer = 0; }
  for (let i = obstacles.length - 1; i >= 0; i--) {
    let obs = obstacles[i]; obs.x -= 3;
    let dx = player.x - obs.x, dy = player.y - obs.y, dist = Math.hypot(dx, dy);
    if (player.invincible) { drawCactus(obs); if (obs.x + obs.radius < 0) { obstacles.splice(i, 1); score++; } continue; }
    if (dist < player.radius + obs.radius) {
      obstacles.splice(i, 1); lives--;
      if (lives <= 0 && !bursting) { bursting = true; animateBurstFullScreen(player.x, player.y, player.radius); return; }
      player.invincible = true; setTimeout(() => { player.invincible = false; }, 800); continue;
    }
    drawCactus(obs); if (obs.x + obs.radius < 0) { obstacles.splice(i, 1); score++; }
  }
  ctx.fillStyle = "#004466"; ctx.font = "22px Arial"; ctx.fillText("Pontuação: " + score, 20, 30);
  if (score >= 10 && !window.nextPhase) {
    if (typeof window.finishLineX === 'undefined') window.finishLineX = canvas.width + 200;
    window.finishLineX -= 3;
    ctx.save(); ctx.strokeStyle = '#000'; ctx.lineWidth = 8;
    ctx.beginPath(); ctx.moveTo(window.finishLineX, 0); ctx.lineTo(window.finishLineX, canvas.height); ctx.stroke();
    ctx.font = '28px Arial'; ctx.fillStyle = '#fff'; ctx.fillText('CHEGADA', window.finishLineX - 60, 60); ctx.restore();
    if (player.x + player.radius > window.finishLineX) {
      window.nextPhase = true;
      setTimeout(() => { window.finishLineX = undefined; startNextPhase(); }, 1200);
    }
  } else window.finishLineX = undefined;
  for (let i = 0; i < 3; i++) {
    const x = 30 + i * 35, y = 60;
    ctx.save(); ctx.beginPath(); ctx.moveTo(x, y);
    ctx.bezierCurveTo(x - 10, y - 12, x - 22, y + 10, x, y + 18);
    ctx.bezierCurveTo(x + 22, y + 10, x + 10, y - 12, x, y);
    ctx.closePath(); ctx.fillStyle = i < lives ? '#e53935' : '#222'; ctx.fill();
    ctx.lineWidth = 2; ctx.strokeStyle = '#222'; ctx.stroke(); ctx.restore();
  }
  requestAnimationFrame(updateGame);
}
function startNextPhase() {
  obstacles = []; oasisList = []; score = 0; lives = 3; player.x = 150; player.y = 200; window.nextPhase = false;
  document.body.style.background = 'linear-gradient(135deg, #e0e0e0 60%, #b0bec5 100%)';
  drawBackground = function() {
    ctx.fillStyle = '#f5f5f5'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#d1cfcf';
    for (let y = 0; y < canvas.height - 80; y += 40)
      for (let x = 0; x < canvas.width; x += 40) ctx.strokeRect(x, y, 40, 40);
    ctx.fillStyle = '#b0bec5'; ctx.fillRect(0, canvas.height - 80, canvas.width, 80);
    ctx.fillStyle = '#a1887f'; ctx.fillRect(0, canvas.height - 120, 120, 40);
  };
  drawCactus = function(obs) {
    ctx.save(); ctx.translate(obs.x, obs.y);
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, obs.radius * 1.5);
    ctx.lineWidth = 10; ctx.strokeStyle = '#bdbdbd'; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-5, obs.radius * 1.5); ctx.lineTo(5, obs.radius * 1.5);
    ctx.lineWidth = 2; ctx.strokeStyle = '#fff'; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -obs.radius * 0.7);
    ctx.lineWidth = 12; ctx.strokeStyle = '#6d4c41'; ctx.stroke(); ctx.restore();
  };
  drawOasis = function(oasis) {
    ctx.save(); ctx.translate(oasis.x, oasis.y);
    ctx.beginPath(); ctx.ellipse(0, 0, oasis.radius, oasis.radius * 0.5, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#e0e0e0'; ctx.globalAlpha = 1; ctx.fill();
    ctx.beginPath(); ctx.ellipse(0, 0, oasis.radius * 0.7, oasis.radius * 0.25, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#4ecbe6'; ctx.globalAlpha = 0.7; ctx.fill(); ctx.globalAlpha = 1; ctx.restore();
  };
  oasisTimer = 0;
}
updateGame();
