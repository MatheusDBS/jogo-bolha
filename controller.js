let loreVideoPlayed = false;
let loreVideo;

function startLore() {
  if (!loreVideoPlayed) {
    // Mostra o vídeo imediatamente, sem botão intermediário
    loreVideo = createVideo('./assets/videos/lorebolha.mp4', () => {
      loreVideo.size(640, 360);
      loreVideo.position((windowWidth - 640) / 2, (windowHeight - 360) / 2);
      loreVideo.show();
      loreVideo.volume(1);
      try {
        loreVideo.play();
      } catch (e) {
        console.warn("Erro ao reproduzir loreVideo:", e);
      }
      loreVideo.elt.setAttribute('playsinline', '');
      loreVideo.elt.setAttribute('webkit-playsinline', '');
      loreVideo.elt.setAttribute('controls', '');
      const skipBtn = createButton('Pular Introdução');
      skipBtn.size(120, 36);
      skipBtn.style('font-size', '13px');
      skipBtn.style('background', 'linear-gradient(90deg,rgb(0, 81, 255) 0%,rgb(32, 28, 255) 100%)');
      skipBtn.style('color', '#fff');
      skipBtn.style('border', 'none');
      skipBtn.style('border-radius', '18px');
      skipBtn.style('box-shadow', '0 2px 8px rgba(0,0,0,0.15)');
      skipBtn.style('font-weight', 'normal');
      skipBtn.style('cursor', 'pointer');
      skipBtn.position((windowWidth - 120) / 2, (windowHeight + 360) / 2 + 16);
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
      loreVideo.onended(skipIntro);
    });
    noLoop();
  } else {
    showStartScreen();
  }
}


function showStartScreen() {
  background('#012030');
  fill('white');
  textAlign(CENTER);
  textSize(36);
  text('Bem-vindo ao BatBolha!', width / 2, height / 2 - 80);
  textSize(20);
  text('Clique em uma opção para começar', width / 2, height / 2 - 40);

  // Botão Iniciar Jogo
  if (!window.startBtn) {
    window.startBtn = createButtonStyled('Iniciar Jogo', (windowWidth - 200) / 2, windowHeight / 2, 200, 50, () => {
      window.startBtn.hide();
      window.introBtn?.hide();
      window.aboutBtn?.hide();
      gameStarted = true;
      loop();
    });
  } else {
    window.startBtn.position((windowWidth - 200) / 2, windowHeight / 2).show();
  }

  // Botão Ver Introdução
  if (!window.introBtn) {
    window.introBtn = createButtonStyled('Ver introdução', (windowWidth - 200) / 2, windowHeight / 2 + 60, 200, 50, () => {
      startLore();
    });
  } else {
    window.introBtn.position((windowWidth - 200) / 2, windowHeight / 2 + 60).show();
  }

  // Botão Ver Sobre
  if (!window.aboutBtn) {
    window.aboutBtn = createButtonStyled('Ver sobre', (windowWidth - 200) / 2, windowHeight / 2 + 120, 200, 50, () => {
      showAboutScreen();
    });
  } else {
    window.aboutBtn.position((windowWidth - 200) / 2, windowHeight / 2 + 120).show();
  }
  noLoop();
}

function showAboutScreen() {
  background('#012030');
  // Cartão centralizado
  fill(30, 50, 70, 240);
  noStroke();
  const cardW = 650, cardH = 270;
  const cardX = width/2 - cardW/2, cardY = height/2 - cardH/2;
  rect(cardX, cardY, cardW, cardH, 18);

  fill('white');
  textAlign(CENTER);
  let y = cardY + 40;
  textSize(30);
  text('Sobre o Jogo', width/2, y);
  y += 38;
  textSize(16);
  text('BatBolha é um jogo de plataforma onde você controla o BatBolha\npara derrotar o Camarão Pistola e seus parceiros através das fases!', width/2, y);
  y += 48;
  textSize(18);
  text('Controles:', width/2, y);
  y += 26;
  textSize(15);
  text('A/D: mover   |   W ou Espaço: pular   |   S: descer   |   Mouse: atirar bolhas', width/2, y);
  y += 36;
  text('Colete corações para recuperar vidas e desvie dos ataques do Boss!', width/2, y);

  // Linha separadora
  stroke('#00c3ff');
  strokeWeight(1.5);
  line(cardX + 60, y + 20, cardX + cardW - 60, y + 20);
  noStroke();

  // Criadores
  textSize(15);
  fill('#00c3ff');
  text('Criadores: \nAlexandre A. Tucci, João Victor Saboya de C., Matheus De Botoli Silva, Roberto Zhou', width/2, y + 45);
  fill('white');

  // Instrução para sair
  textSize(14);
  fill('#fff');
  text('Clique ESC para sair', width/2, cardY + cardH + 20);

  if (window.startBtn) window.startBtn.hide();
  if (window.introBtn) window.introBtn.hide();
  if (window.aboutBtn) window.aboutBtn.hide();
  if (window.backBtn) { window.backBtn.hide(); window.backBtn = undefined; }
  noLoop();
}

function showGameOverScreen() {
  gameOver = true;
  if (phaseAssets.batmanSound?.isPlaying()) phaseAssets.batmanSound.stop();
  try { phaseAssets.fail.play(); } catch (e) { console.warn("Erro ao reproduzir fail sound:", e); }
  fill('rgba(0, 0, 0, 0.6)'); rect(0, 0, width, height);
  fill('#fff'); textSize(40); textAlign(CENTER);
  text("Game Over", width / 2, height / 2 - 40);
  textSize(20); text(`Pontuação final: ${typeof bossHits !== 'undefined' ? bossHits : score}`, width / 2, height / 2);
  text("Vidas restantes: 0", width / 2, height / 2 + 30);

  // Botão Reiniciar
  if (!window.restartBtn) {
    window.restartBtn = createButtonStyled('Reiniciar', (windowWidth - 200) / 2, windowHeight / 2 + 80, 200, 60, () => {
      window.restartBtn.hide();
      showStartScreen();
      // Resetar variáveis principais
      score = 0; bossHits = 0; lives = 3; oasisTimer = 0; gameOver = false;
      miniBubbles = []; oasisList = []; particles = []; bossBullets = []; boss = null;
      player.x = 150; player.y = GROUND_Y - 25; player.dy = 0; player.invincible = false;
      gameStarted = false;
    });
  } else {
    window.restartBtn.position((windowWidth - 200) / 2, windowHeight / 2 + 80).show();
  }
  noLoop();
}

function resetGame() {
  // score = 0; // Se quiser manter score acumulado, remova também
  // bossHits = 0; // Não zera mais bossHits ao passar de fase
  lives = 3; oasisTimer = 0; gameOver = false;
  miniBubbles = []; oasisList = []; particles = []; bossBullets = []; boss = null;
  player.x = 150; player.y = GROUND_Y - 25; player.dy = 0; player.invincible = false;
}