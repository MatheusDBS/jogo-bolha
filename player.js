const { width, height } = { width: 800, height: 500 };
const GRAVITY = 0.4, GROUND_Y = height - 80, PLAYER_SPEED = 5, JUMP_STRENGTH = -12;

const player = {
  x: 150, y: GROUND_Y - 25, radius: 25, dy: 0, dx: 0, onGround: true, invincible: false,
  update(platforms) {
    this.dx = leftPressed ? -PLAYER_SPEED : rightPressed ? PLAYER_SPEED : 0;
    this.x += this.dx;
    this.dy += GRAVITY;
    this.y += this.dy;
    let onAnyPlatform = false;
    for (let plat of platforms) {
      if (this.x + this.radius > plat.x && this.x - this.radius < plat.x + plat.w &&
          this.dy >= 0 && this.y + this.radius <= plat.y + 8 && this.y + this.radius + this.dy >= plat.y && !downPressed) {
        this.y = plat.y - this.radius;
        this.dy = 0;
        this.onGround = onAnyPlatform = true;
      }
    }
    if (this.y + this.radius > GROUND_Y) {
      this.y = GROUND_Y - this.radius;
      this.dy = 0;
      this.onGround = onAnyPlatform = true;
    }
    this.onGround = onAnyPlatform;
    this.x = constrain(this.x, this.radius, width - this.radius);
    this.y = constrain(this.y, this.radius, height - this.radius);
  },
  draw() {
    push();
    translate(this.x, this.y);
    rotate(sin(millis() / 300) / 10);
    scale(1 + sin(millis() / 500) * 0.03, 1 + cos(millis() / 500) * 0.03);
    const img = atirando ? phaseAssets.batBolhaAtirando : phaseAssets.batman;
    if (img instanceof p5.Image) {
      image(img, -this.radius * 1.3, -this.radius * 1.3, this.radius * 2.6, this.radius * 2.6);
    } else {
      console.warn("Imagem do jogador inválida, usando fallback");
      fill('red'); ellipse(0, 0, this.radius * 2); // Fallback visual
    }
    pop();
  },
  jump() { if (this.onGround) { this.dy = JUMP_STRENGTH; this.onGround = false; } }
};


function keyPressed() {
  if (key.toLowerCase() === 'a') leftPressed = true;
  if (key.toLowerCase() === 'd') rightPressed = true;
  if ((key.toLowerCase() === 'w' || keyCode === 32) && !gameOver) player.jump();
  if (key.toLowerCase() === 's') downPressed = true;
  if (key.toLowerCase() === 'b') batmanMode = !batmanMode;
}

function keyReleased() {
  if (key.toLowerCase() === 'a') leftPressed = false;
  if (key.toLowerCase() === 'd') rightPressed = false;
  if (key.toLowerCase() === 's') downPressed = false;
}

// Registra as funções globais para serem chamadas pelo main.js
window.playerKeyPressed = keyPressed;
window.playerKeyReleased = keyReleased;

let atirandoTimeout;
function mousePressed() {
  if (gameStarted && !gameOver && mouseButton === LEFT) {
    miniBubbles.push({ x: player.x + player.radius, y: player.y, radius: 10, speed: 10 });
    atirando = true; clearTimeout(atirandoTimeout); atirandoTimeout = setTimeout(() => atirando = false, 120);
  }
}