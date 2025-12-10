const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const W = canvas.width, H = canvas.height;

let scoreEl = document.getElementById("score");
let restartBtn = document.getElementById("restart");

// --- LOAD IMAGES --- //
const imgPlayer = new Image();
imgPlayer.src = "assets/player.png";

const imgObstacle = new Image();
imgObstacle.src = "assets/obstacle.png";

const imgBG = new Image();
imgBG.src = "assets/background.png";

// --- GAME STATE --- //
let player, obstacles, groundY, keys, running, lastTime, obstacleTimer, obstacleInterval;
let score = 0;
let touchActive = false;

function reset() {
  groundY = H - 40;

  player = {
    x: 80,
    y: groundY - 40,
    w: 40,
    h: 40,
    vy: 0,
    gravity: 1200,
    jumpPower: 420,
    onGround: true
  };

  obstacles = [];
  keys = {};
  running = true;
  score = 0;

  obstacleTimer = 0;
  obstacleInterval = 1500;
  lastTime = performance.now();
  restartBtn.hidden = true;
}

function spawnObstacle() {
  obstacles.push({
    x: W + 20,
    y: groundY - 40,
    w: 40,
    h: 40,
    speed: 250
  });
}

function update(dt) {
  // Player physics
  player.vy += player.gravity * dt;
  player.y += player.vy * dt;

  if (player.y + player.h >= groundY) {
    player.y = groundY - player.h;
    player.vy = 0;
    player.onGround = true;
  } else {
    player.onGround = false;
  }

  // Jumping
  if ((keys[" "] || keys["Space"] || keys["ArrowUp"] || touchActive) && player.onGround) {
    player.vy = -player.jumpPower;
  }

  // Obstacles
  obstacleTimer += dt * 1000;
  if (obstacleTimer > obstacleInterval) {
    obstacleTimer = 0;
    spawnObstacle();
    obstacleInterval = Math.max(700, obstacleInterval - 20);
  }

  // Move obstacles
  for (let i = obstacles.length - 1; i >= 0; i--) {
    let ob = obstacles[i];
    ob.x -= ob.speed * dt;

    if (ob.x + ob.w < 0) obstacles.splice(i, 1);

    // Collision
    if (rectsOverlap(player, ob)) {
      running = false;
      restartBtn.hidden = false;
    }
  }

  if (running) score += dt * 10;
  scoreEl.textContent = "Score: " + Math.floor(score);
}

function rectsOverlap(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

function draw() {
  // Background stretched to full screen
  ctx.drawImage(imgBG, 0, 0, W, H);

  // Player
  ctx.drawImage(imgPlayer, player.x, player.y, player.w, player.h);

  // Obstacles
  obstacles.forEach((ob) => {
    ctx.drawImage(imgObstacle, ob.x, ob.y, ob.w, ob.h);
  });

  // Tips
  ctx.fillStyle = "#033";
  ctx.font = "14px system-ui";
  ctx.fillText("Tap / Space to jump", W - 160, 20);
}

function loop(ms) {
  const dt = Math.min(0.05, (ms - lastTime) / 1000);
  lastTime = ms;

  if (running) update(dt);
  draw();

  requestAnimationFrame(loop);
}

// Input events
window.addEventListener("keydown", (e) => { keys[e.key] = true; });
window.addEventListener("keyup", (e) => { keys[e.key] = false; });

canvas.addEventListener("touchstart", (e) => {
  e.preventDefault();
  touchActive = true;
});
canvas.addEventListener("touchend", (e) => {
  e.preventDefault();
  touchActive = false;
});
canvas.addEventListener("mousedown", () => {
  touchActive = true;
  setTimeout(() => (touchActive = false), 150);
});

restartBtn.addEventListener("click", () => reset());

// Start game
reset();
requestAnimationFrame(loop);
