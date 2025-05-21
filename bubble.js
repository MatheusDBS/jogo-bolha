// Este arquivo será usado para carregar a imagem da bolha
const bubbleImg = new Image();
bubbleImg.src = 'https://static.vecteezy.com/system/resources/thumbnails/020/951/520/small/realistic-transparent-3d-bubbles-underwater-soap-bubbles-vector-illustration-png.png';

// Função para desenhar a bolha usando a imagem
function drawPlayerBubble() {
  ctx.save();
  ctx.globalAlpha = 0.95;
  ctx.drawImage(bubbleImg, player.x - player.radius, player.y - player.radius, player.radius * 2, player.radius * 2);
  ctx.restore();
}
