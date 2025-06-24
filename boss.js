let boss = null;
const bossConfig = {
  init(phase) {
    boss = { ...phases[phase].assets.boss, direction: 1, attackTimer: 0,
      attackMode: 'normal', burstCount: 0, burstShots: 0, specialMode: false, specialCharge: 0, specialActive: false, bomb: null, bombTarget: null };
  },
  update() {
    if (!boss) this.init(currentPhase);
    boss.y += boss.direction * boss.speed;
    if (boss.y < boss.radius || boss.y > height - boss.radius) boss.direction *= -1;
    boss.attackTimer++;
    if (!boss.specialMode && !boss.specialActive && boss.attackTimer % 60 === 0 && random() < 0.5) {
      boss.specialMode = true;
      boss.attackMode = 'special';
      boss.bombTarget = { x: player.x, y: player.y };
    }
    if (boss.attackMode === 'special') {
      boss.specialCharge++;
      if (boss.specialCharge >= 300 && !boss.specialActive) {
        let dist = Math.hypot(boss.bombTarget.x - boss.x, boss.bombTarget.y - boss.y);
        let steps = Math.max(40, Math.min(80, Math.floor(dist / 8)));
        boss.bomb = { x: boss.x - boss.radius, y: boss.y, radius: 32, dx: (boss.bombTarget.x - boss.x) / steps, dy: (boss.bombTarget.y - boss.y) / steps, active: true };
        boss.specialActive = true;
      }
      if (boss.bomb?.active) {
        boss.bomb.x += boss.bomb.dx;
        boss.bomb.y += boss.bomb.dy;
        if (Math.hypot(player.x - boss.bomb.x, player.y - boss.bomb.y) < player.radius + boss.bomb.radius) {
          lives = 0;
          triggerExplosion(player.x, player.y);
          boss.bomb.active = false;
          this.resetAttack();
        }
        if (boss.bomb.x < -boss.bomb.radius || boss.bomb.x > width + boss.bomb.radius || boss.bomb.y < -boss.bomb.radius || boss.bomb.y > height + boss.bomb.radius) {
          boss.bomb.active = false;
          this.resetAttack();
        }
      }
      if (boss.bomb && !boss.bomb.active && boss.specialActive) this.resetAttack();
    } else if (boss.attackMode === 'normal') {
      // Frequência de tiro depende da fase
      let shootInterval = 60;
      if (currentPhase === 'fase_1') shootInterval = 90; // Fácil: menos tiros
      if (currentPhase === 'fase_2') shootInterval = 60; // Médio: padrão
      if (currentPhase === 'fase_3') shootInterval = 35; // Difícil: mais tiros
      if (boss.attackTimer > shootInterval) {
        bossBullets.push({ x: boss.x - boss.radius, y: boss.y, radius: 24, speed: 7, dx: -7, dy: 0, type: 'normal' });
        try { phaseAssets.glock19.play(); } catch (e) { console.warn("Erro ao reproduzir glock19 sound:", e); }
        boss.attackTimer = 0;
        // Burst (rajada) depende da fase
        if (currentPhase === 'fase_2' && random() < 0.5) {
          boss.attackMode = 'burst';
          boss.burstCount = 0;
          boss.burstShots = floor(random(5, 8)); // Médio: rajada moderada
        } else if (currentPhase === 'fase_3' && random() < 0.7) {
          boss.attackMode = 'burst';
          boss.burstCount = 0;
          boss.burstShots = floor(random(10, 16)); // Difícil: rajada longa
        }
        // Fase 1 não faz burst
      }
    } else if (boss.attackMode === 'burst') {
      boss.speed = 5;
      if (boss.attackTimer > 10 && boss.burstCount < boss.burstShots) {
        bossBullets.push({ x: boss.x - boss.radius, y: boss.y, radius: 18, speed: 11, dx: -11, dy: 0, type: 'burst' });
        try { phaseAssets.glock19.play(); } catch (e) { console.warn("Erro ao reproduzir glock19 sound:", e); }
        boss.attackTimer = 0;
        boss.burstCount++;
      } else if (boss.burstCount >= boss.burstShots) {
        boss.attackMode = 'normal';
        boss.attackTimer = 0;
        boss.speed = phases[currentPhase].assets.boss.speed;
      }
    }
  },
  draw() {
    if (!boss) return;
    if (phaseAssets.boss instanceof p5.Image) {
      image(phaseAssets.boss, boss.x - boss.radius, boss.y - boss.radius, boss.radius * 2, boss.radius * 2);
    } else {
      console.warn("Imagem do boss inválida, usando fallback");
      fill('purple'); ellipse(boss.x, boss.y, boss.radius * 2);
    }
    fill('red'); rect(boss.x - 50, boss.y - boss.radius - 20, 100, 10);
    fill('lime'); rect(boss.x - 50, boss.y - boss.radius - 20, 100 * (boss.hp / phases[currentPhase].assets.boss.hp), 10);
    if (boss.attackMode === 'special') {
      push(); noFill(); stroke(255, 0, 0); strokeWeight(4);
      ellipse(boss.x, boss.y, boss.radius * 2 + 20 + sin(frameCount * 0.2) * 10);
      pop();
    }
    if (boss.bomb?.active) {
      if (phaseAssets.bomba instanceof p5.Image) {
        image(phaseAssets.bomba, boss.bomb.x - boss.bomb.radius, boss.bomb.y - boss.bomb.radius, boss.bomb.radius * 2, boss.bomb.radius * 2);
      } else {
        console.warn("Imagem da bomba inválida, usando fallback");
        fill('black'); ellipse(boss.bomb.x, boss.bomb.y, boss.bomb.radius * 2);
      }
    }
  },
  resetAttack() {
    boss.specialMode = boss.specialActive = false;
    boss.attackMode = 'normal';
    boss.attackTimer = 0;
  }
};
