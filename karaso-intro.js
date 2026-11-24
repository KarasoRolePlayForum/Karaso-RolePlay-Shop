(()=>{'use strict';
try {
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 const ambient=document.createElement('div'); ambient.className='karaso-chaos-bg'; ambient.setAttribute('aria-hidden','true');
 ambient.innerHTML='<i class="kc-ribbon kc-ribbon-a"></i><i class="kc-ribbon kc-ribbon-b"></i><i class="kc-ribbon kc-ribbon-c"></i><i class="kc-orb kc-orb-a"></i><i class="kc-orb kc-orb-b"></i><i class="kc-flash"></i>';
 document.body.prepend(ambient);
 if (!sessionStorage.getItem('karasoChaosIntroShown')) {
  sessionStorage.setItem('karasoChaosIntroShown','1');
  const intro=document.createElement('section'); intro.className='karaso-chaos-intro'; intro.setAttribute('aria-label','KARASO ROLEPLAY intro');
  intro.innerHTML='<div class="kc-intro-stage"><i class="kc-intro-tunnel"></i><i class="kc-intro-sweep"></i><i class="kc-intro-impact"></i><i class="kc-intro-ring"></i><div class="kc-intro-k">K</div><div class="kc-intro-welcome">ENTER THE CITY</div><div class="kc-intro-title">KARASO</div><div class="kc-intro-role">ROLEPLAY</div><button class="kc-intro-skip">SKIP</button></div>';
  document.body.appendChild(intro);
  const dismiss=()=>{intro.classList.add('kc-intro-out');window.setTimeout(()=>intro.remove(),650)};
  intro.querySelector('.kc-intro-skip').addEventListener('click',dismiss,{once:true});
  window.setTimeout(dismiss,4100);
 }
} catch(e) { /* fail gracefully: site content remains available */ }
})();
