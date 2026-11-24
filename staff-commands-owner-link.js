(async()=>{
 const el=document.getElementById('ownerCmdAdminLink');if(!el||!window.supabase)return;
 const sb=window.supabase.createClient(window.KARASO_SUPABASE_URL,window.KARASO_SUPABASE_PUBLISHABLE_KEY,window.KARASO_SUPABASE_AUTH_OPTIONS);
 const {data:{session}}=await sb.auth.getSession();if(!session?.user)return;
 const {data:profile}=await sb.from('profiles').select('role').eq('id',session.user.id).maybeSingle();
 if(profile?.role==='owner')el.classList.remove('hidden');
})();
