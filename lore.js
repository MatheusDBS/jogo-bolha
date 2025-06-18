// Variáveis globais para controle da lore
let loreVideoPlayed = false;
let loreVideo;

// Função para iniciar a lore
function startLore() {
  if (!loreVideoPlayed) {
    loreVideo = createVideo('./assets/videos/lorebolha.mp4', () => {
      // Configura vídeo e botão de pular
      loreVideo.size(640, 360);
      loreVideo.position((windowWidth - 640) / 2, (windowHeight - 360) / 2);
      loreVideo.show();
      loreVideo.volume(1);
      loreVideo.play();
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
        showStartScreen(); // Chama a função do fase_1.js
      }
      skipBtn.mousePressed(skipIntro);
      loreVideo.onended(skipIntro);
    });
    noLoop();
  } else {
    showStartScreen(); // Chama a função do fase_1.js
  }
}