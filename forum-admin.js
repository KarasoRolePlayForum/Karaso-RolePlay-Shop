const fsb=window.supabase.createClient(window.KARASO_SUPABASE_URL,window.KARASO_SUPABASE_PUBLISHABLE_KEY,window.KARASO_SUPABASE_AUTH_OPTIONS);
const f$=s=>document.querySelector(s);let fRole='customer',fTopics=[];
const fesc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
f$('#backForum').onclick=()=>location.href='./community.html';
async function bootForumAdmin(){const {data:{session}}=await fsb.auth.getSession();if(!session?.user){location.replace('./index.html?auth=login');return}
 const {data:profile,error}=await fsb.from('profiles').select('role').eq('id',session.user.id).maybeSingle();
 if(error||!profile||!['owner','admin'].includes(profile.role)){location.replace('./community.html');return}
 fRole=profile.role;f$('#forumAdminWho').textContent=fRole==='owner'?'دسترسی Owner':'دسترسی مدیر انجمن';
 f$('#forumAdminLoading').classList.add('hidden');f$('#forumAdmin').classList.remove('hidden');
 await loadForumTopics();
 if(fRole==='owner'){f$('#ownerTicketsSection').classList.remove('hidden');await loadOwnerTickets();}
}
async function loadForumTopics(){f$('#faError').textContent='';const {data,error}=await fsb.from('forum_topics').select('id,title,body,category,is_locked,created_at,created_by').order('created_at',{ascending:false});
 if(error){f$('#faError').textContent='دریافت موضوعات ناموفق بود: '+error.message;return}
 fTopics=data||[];f$('#faTotal').textContent=fTopics.length;f$('#faOpen').textContent=fTopics.filter(x=>!x.is_locked).length;f$('#faLocked').textContent=fTopics.filter(x=>x.is_locked).length;renderForumTopics();
}
function renderForumTopics(){const q=f$('#faSearch').value.trim().toLowerCase(),filter=f$('#faFilter').value;const rows=fTopics.filter(t=>(!q||t.title.toLowerCase().includes(q))&&(filter==='all'||(filter==='locked'?t.is_locked:!t.is_locked)));
 f$('#faTopics').innerHTML=rows.length?rows.map(t=>`<article class="order"><div class="order-head"><div><h3>${fesc(t.title)}</h3><p>${fesc(t.body).slice(0,260)}</p><p>دسته: ${fesc(t.category)} · ${new Date(t.created_at).toLocaleString('fa-IR')}</p><div class="fa-replies" id="replies-${t.id}">در حال دریافت پیام‌ها…</div></div><span class="status ${t.is_locked?'rejected':'approved'}">${t.is_locked?'بسته':'باز'}</span></div><div class="order-actions">${fRole==='owner'?`<button data-lock="${t.id}">${t.is_locked?'بازکردن موضوع':'قفل کردن موضوع'}</button><button data-delete="${t.id}">حذف موضوع</button>`:'<span>برای تغییر وضعیت موضوع دسترسی Owner لازم است.</span>'}</div></article>`).join(''):'<div class="empty">موضوعی پیدا نشد.</div>';
 rows.forEach(t=>loadReplies(t.id));document.querySelectorAll('[data-lock]').forEach(b=>b.onclick=()=>setLock(b.dataset.lock));document.querySelectorAll('[data-delete]').forEach(b=>b.onclick=()=>deleteTopic(b.dataset.delete));
}
async function loadReplies(topicId){const el=document.getElementById('replies-'+topicId);if(!el)return;const {data,error}=await fsb.from('forum_posts').select('id,body,created_at,author_name,author_role').eq('topic_id',topicId).order('created_at',{ascending:false});if(error){el.textContent='پیام‌ها قابل دریافت نیستند';return}el.innerHTML=(data||[]).map(p=>`<div class="fa-reply"><span>${fesc(p.author_name||'بازیکن')} · ${fesc(p.author_role||'عضو عادی')}</span><p>${fesc(p.body).slice(0,180)}</p><button data-del-reply="${p.id}">حذف پیام</button></div>`).join('')||'<small>هنوز پاسخی ندارد.</small>';el.querySelectorAll('[data-del-reply]').forEach(b=>b.onclick=async()=>{if(!confirm('پیام حذف شود؟'))return;const {error}=await fsb.from('forum_posts').delete().eq('id',b.dataset.delReply);if(error)f$('#faError').textContent=error.message;else loadReplies(topicId)})}
async function setLock(id){const t=fTopics.find(x=>x.id===id);if(!t)return;const {error}=await fsb.from('forum_topics').update({is_locked:!t.is_locked}).eq('id',id);if(error){f$('#faError').textContent='تغییر وضعیت انجام نشد: '+error.message;return}await loadForumTopics()}
async function deleteTopic(id){if(!confirm('این موضوع و اطلاعات وابسته به آن حذف شود؟'))return;const {error}=await fsb.from('forum_topics').delete().eq('id',id);if(error){f$('#faError').textContent='حذف انجام نشد: '+error.message;return}await loadForumTopics()}
f$('#forumRefresh').onclick=async()=>{await loadForumTopics();if(fRole==='owner')await loadOwnerTickets()};f$('#faSearch').oninput=renderForumTopics;f$('#faFilter').onchange=renderForumTopics;bootForumAdmin();


