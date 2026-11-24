(()=>{
'use strict';
const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
// Persistent gold atmosphere: drifting flecks, streaks, and periodic energy pulses.
const canvas=document.createElement('canvas'); canvas.className='karaso-ambient-canvas'; canvas.setAttribute('aria-hidden','true');
(document.body||document.documentElement).appendChild(canvas);
const ctx=canvas.getContext('2d',{alpha:true}); let w=0,h=0,dpr=1,particles=[],pulse=0,lastPulse=0;
function resize(){dpr=Math.min(window.devicePixelRatio||1,1.6);w=innerWidth;h=innerHeight;canvas.width=w*dpr;canvas.height=h*dpr;canvas.style.width=w+'px';canvas.style.height=h+'px';ctx.setTransform(dpr,0,0,dpr,0,0);particles=Array.from({length:Math.min(130,Math.max(48,Math.floor(w*h/6500)))},()=>({x:Math.random()*w,y:Math.random()*h,z:.4+Math.random()*1.5,r:.5+Math.random()*1.7,vx:(Math.random()-.5)*.24,vy:-.15-Math.random()*.48,trail:5+Math.random()*18,tw:Math.random()*6.28}));}
resize();window.addEventListener('resize',resize,{passive:true});
function frame(now){if(!document.hidden){ctx.clearRect(0,0,w,h);const g=ctx.createRadialGradient(w*.5,h*.52,0,w*.5,h*.52,Math.max(w,h)*.8);g.addColorStop(0,'rgba(214,164,55,.075)');g.addColorStop(.5,'rgba(122,78,17,.025)');g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
if(!reduce){for(const p of particles){p.x+=p.vx;p.y+=p.vy;if(p.y<-30){p.y=h+20;p.x=Math.random()*w}if(p.x<-20)p.x=w+10;if(p.x>w+20)p.x=-10;const shimmer=.35+.65*Math.sin(now*.001+p.tw);ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x-p.vx*p.trail*5,p.y-p.vy*p.trail);ctx.strokeStyle=`rgba(227,185,88,${.1+.38*shimmer})`;ctx.lineWidth=p.r;ctx.stroke();ctx.beginPath();ctx.arc(p.x,p.y,p.r*shimmer,0,Math.PI*2);ctx.fillStyle=`rgba(255,224,145,${.35+.5*shimmer})`;ctx.fill();}
if(now-lastPulse>7800){lastPulse=now;pulse=1}if(pulse>0){const progress=1-pulse;const radius=progress*Math.max(w,h)*.72;ctx.beginPath();ctx.arc(w*.5,h*.48,radius,0,Math.PI*2);ctx.strokeStyle=`rgba(218,168,66,${pulse*.24})`;ctx.lineWidth=2+8*pulse;ctx.stroke();pulse-=.018;}
}}
requestAnimationFrame(frame)}requestAnimationFrame(frame);
// Show the branded impact intro once per browser session. Reloading a new page won't replay it.
if(reduce||sessionStorage.getItem('karasoIntroSeen'))return;sessionStorage.setItem('karasoIntroSeen','1');
const overlay=document.createElement('div');overlay.className='karaso-intro';overlay.innerHTML=`<div class="ki-backdrop"><div class="ki-radial"></div><div class="ki-ring ki-ring1"></div><div class="ki-ring ki-ring2"></div><div class="ki-ring ki-ring3"></div><div class="ki-streaks"></div><div class="ki-sparks"></div><div class="ki-logo">K</div><div class="ki-overline">WELCOME TO THE CITY</div><div class="ki-name">KARASO</div><div class="ki-role">ROLEPLAY</div><div class="ki-motto">MAKE YOUR NAME. OWN THE NIGHT.</div><div class="ki-impact"></div></div><button class="ki-skip" type="button">SKIP INTRO</button>`;
document.body.appendChild(overlay);
const sparks=overlay.querySelector('.ki-sparks');for(let i=0;i<100;i++){const el=document.createElement('i');const a=Math.PI*2*i/100+(Math.random()-.5)*.12;const d=110+Math.random()*Math.max(w,h)*.48;el.style.setProperty('--sx',Math.cos(a)*d+'px');el.style.setProperty('--sy',Math.sin(a)*d+'px');el.style.setProperty('--delay',Math.random()*.25+'s');el.style.setProperty('--spark-size',1+Math.random()*4+'px');sparks.appendChild(el)}
const close=()=>{if(overlay.classList.contains('ki-closing'))return;overlay.classList.add('ki-closing');setTimeout(()=>overlay.remove(),950)};overlay.querySelector('.ki-skip').addEventListener('click',close);setTimeout(close,6500);
})();
