const canvas=document.getElementById('game');
const ctx=canvas.getContext('2d');
let W=canvas.width,H=canvas.height;

let scoreEl=document.getElementById('score');
let restartBtn=document.getElementById('restart');

let player, obstacles, groundY, keys={}, running, lastTime, score=0;

function reset(){
  groundY = H - 40;
  player={x:80,y:groundY-40,w:40,h:40,vy:0,gravity:1200,jumpPower:420,onGround:true};
  obstacles=[];
  running=true;
  score=0;
  lastTime=performance.now();
  restartBtn.hidden=true;
}

function spawnObstacle(){
  obstacles.push({x:W+50,y:groundY-40,w:40,h:40,speed:260});
}

function rectsOverlap(a,b){
  const p=8;
  return(
    a.x+p < b.x+b.w-p &&
    a.x+a.w-p > b.x+p &&
    a.y+p < b.y+b.h-p &&
    a.y+a.h-p > b.y+p
  );
}

let obsTimer=0,obsInterval=1500;

function update(dt){
  player.vy+=player.gravity*dt;
  player.y+=player.vy*dt;
  if(player.y+player.h>=groundY){
    player.y=groundY-player.h;
    player.vy=0;
    player.onGround=true;
  } else player.onGround=false;

  if((keys[' ']||keys['Space']||keys['ArrowUp']) && player.onGround){
    player.vy=-player.jumpPower;
  }

  obsTimer+=dt*1000;
  if(obsTimer>obsInterval){
    obsTimer=0;
    spawnObstacle();
    obsInterval=Math.max(700,obsInterval-20);
  }

  for(let i=obstacles.length-1;i>=0;i--){
    let ob=obstacles[i];
    ob.x-=ob.speed*dt;
    if(ob.x+ob.w<0) obstacles.splice(i,1);

    if(rectsOverlap(player,ob)){
      running=false;
      restartBtn.hidden=false;
    }
  }

  if(running) score+=dt*10;
  scoreEl.textContent="Score: "+Math.floor(score);
}

function draw(){
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle="#c8d4f0";
  ctx.fillRect(0,groundY,W,H-groundY);

  ctx.fillStyle="#0a3";
  ctx.fillRect(player.x,player.y,player.w,player.h);

  ctx.fillStyle="#b33";
  obstacles.forEach(o=>{
    ctx.fillRect(o.x,o.y,o.w,o.h);
  });
}

function loop(t){
  let dt=Math.min(0.05,(t-lastTime)/1000);
  lastTime=t;
  if(running) update(dt);
  draw();
  requestAnimationFrame(loop);
}

window.addEventListener("keydown",e=>{
  keys[e.key]=true;
  if(!running && e.key==="Enter") reset();
});
window.addEventListener("keyup",e=>keys[e.key]=false);

restartBtn.addEventListener("click",()=>reset());

reset();
requestAnimationFrame(loop);