// Private support tickets: only Owner UI is rendered here. Database RLS is the real security boundary.
async function loadOwnerTickets(){
 if(fRole!=='owner')return;
 f$('#ticketAdminError').textContent='';
 const {data,error}=await fsb.from('support_tickets').select('id,user_id,subject,message,status,owner_reply,created_at,replied_at').order('created_at',{ascending:false});
 if(error){f$('#ownerTickets').innerHTML='<div class="empty">دریافت تیکت‌ها ناموفق بود.</div>';f$('#ticketAdminError').textContent='خطا: '+error.message;return}
 const rows=data||[];
 if(!rows.length){f$('#ownerTickets').innerHTML='<div class="empty">هنوز تیکتی ثبت نشده است.</div>';return}
 f$('#ownerTickets').innerHTML=rows.map(t=>`<article class="order owner-ticket"><div class="order-head"><div><h3>${fesc(t.subject)}</h3><p>${fesc(t.message)}</p><p class="muted">کاربر: ${fesc(t.user_id)} · ${new Date(t.created_at).toLocaleString('fa-IR')}</p>${t.owner_reply?`<div class="ticket-owner-reply"><b>پاسخ فعلی Owner</b><p>${fesc(t.owner_reply)}</p></div>`:''}</div><span class="status ${t.status==='answered'?'approved':t.status==='closed'?'rejected':'pending'}">${t.status==='answered'?'پاسخ داده‌شده':t.status==='closed'?'بسته':'در انتظار پاسخ'}</span></div><form class="owner-ticket-reply-form" data-ticket-form="${t.id}"><label>پاسخ خصوصی به همین کاربر<textarea name="owner_reply" rows="3" maxlength="3000" required placeholder="پاسخ را بنویس…">${fesc(t.owner_reply||'')}</textarea></label><div class="order-actions"><button type="submit">ارسال پاسخ خصوصی</button><button type="button" data-ticket-status="${t.id}" data-status="${t.status==='closed'?'open':'closed'}">${t.status==='closed'?'بازگشایی تیکت':'بستن تیکت'}</button></div></form></article>`).join('');
 f$('#ownerTickets').querySelectorAll('[data-ticket-form]').forEach(form=>form.onsubmit=async e=>{e.preventDefault();if(fRole!=='owner')return;const ticketId=form.dataset.ticketForm;const reply=String(new FormData(form).get('owner_reply')||'').trim();if(!reply)return;const {data:{session}}=await fsb.auth.getSession();const {error}=await fsb.from('support_tickets').update({owner_reply:reply,status:'answered',replied_by:session.user.id,replied_at:new Date().toISOString(),updated_at:new Date().toISOString()}).eq('id',ticketId);if(error){f$('#ticketAdminError').textContent='ارسال پاسخ انجام نشد: '+error.message;return}await loadOwnerTickets()});
 f$('#ownerTickets').querySelectorAll('[data-ticket-status]').forEach(btn=>btn.onclick=async()=>{if(fRole!=='owner')return;const {error}=await fsb.from('support_tickets').update({status:btn.dataset.status,updated_at:new Date().toISOString()}).eq('id',btn.dataset.ticketStatus);if(error){f$('#ticketAdminError').textContent='تغییر وضعیت انجام نشد: '+error.message;return}await loadOwnerTickets()});
}
f$('#ticketRefresh')?.addEventListener('click',loadOwnerTickets);
