(() => {
  'use strict';
  const API = 'https://samp-api.ct8.pl/server/5.42.217.107:9223';
  const $ = id => document.getElementById(id);
  const el = {
    state:$('liveState'), players:$('livePlayers'), capacity:$('liveCapacity'),
    mode:$('liveGamemode'), map:$('liveMap'), percent:$('livePercent'),
    bar:$('liveBar'), updated:$('liveUpdated'), list:$('livePlayerList'),
    count:$('livePlayerCount'), error:$('liveError'), copy:$('liveCopy')
  };
  if (!el.state) return;
  const setText=(node,value)=>{if(node)node.textContent=value;};
  function showState(kind,label){
    el.state.className='live-state '+kind;
    setText(el.state,label);
    const dot=document.createElement('i');el.state.prepend(dot);
  }
  function renderPlayers(list){
    el.list.replaceChildren();
    if(!Array.isArray(list)||!list.length){
      const p=document.createElement('p');p.className='live-empty';p.textContent='در حال حاضر بازیکنی آنلاین نیست.';
      el.list.append(p);return;
    }
    list.forEach(player=>{
      const row=document.createElement('div');row.className='live-player';
      const name=document.createElement('b');name.textContent=String(player.nickname??'Unknown');
      const info=document.createElement('span');info.textContent=`Score ${Number(player.score)||0} · Ping ${Number(player.ping)||0}`;
      row.append(name,info);el.list.append(row);
    });
  }
  async function refresh(){
    try{
      const response=await fetch(API,{cache:'no-store',headers:{'Accept':'application/json'}});
      if(!response.ok)throw new Error('پاسخ سرویس وضعیت سرور ناموفق بود ('+response.status+').');
      const data=await response.json();
      if(typeof data.online!=='boolean')throw new Error('پاسخ سرویس در قالب مورد انتظار نیست.');
      if(!data.online){
        showState('offline','SERVER OFFLINE');
        setText(el.players,'0');setText(el.capacity,String(data.maxplayers??'--'));
        setText(el.mode,'--');setText(el.map,'سرور در دسترس نیست');
        setText(el.percent,'0%');el.bar.style.width='0%';renderPlayers([]);
      }else{
        const current=Math.max(0,Number(data.players)||0),max=Math.max(0,Number(data.maxplayers)||0);
        const pct=max?Math.min(100,Math.round(current/max*100)):0;
        showState('online','SERVER ONLINE');
        setText(el.players,String(current));setText(el.capacity,max?String(max):'--');
        setText(el.mode,String(data.gamemode||'--'));setText(el.map,String(data.mapname||'San Andreas'));
        setText(el.percent,pct+'%');el.bar.style.width=pct+'%';
        renderPlayers(data.list);
      }
      setText(el.count,(Number(data.players)||0)+' نفر');
      setText(el.updated,'آخرین بروزرسانی: '+new Date().toLocaleTimeString('fa-IR'));
      el.error.hidden=true;
    }catch(err){
      showState('checking','وضعیت نامشخص');
      el.error.hidden=false;
      el.error.textContent='دریافت اطلاعات زنده ممکن نشد. ممکن است سرویس واسط موقتاً در دسترس نباشد یا مرورگر درخواست را مسدود کرده باشد. '+(err?.message||'');
      setText(el.updated,'تلاش مجدد خودکار تا ۳۰ ثانیه دیگر');
    }
  }
  el.copy?.addEventListener('click',async()=>{
    try{await navigator.clipboard.writeText('5.42.217.107:9223');el.copy.textContent='کپی شد';}
    catch{el.copy.textContent='کپی خودکار ممکن نیست';}
    setTimeout(()=>{el.copy.textContent='کپی IP';},1800);
  });
  refresh();
  setInterval(refresh,30000);
})();
