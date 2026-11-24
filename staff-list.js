(()=>{
 const $=id=>document.getElementById(id),list=$('staffDirectory');
 if(!window.supabase){list.innerHTML='<div class="staff-loading">اتصال به پایگاه داده برقرار نشد.</div>';return}
 const sb=window.supabase.createClient(window.KARASO_SUPABASE_URL,window.KARASO_SUPABASE_PUBLISHABLE_KEY,window.KARASO_SUPABASE_AUTH_OPTIONS);
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 async function init(){
  const {data:{session}}=await sb.auth.getSession();
  if(session?.user){const {data:p}=await sb.from('profiles').select('role').eq('id',session.user.id).maybeSingle();if(p?.role==='owner')$('ownerStaffAdminLink').classList.remove('hidden')}
  const {data,error}=await sb.from('karaso_staff_members').select('id,display_name,rank_number,role_name,created_at').order('rank_number',{ascending:false}).order('created_at',{ascending:true});
  if(error){list.innerHTML='<div class="staff-loading">بارگیری لیست انجام نشد: '+esc(error.message)+'</div>';return}
  const rows=data||[];$('staffCount').textContent=rows.length.toLocaleString('fa-IR');
  list.innerHTML=rows.length?rows.map((r,i)=>`<article class="staff-member"><div class="staff-position">${String(i+1).padStart(2,'0')}</div><div class="staff-member-main"><strong>${esc(r.display_name)}</strong><span>${esc(r.role_name)}</span></div><div class="staff-rank"><small>RANK</small><b>${esc(r.rank_number)}</b></div></article>`).join(''):'<div class="staff-loading">هنوز عضوی به لیست اضافه نشده است.</div>';
 }
 init();
})();