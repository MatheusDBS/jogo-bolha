let loreVideoPlayed = false;
let loreVideo;

function startLore() {
  if (!loreVideoPlayed) {
    const startLoreBtn = createButton('Assistir Introdução');
    startLoreBtn.size(200, 60);
    startLoreBtn.position((windowWidth - 200) / 2, (windowHeight - 60) / 2);
    startLoreBtn.style('font-size', '26px');
    startLoreBtn.style('background', 'linear-gradient(90deg, #00c3ff 0%,#b71cff 100%)');
    startLoreBtn.style('color', '#fff');
    startLoreBtn.style('border', 'none');
    startLoreBtn.style('border-radius', '30px');
    startLoreBtn.style('box-shadow', '0 4px 16px rgba(0,0,0,0.2)');
    startLoreBtn.style('font-weight', 'bold');
    startLoreBtn.style('cursor', 'pointer');
    startLoreBtn.style('top', '50%');
    
    startLoreBtn.mousePressed(() => {
      startLoreBtn.hide();
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
        loreVideo.onended(skipIntro);
      });
    });
    noLoop();
  } else {
    showStartScreen();
  }
}


function showStartScreen() {
  window.startBtn = createButtonStyled('Iniciar Jogo', (windowWidth - 200) / 2, (windowHeight - 60) / 2 + 60, 200, 60, () => {
    gameStarted = true;
    window.startBtn.hide();
    try { phaseAssets.batmanSound.play(); } catch (e) { console.warn("Erro ao reproduzir batmanSound:", e); }
    loop();
  });
  window.restartBtn = createButtonStyled('Reiniciar', (windowWidth - 200) / 2, (windowHeight + 40) / 2, 200, 60, () => {
    resetGame();
    window.restartBtn.hide();
    window.startBtn?.hide();
    loop();
  }).hide();
  redraw();
  noLoop();
}

function showGameOverScreen() {
  gameOver = true;
  if (phaseAssets.batmanSound?.isPlaying()) phaseAssets.batmanSound.stop();
  try { phaseAssets.fail.play(); } catch (e) { console.warn("Erro ao reproduzir fail sound:", e); }
  fill('rgba(0, 0, 0, 0.6)'); rect(0, 0, width, height);
  fill('#fff'); textSize(40); textAlign(CENTER);
  text("Game Over", width / 2, height / 2 - 40);
  textSize(20); text(`Pontuação final: ${score}`, width / 2, height / 2);
  text("Vidas restantes: 0", width / 2, height / 2 + 30);
  window.restartBtn?.position((windowWidth - 200) / 2, windowHeight / 2 + 60).show();
  noLoop();
}

function resetGame() {
  score = 0; lives = 3; oasisTimer = 0; gameOver = false;
  miniBubbles = []; oasisList = []; particles = []; bossBullets = []; boss = null;
  player.x = 150; player.y = GROUND_Y - 25; player.dy = 0; player.invincible = false;
}