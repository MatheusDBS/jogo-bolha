let score = 0, lives = 3, oasisTimer = 0, gameStarted = false, gameOver = false;
let miniBubbles = [], oasisList = [], particles = [], bossBullets = [];
let leftPressed = false, rightPressed = false, downPressed = false, batmanMode = false, atirando = false;
let currentPhase = 'fase_1';
let phaseAssets = {};


function setup() {
  createCanvas(width, height);
  try {
    startLore();
  } catch (e) {
    console.warn("Erro ao chamar startLore, iniciando tela inicial diretamente:", e);
    showStartScreen();
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
        showGameOverScreen();
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