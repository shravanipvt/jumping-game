const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const W = canvas.width, H = canvas.height;

let scoreEl = document.getElementById('score');
let restartBtn = document.getElementById('restart');

let player, obstacles, groundY, keys, running, lastTime, obstacleTimer, obstacleInterval;

function reset(){
  groundY = H - 40;
  player = {x:80, y:groundY - 40, w:30, h:40, vy:0, gravity:1200, jumpPower:420, onGround:true};
  obstacles = [];
  keys = {};
  running = true;
  score = 0;
  obstacleTimer = 0;
  obstacleInterval = 1500;
  lastTime = performance.now();
  restartBtn.hidden = true;
}

let score = 0;

function spawnObstacle(){
  const h = 20 + Math.random()*40;
  const w = 14 + Math.random()*30;
  obstacles.push({x:W + 20, y: groundY - h, w, h, speed: 220 + Math.random()*60});
}

function update(dt){
  player.vy += player.gravity * dt;
  player.y += player.vy * dt;
  if(player.y + player.h >= groundY){
    player.y = groundY - player.h;
    player.vy = 0;
    player.onGround = true;
  } else {
    player.onGround = false;
  }

  if((keys[' '] || keys['Space'] || keys['ArrowUp'] || touchActive) && player.onGround){
    player.vy = -player.jumpPower;
    player.onGround = false;
  }

  obstacleTimer += dt*1000;
  if(obstacleTimer > obstacleInterval){
    obstacleTimer = 0;
    spawnObstacle();
    obstacleInterval = Math.max(700, obstacleInterval - 20);
  }

  for(let i = obstacles.length -1; i >=0; i--){
    let ob = obstacles[i];
    ob.x -= ob.speed * dt;
    if(ob.x + ob.w < -50) obstacles.splice(i,1);

    if(rectsOverlap(player, ob)){
      running = false;
      restartBtn.hidden = false;
    }
  }

  if(running) score += dt * 10;
  scoreEl.textContent = 'Score: ' + Math.floor(score);
}

function rectsOverlap(a,b){
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function draw(){
  ctx.clearRect(0,0,W,H);

  ctx.fillStyle = '#88c';
  ctx.fillRect(0, groundY, W, H-groundY);

  ctx.fillStyle = '#0a3';
  ctx.fillRect(player.x, player.y, player.w, player.h);

  ctx.fillStyle = '#b33';
  obstacles.forEach(ob => ctx.fillRect(ob.x, ob.y, ob.w, ob.h));

  ctx.fillStyle = '#034';
  ctx.font = '14px system-ui';
  ctx.fillText('Use SPACE or tap', W - 150, 20);
}

let touchActive = false;

function loop(ms){
  const dt = Math.min(0.05, (ms - lastTime)/1000);
  lastTime = ms;
  if(running) update(dt);
  draw();
  requestAnimationFrame(loop);
}

window.addEventListener('keydown', e => { keys[e.key] = true; });
window.addEventListener('keyup', e => { keys[e.key] = false; });

canvas.addEventListener('touchstart', e => { e.preventDefault(); touchActive = true; });
canvas.addEventListener('touchend', e => { e.preventDefault(); touchActive = false; });
canvas.addEventListener('mousedown', e => { touchActive = true; setTimeout(()=> touchActive=false, 120); });

restartBtn.addEventListener('click', ()=>{ reset(); });

reset();
requestAnimationFrame(loop);
