const arena = document.getElementById("arena");
const yesBtn = document.getElementById("yesBtn");
const noBtn = document.getElementById("noBtn");
const hint = document.getElementById("hint");

const overlay = document.getElementById("overlay");
const restartBtn = document.getElementById("restartBtn");

let noAttempts = 0;
let yesScale = 1;

// Helpers
function clamp(n, min, max){ return Math.max(min, Math.min(max, n)); }

function moveNoButton() {
  const arenaRect = arena.getBoundingClientRect();
  const btnRect = noBtn.getBoundingClientRect();

  // Keep within arena bounds with padding
  const pad = 12;
  const maxX = arenaRect.width - btnRect.width - pad;
  const maxY = arenaRect.height - btnRect.height - pad;

  const x = Math.random() * clamp(maxX, 0, maxX) + pad;
  const y = Math.random() * clamp(maxY, 0, maxY) + pad;

  // Set absolute position inside arena
  noBtn.style.left = `${x}px`;
  noBtn.style.top  = `${y}px`;
  noBtn.style.transform = `translate(0,0)`;
}

function growYesButton() {
  noAttempts += 1;
  yesScale = 1 + noAttempts * 0.18;     // growth rate
  yesScale = clamp(yesScale, 1, 3.2);   // cap so it doesn't get ridiculous

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

// Make "No" dodge both mouse and touch
noBtn.addEventListener("mouseenter", () => {
  moveNoButton();
  growYesButton();
});

noBtn.addEventListener("touchstart", (e) => {
  e.preventDefault(); // stop tap from “clicking” it
  moveNoButton();
  growYesButton();
}, { passive: false });

// If they somehow click No anyway
noBtn.addEventListener("click", (e) => {
  e.preventDefault();
  moveNoButton();
  growYesButton();
});

// YES click
yesBtn.addEventListener("click", () => {
  overlay.classList.add("show");
  launchConfetti(140);
});

// Restart
restartBtn.addEventListener("click", () => {
  overlay.classList.remove("show");
  noAttempts = 0;
  yesScale = 1;
  hint.textContent = "Try picking one… 😇";

  // reset positions
  yesBtn.style.transform = `translate(-120%, -50%) scale(1)`;
  noBtn.style.left = "50%";
  noBtn.style.top = "50%";
  noBtn.style.transform = "translate(20%, -50%)";
});

// Quick & tiny “confetti” without libraries
function launchConfetti(count = 120){
  const colors = ["#ff4d6d","#ffd166","#06d6a0","#4cc9f0","#b5179e","#f72585"];
  for(let i=0;i<count;i++){
    const piece = document.createElement("div");
    piece.style.position = "fixed";
    piece.style.left = Math.random()*100 + "vw";
    piece.style.top  = "-10px";
    piece.style.width = "10px";
    piece.style.height = "14px";
    piece.style.borderRadius = "3px";
    piece.style.background = colors[Math.floor(Math.random()*colors.length)];
    piece.style.opacity = "0.95";
    piece.style.transform = `rotate(${Math.random()*360}deg)`;
    piece.style.zIndex = 9999;

    document.body.appendChild(piece);

    const fall = 700 + Math.random()*900;
    const drift = (Math.random() - 0.5) * 220;

    piece.animate([
      { transform: piece.style.transform, top: "-10px", left: piece.style.left },
      { transform: `rotate(${Math.random()*720}deg)`, top: "110vh", left: `calc(${piece.style.left} + ${drift}px)` }
    ], {
      duration: fall,
      easing: "cubic-bezier(.2,.7,.2,1)"
    });

    setTimeout(() => piece.remove(), fall);
  }
}
