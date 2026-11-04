const sb=window.supabase.createClient(window.KARASO_SUPABASE_URL,window.KARASO_SUPABASE_PUBLISHABLE_KEY,window.KARASO_SUPABASE_AUTH_OPTIONS||{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
const $=s=>document.querySelector(s);let currentUser=null,allOrders=[];
const labels={pending:'در انتظار بررسی',approved:'تأیید شده',rejected:'رد شده',completed:'تکمیل شده'};
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function showDashboard(user){currentUser=user;$('#loginView').classList.add('hidden');$('#dashboard').classList.remove('hidden');$('#logout').classList.remove('hidden');$('#who').textContent=`مدیر: ${user.email} — دسترسی Supabase`;loadOrders()}
async function loadOrders(){try{const {data,error}=await sb.from('orders').select('*').order('created_at',{ascending:false});if(error)throw error;allOrders=(data||[]).map(o=>({...o,orderNo:o.order_no,productName:o.product_name,gameUsername:o.game_username,createdAt:o.created_at,updatedAt:o.updated_at}));$('#total').textContent=allOrders.length;$('#pending').textContent=allOrders.filter(o=>o.status==='pending').length;$('#approved').textContent=allOrders.filter(o=>o.status==='approved').length;$('#done').textContent=allOrders.filter(o=>o.status==='completed').length;render()}catch(e){alert('خطا در دریافت سفارش‌ها: '+e.message)}}
function render(){const q=$('#search').value.trim().toLowerCase(),s=$('#statusFilter').value;const rows=allOrders.filter(o=>(s==='all'||o.status===s)&&[o.orderNo,o.product_name,o.gameUsername,o.contact,o.user_id].join(' ').toLowerCase().includes(q));$('#orders').innerHTML=rows.length?rows.map(o=>`<article class="order"><div class="order-head"><div><h3>${esc(o.product_name)} <span class="order-no">${esc(o.orderNo)}</span></h3><p>بازیکن: <b>${esc(o.gameUsername)}</b> · قیمت: ${Number(o.price).toLocaleString('en-US')} ${esc(o.unit)}</p><p>راه ارتباطی: ${esc(o.contact||'ثبت نشده')} · تاریخ: ${new Date(o.createdAt).toLocaleString('fa-IR')}</p>${o.note?`<p>توضیحات: ${esc(o.note)}</p>`:''}<p class="muted">شناسه کاربر: ${esc(o.user_id)}</p></div><span class="status ${o.status}">${labels[o.status]||o.status}</span></div><div class="order-actions"><button data-id="${o.id}" data-status="approved">تأیید سفارش</button><button data-id="${o.id}" data-status="rejected">رد سفارش</button><button data-id="${o.id}" data-status="completed">تکمیل سفارش</button><button data-id="${o.id}" data-status="pending">بازگردانی به انتظار</button></div></article>`).join(''):'<div class="empty">سفارشی مطابق فیلتر پیدا نشد.</div>';document.querySelectorAll('.order-actions button').forEach(b=>b.onclick=()=>changeStatus(b.dataset.id,b.dataset.status))}
async function changeStatus(id,status){try{const {error}=await sb.from('orders').update({status,updated_at:new Date().toISOString()}).eq('id',id);if(error)throw error;await loadOrders()}catch(e){alert('تغییر وضعیت انجام نشد: '+e.message)}}
async function verifyAdminAndShow(session){if(!session?.user){window.location.replace('./index.html?admin=login');return}try{const {data:profile,error}=await sb.from('profiles').select('role').eq('id',session.user.id).maybeSingle();if(error)throw error;if(!profile||!['owner','admin'].includes(profile.role)){await sb.auth.signOut();window.location.replace('./index.html');return}showDashboard(session.user)}catch(err){console.error(err);window.location.replace('./index.html')}}
$('#logout').onclick=async()=>{await sb.auth.signOut();window.location.replace('./index.html')};$('#refresh').onclick=loadOrders;$('#search').oninput=render;$('#statusFilter').onchange=render;
// Read the persisted Supabase session once on initial page load. Avoid redirect races
// between getSession() and the INITIAL_SESSION auth event.
sb.auth.getSession().then(({data,error})=>{
  if(error){console.error(error);window.location.replace('./index.html');return;}
  if(data.session) verifyAdminAndShow(data.session);
  else window.location.replace('./index.html');
});
// Do not sign the user out when leaving the admin page. Only react to an actual
// explicit sign-out from the store, and defer auth work outside the callback.
sb.auth.onAuthStateChange((event)=>{
  if(event==='SIGNED_OUT') window.location.replace('./index.html');
});
