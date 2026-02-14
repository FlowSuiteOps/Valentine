const arena = document.getElementById("arena");
const yesBtn = document.getElementById("yesBtn");
const noBtn = document.getElementById("noBtn");
const hint = document.getElementById("hint");

const overlay = document.getElementById("overlay");
const restartBtn = document.getElementById("restartBtn");

const fwCanvas = document.getElementById("fireworks");
const ctx = fwCanvas.getContext("2d");

let noAttempts = 0;
let yesScale = 1;

function clamp(n, min, max){ return Math.max(min, Math.min(max, n)); }

function resizeCanvas(){
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  fwCanvas.width = Math.floor(window.innerWidth * dpr);
  fwCanvas.height = Math.floor(window.innerHeight * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

/** Move No to a random spot INSIDE arena, away from the cursor */
function moveNoButtonAwayFrom(pointerX, pointerY) {
  const arenaRect = arena.getBoundingClientRect();
  const btnRect = noBtn.getBoundingClientRect();

  const pad = 12;
  const maxX = arenaRect.width - btnRect.width - pad;
  const maxY = arenaRect.height - btnRect.height - pad;

  // Try a few random positions and pick one far from pointer
  let best = { x: pad, y: pad, score: -Infinity };

  for (let i = 0; i < 12; i++) {
    const x = Math.random() * clamp(maxX, 0, maxX) + pad;
    const y = Math.random() * clamp(maxY, 0, maxY) + pad;

    const absX = arenaRect.left + x + btnRect.width/2;
    const absY = arenaRect.top + y + btnRect.height/2;

    const dx = absX - pointerX;
    const dy = absY - pointerY;
    const dist2 = dx*dx + dy*dy;

    if (dist2 > best.score) best = { x, y, score: dist2 };
  }

  noBtn.style.left = `${best.x}px`;
  noBtn.style.top  = `${best.y}px`;
  noBtn.style.transform = `translate(0,0)`;
}

function growYesButton() {
  noAttempts += 1;
  yesScale = clamp(1 + noAttempts * 0.18, 1, 3.2);
  yesBtn.style.transform = `translate(-120%, -50%) scale(${yesScale})`;

  const phrases = [
    "Hmm… interesting choice 😅",
    "Are you sure? 👀",
    "No is… unavailable today.",
    "Try again 😇",
    "The universe says YES 💘"
  ];
  hint.textContent = phrases[Math.floor(Math.random() * phrases.length)];
}

// Trigger dodge on mouse approach
noBtn.addEventListener("mouseenter", (e) => {
  moveNoButtonAwayFrom(e.clientX, e.clientY);
  growYesButton();
});

// Trigger dodge on touch attempt
noBtn.addEventListener("touchstart", (e) => {
  e.preventDefault(); // prevent it from “clicking” on mobile
  const t = e.touches[0];
  moveNoButtonAwayFrom(t.clientX, t.clientY);
  growYesButton();
}, { passive: false });

// If they somehow click No anyway
noBtn.addEventListener("click", (e) => {
  e.preventDefault();
  moveNoButtonAwayFrom(window.innerWidth/2, window.innerHeight/2);
  growYesButton();
});

// YES click -> overlay + fireworks
yesBtn.addEventListener("click", () => {
  overlay.classList.add("show");
  startFireworks();
});

// “Do it again” -> FULL reload
restartBtn.addEventListener("click", () => {
  window.location.reload();
});

/* ---------------- Fireworks (simple particle bursts) ---------------- */

let particles = [];
let fireworksRunning = false;
let rafId = null;

function rand(min, max){ return Math.random() * (max - min) + min; }

function burst(x, y) {
  const colors = ["#ff4d6d","#ffd166","#06d6a0","#4cc9f0","#b5179e","#f72585"];
  const count = 90;

  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2;
    const s = rand(2, 7);

    particles.push({
      x, y,
      vx: Math.cos(a) * s,
      vy: Math.sin(a) * s,
      life: rand(35, 70),
      color: colors[(Math.random() * colors.length) | 0],
      size: rand(2, 4)
    });
  }
}

function stepFireworks() {
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  // Fade trail
  ctx.fillStyle = "rgba(0,0,0,0.15)";
  ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

  particles = particles.filter(p => p.life > 0);

  for (const p of particles) {
    p.life -= 1;
    p.vx *= 0.985;
    p.vy *= 0.985;
    p.vy += 0.06; // gravity
    p.x += p.vx;
    p.y += p.vy;

    ctx.beginPath();
    ctx.fillStyle = p.color;
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }

  if (fireworksRunning) rafId = requestAnimationFrame(stepFireworks);
}

function startFireworks() {
  fwCanvas.classList.add("show");
  fireworksRunning = true;
  particles = [];

  // Pop a few bursts
  const w = window.innerWidth;
  const h = window.innerHeight;

  burst(w * 0.25, h * 0.35);
  burst(w * 0.75, h * 0.32);
  burst(w * 0.50, h * 0.25);

  // Keep bursting for a short time
  let burstsLeft = 6;
  const interval = setInterval(() => {
    burst(rand(w * 0.15, w * 0.85), rand(h * 0.15, h * 0.45));
    burstsLeft -= 1;
    if (burstsLeft <= 0) clearInterval(interval);
  }, 260);

  if (!rafId) stepFireworks();

  // Stop after ~4.5s
  setTimeout(() => {
    fireworksRunning = false;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
    fwCanvas.classList.remove("show");
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  }, 4500);
}
