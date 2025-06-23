function createButtonStyled(text, x, y, w, h, onClick) {
  const btn = createButton(text).size(w, h).position(x, y)
    .style('font-size', `${h / 2.8}px`)
    .style('background', 'linear-gradient(90deg, #00c3ff 0%,#b71cff 100%)')
    .style('color', '#fff')
    .style('border', 'none')
    .style('border-radius', `${h / 2.5}px`)
    .style('box-shadow', '0 2px 8px rgba(0,0,0,0.15)')
    .style('font-weight', 'normal')
    .style('cursor', 'pointer')
    .style('padding', '0')
    .style('min-width', '0')
    .style('min-height', '0');
  btn.mousePressed(onClick);
  return btn;
}