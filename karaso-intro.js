(()=>{'use strict';
// KARASO: new motion design — transform/opacity only; no canvas or particle loops.
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;

const ambient=document.createElement('div');ambient.className='kgx-world';ambient.setAttribute('aria-hidden','true');
ambient.innerHTML='<i class="kgx-shape kgx-shape-a"></i><i class="kgx-shape kgx-shape-b"></i><i class="kgx-shape kgx-shape-c"></i><i class="kgx-ribbon kgx-ribbon-a"></i><i class="kgx-ribbon kgx-ribbon-b"></i><i class="kgx-orb"></i><i class="kgx-fracture"></i>';
document.body.prepend(ambient);
if(true){
 const intro=document.createElement('div');intro.className='kgx-intro';
 intro.innerHTML='<div class="kgx-stage"><i class="kgx-intro-shape one"></i><i class="kgx-intro-shape two"></i><i class="kgx-intro-shape three"></i><i class="kgx-intro-cut"></i><i class="kgx-impact"></i><div class="kgx-mark">K</div><div class="kgx-kicker">ENTER THE WORLD</div><div class="kgx-title">KARASO</div><div class="kgx-sub">ROLEPLAY</div><div class="kgx-line">MAKE YOUR NAME. OWN THE NIGHT.</div><button class="kgx-skip" type="button">SKIP</button></div>';
 document.body.appendChild(intro);
 const end=()=>{if(intro.classList.contains('kgx-out'))return;intro.classList.add('kgx-out');setTimeout(()=>intro.remove(),600)};
 intro.querySelector('.kgx-skip').addEventListener('click',end,{once:true});setTimeout(end, reduce ? 1600 : 3900); if(reduce){intro.classList.add('kgx-static');}
}
})();
