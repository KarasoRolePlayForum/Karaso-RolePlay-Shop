(()=>{'use strict';
// Performance-first cinematic gold intro. No canvas, no particle loop, no animated blur.
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const seen=sessionStorage.getItem('karasoIntroSeen');
const ambient=document.createElement('div');
ambient.className='karaso-gold-ambient';
ambient.setAttribute('aria-hidden','true');
ambient.innerHTML='<i class="kga-wave kga-wave1"></i><i class="kga-wave kga-wave2"></i><i class="kga-glow"></i>';
document.body.prepend(ambient);
if(!reduced&&!seen){
 sessionStorage.setItem('karasoIntroSeen','1');
 const overlay=document.createElement('div');overlay.className='karaso-intro';
 overlay.innerHTML='<div class="ki-backdrop"><div class="ki-aurora"></div><div class="ki-rays"></div><div class="ki-grid"></div><div class="ki-sparkfield"></div><div class="ki-impact-core"></div><i class="ki-ring ki-ring-a"></i><i class="ki-ring ki-ring-b"></i><i class="ki-ring ki-ring-c"></i><div class="ki-logo">K</div><div class="ki-overline">WELCOME TO</div><div class="ki-name">KARASO</div><div class="ki-role">ROLEPLAY</div><div class="ki-motto">MAKE YOUR NAME. OWN THE NIGHT.</div><button class="ki-skip" type="button">SKIP INTRO</button></div>';
 document.body.appendChild(overlay);
 const close=()=>{if(overlay.classList.contains('ki-closing'))return;overlay.classList.add('ki-closing');setTimeout(()=>overlay.remove(),500)};
 overlay.querySelector('.ki-skip').addEventListener('click',close,{once:true});
 setTimeout(close,2650);
}
})();
