const portalSb=window.supabase.createClient(window.KARASO_SUPABASE_URL,window.KARASO_SUPABASE_PUBLISHABLE_KEY,window.KARASO_SUPABASE_AUTH_OPTIONS);
const p$=s=>document.querySelector(s);let portalMode='login';
function portalOpen(mode='login'){
 portalMode=mode;
 p$('#portalAuthTitle').textContent=mode==='login'?'ورود به حساب':'ساخت حساب جدید';
 p$('#portalAuthSubmit').textContent=mode==='login'?'ورود':'ثبت‌نام';
 p$('#portalAuthToggle').classList.remove('hidden');p$('#portalForgot').classList.remove('hidden');
 p$('#portalAuthToggle').textContent=mode==='login'?'حساب ندارم؛ ثبت‌نام':'قبلاً حساب ساخته‌ام؛ ورود';
 const nameWrap=p$('#portalGameNameWrap'),nameInput=p$('#portalAuthForm [name=display_name]');
 nameWrap.classList.remove('hidden');
 nameInput.required=mode==='signup';
 nameInput.placeholder=mode==='login'?'اگر نامت قبلاً ذخیره نشده، اینجا وارد کن':'مثلاً Karaso_Player';
 p$('#portalAuthError').textContent='';
 p$('#portalAuthOverlay').classList.add('show');
}
async function portalRefresh(session){
 const user=session?.user;
 p$('#portalAuthOpen').classList.toggle('hidden',!!user);
 p$('#portalAuthLogout').classList.toggle('hidden',!user);
 p$('#portalShopAdmin').classList.add('hidden');p$('#portalForumAdmin').classList.add('hidden');
 if(!user){p$('#portalAuthState').textContent='وارد حساب نشده‌اید';return}
 let profile=null;
 try{
  const {data,error}=await portalSb.from('profiles').select('display_name,role').eq('id',user.id).maybeSingle();
  if(error)throw error;
  profile=data;
 }catch(error){console.error('Profile read failed:',error)}
 const displayName=String(profile?.display_name||'').trim();
 p$('#portalAuthState').textContent=displayName?`بازیکن: ${displayName}`:'حساب فعال است';
 if(['owner','admin'].includes(profile?.role)){p$('#portalShopAdmin').classList.remove('hidden');p$('#portalForumAdmin').classList.remove('hidden')}
}
async function portalSaveGameName(userId,displayName){
 const {data:existing,error:readError}=await portalSb.from('profiles').select('id').eq('id',userId).maybeSingle();
 if(readError)throw readError;
 if(existing){
  const {error}=await portalSb.from('profiles').update({display_name:displayName}).eq('id',userId);
  if(error)throw error;
 }else{
  const {error}=await portalSb.from('profiles').insert({id:userId,display_name:displayName,role:'customer'});
  if(error)throw error;
 }
}

p$('#portalAuthOpen').onclick=()=>portalOpen('login');
p$('#portalAuthClose').onclick=()=>p$('#portalAuthOverlay').classList.remove('show');
p$('#portalAuthToggle').onclick=()=>portalOpen(portalMode==='login'?'signup':'login');
p$('#portalForgot').onclick=async()=>{
 const email=p$('#portalAuthForm [name=email]').value.trim();
 if(!email){p$('#portalAuthError').textContent='ابتدا ایمیل را وارد کن.';return}
 const redirectTo=location.origin+location.pathname.replace(/[^/]*$/,'')+'password-reset.html';
 const {error}=await portalSb.auth.resetPasswordForEmail(email,{redirectTo});
 p$('#portalAuthError').textContent=error?error.message:'لینک بازیابی رمز عبور به ایمیلت ارسال شد.';
};
p$('#portalAuthForm').onsubmit=async e=>{
 e.preventDefault();
 const fd=new FormData(e.currentTarget),email=String(fd.get('email')||'').trim(),password=String(fd.get('password')||''),displayName=String(fd.get('display_name')||'').trim();
 const b=p$('#portalAuthSubmit');b.disabled=true;p$('#portalAuthError').textContent='';
 try{
  const mode=portalMode;
  if(mode==='complete-profile'){
   const {data:{user},error:userError}=await portalSb.auth.getUser();
   if(userError)throw userError;
   if(!user)throw new Error('نشست ورود پیدا نشد؛ دوباره وارد حساب شو.');
   if(!displayName)throw new Error('نام درون‌بازی را وارد کن.');
   await portalSaveGameName(user.id,displayName);
   p$('#portalAuthOverlay').classList.remove('show');
   await portalRefresh((await portalSb.auth.getSession()).data.session);
   return;
  }
  const r=mode==='login'
   ?await portalSb.auth.signInWithPassword({email,password})
   :await portalSb.auth.signUp({email,password,options:{data:{display_name:displayName}}});
  if(r.error)throw r.error;
  if(mode==='signup'&&!r.data.session){p$('#portalAuthError').textContent='ثبت‌نام انجام شد اما Supabase هنوز تأیید ایمیل را اجباری کرده. پس از تأیید ایمیل وارد شو.';return}
  if(r.data.user){
   const {data:profile,error:readError}=await portalSb.from('profiles').select('display_name').eq('id',r.data.user.id).maybeSingle();
   if(readError)throw readError;
   const savedName=String(profile?.display_name||'').trim();
   if(mode==='signup'){
    await portalSaveGameName(r.data.user.id,displayName);
   }else if(!savedName){
    portalMode='complete-profile';
    p$('#portalAuthTitle').textContent='تکمیل نام درون‌بازی';
    p$('#portalAuthSubmit').textContent='ذخیره نام';
    p$('#portalAuthToggle').classList.add('hidden');
    p$('#portalForgot').classList.add('hidden');
    p$('#portalAuthError').textContent='ورود انجام شد؛ فقط یک‌بار نام درون‌بازی را وارد کن تا ذخیره شود. ایمیل نمایش داده نخواهد شد.';
    return;
   }
  }
  p$('#portalAuthOverlay').classList.remove('show');
  await portalRefresh(r.data.session);
  const dest=new URLSearchParams(location.search).get('return');
  if(['shop','community'].includes(dest))location.href='./'+dest+'.html';
 }catch(err){p$('#portalAuthError').textContent=err.message}
 finally{b.disabled=false}
};
p$('#portalAuthLogout').onclick=async()=>{await portalSb.auth.signOut();await portalRefresh(null)};
portalSb.auth.getSession().then(({data})=>portalRefresh(data.session));
portalSb.auth.onAuthStateChange((_e,s)=>{portalRefresh(s)});
if(location.hash==='#auth'||new URLSearchParams(location.search).get('auth'))setTimeout(()=>portalOpen(new URLSearchParams(location.search).get('auth')==='signup'?'signup':'login'),150);
