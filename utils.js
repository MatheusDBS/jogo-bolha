
function createButtonStyled(text, x, y, w, h, onClick) {
  const btn = createButton(text).size(w, h).position(x, y)
    .style('font-size', `${h / 2.3}px`)
    .style('background', 'linear-gradient(90deg, #00c3ff 0%,#b71cff 100%)')
    .style('color', '#fff').style('border', 'none').style('border-radius', `${h / 2}px`)
    .style('box-shadow', '0 4px 16px rgba(0,0,0,0.2)')
    .style('font-weight', 'bold')
    .style('cursor', 'pointer');
  btn.mousePressed(onClick);
  return btn;
}