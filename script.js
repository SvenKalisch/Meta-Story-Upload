// Web App: 1080x1920 canvas with draggable background (cover fit), text overlay, color switch, filename input
const upload = document.getElementById('upload');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const colorFieldset = document.getElementById('colorFieldset');
const downloadBtn = document.getElementById('downloadBtn');
const filenameInput = document.getElementById('filename');

// Constants
const CANVAS_W = 1080;
const CANVAS_H = 1920;
const TEXT = '- Anzeige -';
const BOX_W = 170;
const BOX_H = 40;
const TEXT_X = 60;
const TEXT_Y = 60;

let bgImg = null;
let bgScale = 1;
let bgOffsetX = 0;
let bgOffsetY = 0;

let isDragging = false;
let dragStartX = 0, dragStartY = 0;
let dragStartOffsetX = 0, dragStartOffsetY = 0;

function selectedColor(){
  const el = colorFieldset.querySelector('input[name="color"]:checked');
  return el ? el.value : 'white';
}
function ensureJpg(name){
  name = (name || '').trim();
  if (!name) return 'bild_mit_anzeige.jpg';
  if (!/\.jpe?g$/i.test(name)) name += '.jpg';
  return name;
}
function computeFontSizeToFit(text, fontFamily, maxWidth, maxHeight) {
  let size = 100;
  for (let i = 0; i < 12; i++) {
    ctx.font = `bold ${size}px ${fontFamily}`;
    const m = ctx.measureText(text);
    const w = m.width;
    const h = (m.actualBoundingBoxAscent || size*0.8) + (m.actualBoundingBoxDescent || size*0.2);
    const scale = Math.min(maxWidth / w, maxHeight / h);
    const newSize = Math.max(1, Math.floor(size * scale));
    if (Math.abs(newSize - size) < 1) return newSize;
    size = newSize;
  }
  return Math.max(1, Math.floor(size));
}
function computeInitialPlacement(image) {
  const iw = image.naturalWidth;
  const ih = image.naturalHeight;
  const s = Math.max(CANVAS_W / iw, CANVAS_H / ih);
  const dw = iw * s;
  const dh = ih * s;
  bgScale = s;
  bgOffsetX = (CANVAS_W - dw) / 2;
  bgOffsetY = (CANVAS_H - dh) / 2;
}
function clampBgOffsets() {
  const iw = bgImg.naturalWidth * bgScale;
  const ih = bgImg.naturalHeight * bgScale;
  const minX = Math.min(0, CANVAS_W - iw);
  const minY = Math.min(0, CANVAS_H - ih);
  const maxX = Math.max(0, CANVAS_W - iw);
  const maxY = Math.max(0, CANVAS_H - ih);
  bgOffsetX = Math.min(Math.max(bgOffsetX, minX), maxX);
  bgOffsetY = Math.min(Math.max(bgOffsetY, minY), maxY);
}
function getPos(e) {
  const rect = canvas.getBoundingClientRect();
  if (e.touches && e.touches[0]) {
    return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
  }
  return { x: e.clientX - rect.left, y: e.clientY - rect.top };
}
function scaleX() { return CANVAS_W / canvas.clientWidth; }
function scaleY() { return CANVAS_H / canvas.clientHeight; }

function render() {
  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
  if (bgImg) {
    const dw = bgImg.naturalWidth * bgScale;
    const dh = bgImg.naturalHeight * bgScale;
    ctx.drawImage(bgImg, bgOffsetX, bgOffsetY, dw, dh);
  } else {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  }
  const color = selectedColor();
  const fontFamily = 'Arial, Helvetica, sans-serif';
  const fontSize = computeFontSizeToFit(TEXT, fontFamily, BOX_W, BOX_H);
  ctx.font = `bold ${fontSize}px ${fontFamily}`;
  ctx.textBaseline = 'top';
  ctx.fillStyle = color;
  ctx.fillText(TEXT, TEXT_X, TEXT_Y);
}

function init() {
  render();

  // Dragging
  canvas.addEventListener('mousedown', (e) => {
    if (!bgImg) return;
    isDragging = true;
    const p = getPos(e);
    dragStartX = p.x; dragStartY = p.y;
    dragStartOffsetX = bgOffsetX; dragStartOffsetY = bgOffsetY;
  });
  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const p = getPos(e);
    const dx = (p.x - dragStartX) * scaleX();
    const dy = (p.y - dragStartY) * scaleY();
    bgOffsetX = dragStartOffsetX + dx;
    bgOffsetY = dragStartOffsetY + dy;
    clampBgOffsets();
    render();
  });
  window.addEventListener('mouseup', () => { isDragging = false; });

  canvas.addEventListener('touchstart', (e) => {
    if (!bgImg) return;
    isDragging = true;
    const p = getPos(e);
    dragStartX = p.x; dragStartY = p.y;
    dragStartOffsetX = bgOffsetX; dragStartOffsetY = bgOffsetY;
  }, { passive: true });
  window.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    const p = getPos(e);
    const dx = (p.x - dragStartX) * scaleX();
    const dy = (p.y - dragStartY) * scaleY();
    bgOffsetX = dragStartOffsetX + dx;
    bgOffsetY = dragStartOffsetY + dy;
    clampBgOffsets();
    render();
  }, { passive: true });
  window.addEventListener('touchend', () => { isDragging = false; });

  // Upload
  upload.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!/^image\/(jpeg|jpg)$/.test(file.type) && !/\.(jpe?g)$/i.test(file.name)) {
      alert('Bitte eine JPG/JPEG-Datei hochladen.');
      return;
    }
    const image = new Image();
    image.onload = () => {
      bgImg = image;
      computeInitialPlacement(bgImg);
      clampBgOffsets();
      colorFieldset.disabled = false;
      filenameInput.disabled = false;
      if (!filenameInput.value) filenameInput.value = 'bild_mit_anzeige.jpg';
      downloadBtn.disabled = false;
      URL.revokeObjectURL(image.src);
      render();
    };
    image.onerror = () => alert('Konnte die Vorlage nicht laden.');
    image.src = URL.createObjectURL(file);
  });

  colorFieldset.addEventListener('change', () => render());

  downloadBtn.addEventListener('click', () => {
    const a = document.createElement('a');
    a.download = ensureJpg(filenameInput.value);
    a.href = canvas.toDataURL('image/jpeg', 0.92);
    a.click();
  });
}

init();
