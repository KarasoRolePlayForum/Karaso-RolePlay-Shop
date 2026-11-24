(()=>{
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 // Persistent animated gold atmosphere across every page using this shared script.
 const canvas=document.createElement('canvas'); canvas.className='karaso-ambient-canvas'; canvas.setAttribute('aria-hidden','true'); document.body.appendChild(canvas);
 const ctx=canvas.getContext('2d'); let w=0,h=0,dpr=1,stars=[];
 function resize(){dpr=Math.min(window.devicePixelRatio||1,1.5);w=innerWidth;h=innerHeight;canvas.width=w*dpr;canvas.height=h*dpr;canvas.style.width=w+'px';canvas.style.height=h+'px';ctx.setTransform(dpr,0,0,dpr,0,0);stars=Array.from({length:Math.min(95,Math.floor(w*h/9500))},()=>({x:Math.random()*w,y:Math.random()*h,r:.35+Math.random()*1.4,a:.15+Math.random()*.55,vy:.08+Math.random()*.32,vx:(Math.random()-.5)*.18,phase:Math.random()*6.28}));}
 resize();window.addEventListener('resize',resize,{passive:true});let frame=0;
 function ambient(){if(document.hidden){requestAnimationFrame(ambient);return}frame++;ctx.clearRect(0,0,w,h);const t=frame*.012;
 const glow=ctx.createRadialGradient(w*.5,h*.45,0,w*.5,h*.45,Math.max(w,h)*.75);glow.addColorStop(0,'rgba(169,119,28,.075)');glow.addColorStop(.5,'rgba(70,43,10,.035)');glow.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=glow;ctx.fillRect(0,0,w,h);
 for(const s of stars){s.y-=s.vy;s.x+=s.vx;if(s.y< -3)s.y=h+3;if(s.x<0)s.x=w;if(s.x>w)s.x=0;const tw=.65+.35*Math.sin(t+s.phase);ctx.beginPath();ctx.arc(s.x,s.y,s.r*tw,0,Math.PI*2);ctx.fillStyle=`rgba(221,178,83,${s.a*tw})`;ctx.fill();}
 requestAnimationFrame(ambient)} requestAnimationFrame(ambient);
 if(sessionStorage.getItem('karasoIntroSeen'))return;sessionStorage.setItem('karasoIntroSeen','1');
 const overlay=document.createElement('div');overlay.className='karaso-intro';overlay.innerHTML='<div class="ki-scene"><div class="ki-rays"></div><div class="ki-particles"></div><div class="ki-shock ki-shock-a"></div><div class="ki-shock ki-shock-b"></div><div class="ki-flash"></div><div class="ki-emblem">K</div><div class="ki-label">WELCOME TO</div><div class="ki-title">KARASO</div><div class="ki-subtitle">ROLEPLAY</div><div class="ki-tag">YOUR STORY BEGINS HERE</div><div class="ki-burst"></div></div><button class="ki-skip" type="button">SKIP INTRO</button>';
 document.body.appendChild(overlay);
 const burst=overlay.querySelector('.ki-burst');
 for(let i=0;i<64;i++){const p=document.createElement('i');const angle=(Math.PI*2*i/64)+(Math.random()-.5)*.14;const distance=90+Math.random()*260;p.style.setProperty('--bx',Math.cos(angle)*distance+'px');p.style.setProperty('--by',Math.sin(angle)*distance+'px');p.style.setProperty('--delay',(Math.random()*.18)+'s');p.style.setProperty('--size',(1+Math.random()*3.5)+'px');burst.appendChild(p)}
 const skip=()=>{if(overlay.classList.contains('ki-out'))return;overlay.classList.add('ki-out');setTimeout(()=>overlay.remove(),800)};
 overlay.querySelector('.ki-skip').addEventListener('click',skip);setTimeout(skip,reduced?1500:5700);
})();
