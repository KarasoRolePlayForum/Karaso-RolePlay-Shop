const sb=window.supabase.createClient(window.KARASO_SUPABASE_URL,window.KARASO_SUPABASE_PUBLISHABLE_KEY,window.KARASO_SUPABASE_AUTH_OPTIONS);
const $=s=>document.querySelector(s);let session=null,role='customer',category='all',activeTopic=null,authMode='login';
const categories=[['all','همه موضوعات'],['announcements','اطلاعیه‌ها و اخبار'],['rules','قوانین و آموزش‌ها'],['admin_apps','درخواست مدیریت'],['helper_apps','درخواست هلپر'],['leader_apps','درخواست لیدری'],['factions','سازمان‌ها و فکشن‌ها'],['gangs','گنگ‌ها'],['resignations','درخواست استعفا'],['reports','گزارش کار'],['complaints','شکایات']];
const roleLabel=r=>r==='owner'?'Owner':r==='admin'?'مدیر':'عضو عادی';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function renderCategories(){
 const box=$('#categoryGrid'); if(!box)return;
 const groups=[
  {title:'انجمن و ارتباط با مدیریت',ids:['announcements','rules','admin_apps','helper_apps']},
  {title:'سازمان‌ها و فکشن‌ها',ids:['factions','leader_apps','resignations','reports']},
  {title:'جامعه بازیکنان و گنگ‌ها',ids:['gangs','complaints']}
 ];
 box.innerHTML=groups.map(g=>{
  const cards=g.ids.map(id=>categories.find(c=>c[0]===id)).filter(Boolean);
  return `<div class="kr-category-group"><h3 class="kr-group-title">${g.title}</h3><div class="kr-category-grid">${cards.map(([id,name])=>`<article class="kr-category-card" data-cat="${id}"><div class="kr-cat-head"><h3>${esc(name)}</h3><span class="kr-cat-icon">▤</span></div><div class="kr-cat-counts"><span id="count-${id}">۰ موضوع</span><span id="posts-${id}">۰ پیام</span></div><div class="kr-last" id="last-${id}">برای مشاهده موضوعات این بخش کلیک کنید</div></article>`).join('')}</div></div>`;
 }).join('');
 document.querySelectorAll('.kr-category-card[data-cat]').forEach(el=>el.onclick=()=>selectCategory(el.dataset.cat));
 document.querySelectorAll('[data-jump-cat]').forEach(el=>el.onclick=()=>selectCategory(el.dataset.jumpCat));
}
function selectCategory(id){
 document.body.classList.remove('kr-topic-focus');category=id;activeTopic=null;
 $('#categoryGrid').classList.add('hidden');$('#topicDetail').classList.add('hidden');$('#topicList').classList.remove('hidden');
 $('#currentCategoryTitle').textContent=categories.find(x=>x[0]===id)?.[1]||'موضوعات';
 loadTopics();
}
async function refreshSession(s){session=s;role='customer';if(s?.user){const {data}=await sb.from('profiles').select('role').eq('id',s.user.id).maybeSingle();role=data?.role||'customer'}$('#communityAuthState').textContent=s?.user?'وارد حساب هستید':'برای مشارکت وارد حساب شو';$('#communityLogin').classList.toggle('hidden',!!s?.user);$('#communityLogout').classList.toggle('hidden',!s?.user);$('#ownerPanelLink').classList.toggle('hidden',!['owner','admin'].includes(role));$('#newTopicBtn').classList.toggle('hidden',role!=='owner');loadTopics();loadTickets()}
function setCommunityAuthMode(mode){
 authMode=mode;
 $('#communityAuthTitle').textContent=mode==='login'?'ورود به حساب':mode==='signup'?'ساخت حساب':'تکمیل مشخصات حساب';
 $('#communityAuthSubmit').textContent=mode==='login'?'ورود':mode==='signup'?'ثبت‌نام':'ثبت نام نام درون‌بازی';
 $('#communityAuthToggle').classList.toggle('hidden',mode==='complete-profile');
 $('#communityForgotPassword').classList.toggle('hidden',mode==='complete-profile');
 const wrap=$('#communityGameNameWrap');
 wrap.classList.remove('hidden');
 wrap.querySelector('input').required=mode==='signup'||mode==='complete-profile';
 wrap.querySelector('input').placeholder=mode==='login'?'اگر قبلاً نام ثبت نکرده‌ای، اینجا وارد کن':'مثلاً Karaso_Player';
 $('#communityAuthError').textContent='';
}
function openAuth(){setCommunityAuthMode('login');$('#communityAuthOverlay').classList.add('show')}
$('#communityForgotPassword').onclick=async()=>{const email=$('#communityAuthForm [name=email]').value.trim();if(!email){$('#communityAuthError').textContent='ابتدا ایمیلت را وارد کن.';return}const redirectTo=location.origin+location.pathname.replace(/[^/]*$/,'')+'password-reset.html';const {error}=await sb.auth.resetPasswordForEmail(email,{redirectTo});$('#communityAuthError').textContent=error?error.message:'لینک بازیابی رمز عبور به ایمیلت ارسال شد. پوشه Spam را هم بررسی کن.'};
$('#communityLogin').onclick=openAuth;
$('#communityAuthClose').onclick=()=>$('#communityAuthOverlay').classList.remove('show');
$('#communityAuthToggle').onclick=()=>setCommunityAuthMode(authMode==='login'?'signup':'login');
$('#communityAuthForm').onsubmit=async e=>{
 e.preventDefault();
 const f=new FormData(e.currentTarget),email=String(f.get('email')||'').trim(),password=String(f.get('password')||''),displayName=String(f.get('display_name')||'').trim();
 const submit=$('#communityAuthSubmit');submit.disabled=true;$('#communityAuthError').textContent='';
 try{
  if(authMode==='complete-profile'){
   if(!displayName)throw new Error('برای ادامه، نام درون‌بازی را وارد کن.');
   const u=(await sb.auth.getUser()).data.user;
   if(!u)throw new Error('نشست ورود پیدا نشد؛ دوباره وارد شو.');
   const {error}=await sb.from('profiles').upsert({id:u.id,display_name:displayName},{onConflict:'id'});
   if(error)throw error;
   $('#communityAuthOverlay').classList.remove('show');await refreshSession((await sb.auth.getSession()).data.session);return;
  }
  const mode=authMode;
  const r=mode==='login'?await sb.auth.signInWithPassword({email,password}):await sb.auth.signUp({email,password,options:{data:{display_name:displayName}}});
  if(r.error)throw r.error;
  if(mode==='signup'&&!r.data.session){$('#communityAuthError').textContent='ثبت‌نام انجام شد اما تأیید ایمیل در Supabase فعال است. پس از تأیید ایمیل وارد شو.';return}
  if(r.data.user){
   const {data:profile,error:profileReadError}=await sb.from('profiles').select('display_name').eq('id',r.data.user.id).maybeSingle();
   if(profileReadError)throw profileReadError;
   const savedName=String(profile?.display_name||'').trim();
   // On login, keep an existing saved name unchanged. Ask only once if none exists.
   const chosenName=mode==='login'?(savedName||displayName):displayName;
   if(!chosenName){
    setCommunityAuthMode('complete-profile');
    $('#communityAuthError').textContent='این اولین ورود شماست؛ نام درون‌بازی را وارد کن تا برای دفعات بعد ذخیره شود.';
    return;
   }
   if(mode==='signup'||!savedName){
    const {error:profileError}=await sb.from('profiles').upsert({id:r.data.user.id,display_name:chosenName},{onConflict:'id'});
    if(profileError)throw profileError;
   }
  }
  $('#communityAuthOverlay').classList.remove('show');await refreshSession(r.data.session);
 }catch(err){$('#communityAuthError').textContent=err.message}
 finally{submit.disabled=false}
};
$('#communityLogout').onclick=async()=>{await sb.auth.signOut();await refreshSession(null)};
async function loadTopics(){
 const {data,error}=await sb.from('forum_topics').select('id,title,body,category,is_locked,created_at,created_by').order('created_at',{ascending:false});
 if(error){$('#topicList').innerHTML=`<p class="form-error">خطا: ${esc(error.message)}</p>`;return}
 const topics=data||[];
 const {data:postRows}=await sb.from('forum_posts').select('topic_id');
 const postCounts={};(postRows||[]).forEach(p=>postCounts[p.topic_id]=(postCounts[p.topic_id]||0)+1);
 $('#allTopicCount').textContent=topics.length.toLocaleString('fa-IR');
 $('#welcomeTopics').textContent=topics.length.toLocaleString('fa-IR');
 $('#welcomePosts').textContent=(postRows||[]).length.toLocaleString('fa-IR');
 // Populate each category's topic and reply counts and its newest topic
 categories.filter(c=>c[0]!=='all').forEach(([id,name])=>{
  const list=topics.filter(t=>t.category===id);
  const replies=list.reduce((n,t)=>n+(postCounts[t.id]||0),0);
  const c=$(`#count-${id}`),p=$(`#posts-${id}`),last=$(`#last-${id}`);
  if(c)c.textContent=`${list.length.toLocaleString('fa-IR')} موضوع`;
  if(p)p.textContent=`${replies.toLocaleString('fa-IR')} پیام`;
  if(last)last.innerHTML=list[0]?`آخرین موضوع: ${esc(list[0].title)}<small>${new Date(list[0].created_at).toLocaleDateString('fa-IR')}</small>`:'هنوز موضوعی ثبت نشده است';
 });
 const latest=topics.slice(0,4);
 $('#latestActivity').innerHTML=latest.length?latest.map(t=>`<article class="kr-activity-item" data-latest="${t.id}"><b>${esc(t.title)}</b><p>${esc(t.body).slice(0,105)}</p><small>${new Date(t.created_at).toLocaleDateString('fa-IR')} · ${(postCounts[t.id]||0).toLocaleString('fa-IR')} پاسخ</small></article>`).join(''):'<p class="kr-muted">هنوز فعالیتی ثبت نشده است.</p>';
 document.querySelectorAll('[data-latest]').forEach(el=>el.onclick=()=>openTopic(el.dataset.latest));
 $('#hotTopics').innerHTML=latest.length?latest.slice(0,3).map(t=>`<div class="kr-hot-item" data-hot="${t.id}"><b>${esc(t.title)}</b><small>${(postCounts[t.id]||0).toLocaleString('fa-IR')} پاسخ · ${new Date(t.created_at).toLocaleDateString('fa-IR')}</small></div>`).join(''):'<p class="kr-muted">هنوز موضوعی ثبت نشده است.</p>';
 document.querySelectorAll('[data-hot]').forEach(el=>el.onclick=()=>openTopic(el.dataset.hot));
 if(category==='all'){
  $('#categoryGrid').classList.remove('hidden');$('#topicList').classList.add('hidden');
  $('#currentCategoryTitle').textContent='انجمن کاراسو رول‌پلی';
 }else{
  $('#categoryGrid').classList.add('hidden');$('#topicList').classList.remove('hidden');
  const list=topics.filter(t=>t.category===category);
  $('#topicList').innerHTML=list.length?list.map(t=>`<article class="kr-topic-card"><h3>${esc(t.title)} ${t.is_locked?'🔒':''}</h3><p>${esc(t.body).slice(0,220)}</p><div class="kr-topic-meta">${new Date(t.created_at).toLocaleString('fa-IR')} · ${(postCounts[t.id]||0).toLocaleString('fa-IR')} پاسخ · ${t.is_locked?'بسته':'باز'}</div><button class="kr-button" data-open="${t.id}">مشاهده و پاسخ</button></article>`).join(''):'<p class="kr-muted">هنوز موضوعی در این دسته ثبت نشده است.</p>';
  document.querySelectorAll('[data-open]').forEach(b=>b.onclick=()=>openTopic(b.dataset.open));
 }
 if(session?.user){const {data:prof}=await sb.from('profiles').select('display_name').eq('id',session.user.id).maybeSingle();const nm=prof?.display_name||'بازیکن';$('#forumTeam').innerHTML=`<div class="kr-person"><b class="kr-avatar">${esc(nm.slice(0,1))}</b><span><strong>${esc(nm)}</strong><small>${roleLabel(role)}</small></span></div><p class="kr-muted">وضعیت حساب شما در انجمن کاراسو</p>`;}
}
async function openTopic(id){activeTopic=id;document.body.classList.add('kr-topic-focus');const {data:t,error}=await sb.from('forum_topics').select('*').eq('id',id).single();if(error)return;const {data:posts,error:pe}=await sb.from('forum_posts').select('*').eq('topic_id',id).order('created_at');if(pe){alert(pe.message);return}const {data:tp}=await sb.from('profiles').select('display_name,role').eq('id',t.created_by).maybeSingle();const topicName=tp?.display_name||t.author_name||'بازیکن';const topicRole=roleLabel(tp?.role||t.author_role||'customer');$('#topicDetail').classList.remove('hidden');$('#topicDetail').innerHTML=`<button class="forum-btn secondary-btn" id="backTopics">بازگشت</button><h2>${esc(t.title)} ${t.is_locked?'🔒':''}</h2><div class="topic-post"><div class="author-line"><b>${esc(topicName)}</b><span>${topicRole}</span></div><p>${esc(t.body)}</p><small class="muted">${new Date(t.created_at).toLocaleString('fa-IR')}</small></div>${(posts||[]).map(p=>`<div class="topic-post"><div class="author-line"><b>${esc(p.author_name||'بازیکن')}</b><span>${roleLabel(p.author_role||'customer')}</span></div><p>${esc(p.body)}</p><small class="muted">${new Date(p.created_at).toLocaleString('fa-IR')}</small>${['owner','admin'].includes(role)?`<button class="mini-danger" data-delpost="${p.id}">حذف پیام</button>`:''}</div>`).join('')}<form class="reply-form" id="replyForm"><h3>پاسخ سریع</h3><textarea name="body" rows="3" maxlength="4000" required placeholder="متن پاسخ را بنویس..."></textarea><button class="forum-btn" ${!session||t.is_locked?'disabled':''}>ارسال پاسخ</button><p class="muted">${!session?'برای پاسخ وارد حساب شو.':t.is_locked?'این موضوع بسته شده است.':''}</p></form>${['owner','admin'].includes(role)?`<div class="owner-tools"><button class="forum-btn" id="toggleLock">${t.is_locked?'بازکردن موضوع':'قفل کردن موضوع'}</button><button class="mini-danger" id="deleteTopic">حذف موضوع</button></div>`:''}`;
$('#backTopics').onclick=()=>{document.body.classList.remove('kr-topic-focus');$('#topicDetail').classList.add('hidden');};$('#replyForm').onsubmit=async e=>{e.preventDefault();if(!session)return;const body=String(new FormData(e.currentTarget).get('body')||'').trim();if(!body)return;const {error}=await sb.from('forum_posts').insert({topic_id:id,body});if(error)alert(error.message);else openTopic(id)};
document.querySelectorAll('[data-delpost]').forEach(b=>b.onclick=async()=>{if(!confirm('این پیام حذف شود؟'))return;const {error}=await sb.from('forum_posts').delete().eq('id',b.dataset.delpost);if(error)alert(error.message);else openTopic(id)});
if(['owner','admin'].includes(role)){$('#toggleLock').onclick=async()=>{const {error}=await sb.from('forum_topics').update({is_locked:!t.is_locked}).eq('id',id);if(error)alert(error.message);else{loadTopics();openTopic(id)}};$('#deleteTopic').onclick=async()=>{if(confirm('این موضوع حذف شود؟')){const {error}=await sb.from('forum_topics').delete().eq('id',id);if(error)alert(error.message);else{document.body.classList.remove('kr-topic-focus');$('#topicDetail').classList.add('hidden');loadTopics()}}}}
}
$('#newTopicBtn').onclick=()=>{if(role!=='owner')return;const form=document.createElement('form');form.className='panel-form quick-topic-form';form.innerHTML=`<h3>موضوع جدید</h3><p class="muted">عنوان و متن موضوع را وارد کن و انتشار را بزن.</p><label>عنوان<input name="title" maxlength="180" required></label><label>دسته‌بندی<select name="category">${categories.filter(c=>c[0]!=='all').map(c=>`<option value="${c[0]}">${c[1]}</option>`).join('')}</select></label><label>متن موضوع<textarea name="body" rows="5" required maxlength="8000"></textarea></label><button class="forum-btn">انتشار موضوع</button><button type="button" class="forum-btn secondary-btn" id="cancelNew">انصراف</button><p class="form-error"></p>`;$('#topicDetail').classList.remove('hidden');$('#topicDetail').replaceChildren(form);$('#cancelNew').onclick=()=>$('#topicDetail').classList.add('hidden');form.onsubmit=async e=>{e.preventDefault();const d=new FormData(form);const {error}=await sb.from('forum_topics').insert({title:d.get('title'),category:d.get('category'),body:d.get('body'),created_by:session.user.id});if(error)form.querySelector('.form-error').textContent=error.message;else{$('#topicDetail').classList.add('hidden');category='all';loadTopics()}}};
$('#ticketForm').onsubmit=async e=>{e.preventDefault();if(!session){openAuth();$('#ticketError').textContent='برای ثبت تیکت ابتدا وارد حساب شو.';return}const d=new FormData(e.currentTarget);const {error}=await sb.from('support_tickets').insert({subject:d.get('subject'),message:d.get('message'),user_id:session.user.id});$('#ticketError').textContent=error?error.message:'تیکت با موفقیت ثبت شد.';if(!error){e.currentTarget.reset();loadTickets()}};
async function loadTickets(){if(!session){$('#myTickets').textContent='برای مشاهده تیکت‌ها وارد حساب شو.';return}const {data,error}=await sb.from('support_tickets').select('*').order('created_at',{ascending:false});if(error){$('#myTickets').textContent='ابتدا SQL پشتیبانی را اجرا کن: '+error.message;return}$('#myTickets').innerHTML=(data||[]).map(t=>`<div class="ticket-item"><b>${esc(t.subject)}</b><div class="muted">${new Date(t.created_at).toLocaleString('fa-IR')}</div><p>${esc(t.message)}</p><span class="status-tag">${esc(t.status)}</span></div>`).join('')||'<p class="muted">هنوز تیکتی ثبت نکرده‌ای.</p>'}
renderCategories();sb.auth.getSession().then(({data})=>refreshSession(data.session));sb.auth.onAuthStateChange((_e,s)=>setTimeout(()=>refreshSession(s),0));
