// Remplace <REGION> et <PROJECT_ID> après déploiement
const API_BASE = 'https://pixelwar-worker.shoudin.workers.dev';

async function ensureNotIPBanned() {
  const res = await fetch(`${API_BASE}/ping`, { cache: 'no-store' });
  if (!res.ok) {
    let msg = 'Accès bloqué.';
    try { const j = await res.json(); if (j?.reason) msg = `Accès bloqué — ${j.reason}`; } catch {}
    document.body.innerHTML = `
      <div style="font-family:system-ui;padding:24px;max-width:600px;margin:auto">
        <h1>Accès bloqué</h1><p>${msg}</p>
      </div>`;
    throw new Error('IP banned');
  }
}


const W = 100, H = 100, PIX = 10; // taille de la grille et des pixels
const colors = [
  '#000000','#FFFFFF','#E91E63','#9C27B0','#3F51B5',
  '#03A9F4','#009688','#8BC34A','#FFEB3B','#FF9800'
];
let selected = 2; // couleur par défaut

const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');
const creditsEl = document.getElementById('credits');
const paletteEl = document.getElementById('palette');

let grid = JSON.parse(localStorage.getItem('grid') || 'null');
if (!grid) {
  grid = Array.from({length:H}, ()=>Array.from({length:W}, ()=>1)); // 1 = blanc
  saveGrid();
}

function saveGrid(){ localStorage.setItem('grid', JSON.stringify(grid)); }
function getCredits(){ return Number(localStorage.getItem('credits')||0); }
function setCredits(v){ localStorage.setItem('credits', String(v)); creditsEl.textContent = v; }
setCredits(getCredits());

// créer la palette
colors.forEach((c,i)=>{
  const sw = document.createElement('div');
  sw.className = 'sw'; sw.style.background = c;
  sw.onclick = ()=>{ selected = i; };
  paletteEl.appendChild(sw);
});

// dessiner la grille
function draw(){
  for (let y=0;y<H;y++){
    for (let x=0;x<W;x++){
      ctx.fillStyle = colors[grid[y][x]];
      ctx.fillRect(x*PIX, y*PIX, PIX, PIX);
    }
  }
}

// ⚠️ On vérifie l'IP AVANT d'afficher quoi que ce soit
(async () => {
  await ensureNotIPBanned(); // 403 → bloque la page
  draw();
})();

// placer un pixel
canvas.addEventListener('click', async (e) => {
  await ensureNotIPBanned(); // re-check au cas où l'IP serait bannie en cours de session
  const rect = canvas.getBoundingClientRect();
  const x = Math.floor((e.clientX - rect.left)/PIX);
  const y = Math.floor((e.clientY - rect.top)/PIX);
  if (x<0||x>=W||y<0||y>=H) return;
  const c = getCredits();
  if (c<=0) { alert('Pas assez de crédits. Scanne un QR pack.'); return; }
  grid[y][x] = selected; saveGrid(); setCredits(c-1); draw();
});


