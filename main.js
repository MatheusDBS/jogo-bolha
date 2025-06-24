let score = 0, bossHits = 0, lives = 3, vidaTimer = 0, gameStarted = false, gameOver = false;
let miniBubbles = [], vidaList = [], particles = [], bossBullets = [];
let leftPressed = false, rightPressed = false, downPressed = false, batmanMode = false, atirando = false;
let currentPhase = 'fase_1';
let phaseAssets = {};


function setup() {
  createCanvas(width, height);
  showStartScreen();
}

function draw() {
  if (!gameStarted) {
    showStartScreen();
    return;
  }
  if (!gameStarted) {
    background('#012030'); fill('white'); textAlign(CENTER);
    textSize(36); text('Bem-vindo ao BatBolha!', width / 2, height / 2 - 60);
    textSize(20); text('Clique em Iniciar Jogo para começar', width / 2, height / 2 - 20);
    noLoop(); return;
  }
  drawBackground(); drawExplosion();
  if (explosionActive) return;
  fill('white'); textSize(22); textAlign(LEFT);
  // Lógica dinâmica de fases e pontuação
  const totalFases = Object.keys(phases).length;
  const faseAtual = Number(currentPhase.replace(/\D/g, ''));
  text(`Elimine o Boss: ${faseAtual}/${totalFases} | Pontuação: ${bossHits}`, 20, 30);
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
      if (boss && Math.hypot(mb.x - boss.x, mb.y - boss.y) < boss.radius) {
        boss.hp--;
        bossHits++; // Incrementa a pontuação de acertos no boss
        return false;
      }
      return mb.x - mb.radius <= width;
    });
    if (++vidaTimer > 400) { spawnVida(); vidaTimer = 0; }
    vidaList = vidaList.filter(v => {
      v.x -= 3; drawVida(v);
      if (Math.hypot(player.x - v.x, player.y - v.y) < player.radius + v.radius * 0.7) {
        if (lives < 3) lives++; return false;
      }
      return v.x + v.radius > 0;
    });
    if (boss?.hp <= 0) {
      if (phaseAssets.batmanSound?.isPlaying()) phaseAssets.batmanSound.stop();
      const proximaFase = `fase_${faseAtual + 1}`;
      if (!phases[proximaFase]) {
        // Última fase vencida
        fill('rgba(0, 0, 0, 0.6)'); rect(0, 0, width, height); fill('#fff'); textAlign(CENTER);
        textSize(40); text('Parabéns! Você zerou o jogo!', width / 2, height / 2 - 40);
        textSize(20); text(`Pontuação final: ${bossHits}`, width / 2, height / 2);
        text(`Vidas restantes: ${lives}`, width / 2, height / 2 + 30);
        window.nextPhaseBtn?.hide();
        window.restartBtn?.show();
        noLoop();
      } else {
        try { phaseAssets.success.play(); } catch (e) { console.warn("Erro ao reproduzir success sound:", e); }
        fill('rgba(0, 0, 0, 0.6)'); rect(0, 0, width, height); fill('#fff'); textAlign(CENTER);
        textSize(40); text(`Você venceu a ${currentPhase}!`, width / 2, height / 2 - 40);
        textSize(20); text(`Pontuação final: ${bossHits}`, width / 2, height / 2);
        text(`Vidas restantes: ${lives}`, width / 2, height / 2 + 30);
        if (!window.nextPhaseBtn) {
          window.nextPhaseBtn = createButtonStyled('Ir para Próxima Fase', (windowWidth - 200) / 2, windowHeight / 2 + 80, 200, 60, () => {
            trocarFase(proximaFase);
            bossHits = 0;
          });
        } else window.nextPhaseBtn.position((windowWidth - 200) / 2, windowHeight / 2 + 80).show();
        window.restartBtn?.hide();
        noLoop();
      }
    }
  } else showGameOverScreen();
}

// Funções showStartScreen, showAboutScreen e showGameOverScreen foram movidas para controller.js

// Redireciona eventos de teclado para o player.js
function keyPressed() {
  if (keyCode === 27 && !gameStarted) { // ESC volta para tela inicial
    showStartScreen();
    return;
  }
  if (gameStarted && typeof window.playerKeyPressed === 'function') {
    window.playerKeyPressed();
  }
}

function keyReleased() {
  if (gameStarted && typeof window.playerKeyReleased === 'function') {
    window.playerKeyReleased();
  }
}