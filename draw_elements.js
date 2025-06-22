function drawBackground() {
  background('#012030');
  if (phaseAssets.moon instanceof p5.Image) {
    image(phaseAssets.moon, width - 130, 30, 100, 100);
  } else {
    console.warn("Imagem da lua inválida, usando fallback");
    fill('gray'); ellipse(width - 80, 80, 100);
  }
  fill('#e2b96f'); rect(0, height - 80, width, 80);
  fill('#f5d18c'); beginShape();
  vertex(0, height - 80); bezierVertex(width * 0.3, height - 120, width * 0.7, height - 40, width, height - 80);
  vertex(width, height); vertex(0, height); endShape(CLOSE);
  phases[currentPhase].platforms.forEach(plat => {
    if (phaseAssets.platform instanceof p5.Image) {
      image(phaseAssets.platform, plat.x, plat.y, plat.w, plat.h);
    } else {
      console.warn("Imagem da plataforma inválida, usando fallback");
      fill('brown'); rect(plat.x, plat.y, plat.w, plat.h);
    }
  });
}

function drawOasis({ x, y }) {
  push(); translate(x, y);
  if (phaseAssets.oasis instanceof p5.Image) {
    image(phaseAssets.oasis, -16, -16, 32, 32);
  } else {
    console.warn("Imagem do oasis inválida, usando fallback");
    fill('green'); ellipse(0, 0, 32);
  }
  pop();
}

let explosionActive = false, explosionFrame = 0, explosionX, explosionY;
function triggerExplosion(x, y) {
  explosionActive = true; explosionX = x; explosionY = y; explosionFrame = 0;
  try { phaseAssets.explosionSound.play(); } catch (e) { console.warn("Erro ao reproduzir explosionSound:", e); }
  for (let i = 0; i < 20; i++) particles.push({ x, y, dx: random(-5, 5), dy: random(-5, 5), radius: random(2, 5), alpha: 255 });
}

function drawExplosion() {
  if (!explosionActive) return;
  if (phaseAssets.explosion instanceof p5.Image) {
    let frameWidth = phaseAssets.explosion.width / 10, frameHeight = phaseAssets.explosion.height;
    image(phaseAssets.explosion, explosionX - (frameWidth * 3) / 2, explosionY - (frameHeight * 3) / 2, frameWidth * 3, frameHeight * 3,
          (explosionFrame = floor(frameCount / 5) % 10) * frameWidth, 0, frameWidth, frameHeight);
  } else {
    console.warn("Imagem da explosão inválida, usando fallback");
    fill('orange'); ellipse(explosionX, explosionY, 50);
  }
  particles = particles.filter(p => {
    p.x += p.dx; p.y += p.dy; p.alpha -= 10;
    fill(255, 100, 0, p.alpha); noStroke(); ellipse(p.x, p.y, p.radius * 2);
    return p.alpha > 0;
  });
  if (explosionFrame >= 9 && particles.length === 0) { explosionActive = false; showGameOverScreen(); }
}

function spawnOasis() {
  if (!gameOver) oasisList.push({ x: width + 80, y: random(60, height - 120), radius: 32 + random(12) });
}
