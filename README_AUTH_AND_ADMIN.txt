KARASO ROLEPLAY - Unified Authentication + Separate Admin Panels

FILES
- index.html + portal-auth.js: the one central login/register page and shared session.
- shop.html + store.js: shop. Login/register redirects to homepage; after successful login returns to shop.
- community.html + community.js: forum. Login/register redirects to homepage; after successful login returns to forum.
- admin.html + admin.js: SHOP order-management panel.
- forum-admin.html + forum-admin.js: separate FORUM moderation panel (lock/unlock/delete topics).
- supabase-config.js: shared project URL, publishable key and persistent localStorage auth settings.
- password-reset.html: email-based password reset remains available.

IMPORTANT SUPABASE SETTING FOR SIGNUP WITHOUT EMAIL CONFIRMATION
In Supabase Dashboard for project qgochicianbeexiubnub:
Authentication -> Sign In / Providers -> Email
Turn OFF "Confirm email" (sometimes shown as "Confirm email address"), then Save.
This is a dashboard-level setting; browser code cannot safely disable Supabase email confirmation.
Password reset continues to send a verification/recovery link by email through resetPasswordForEmail.

AUTH SESSION
All pages use the same Supabase project and default auth storage key with persistSession=true, autoRefreshToken=true, detectSessionInUrl=true and localStorage. Thus sign-in at the homepage is shared by shop and forum on the same domain. Do not use private browsing or clear site data if you want the browser session to persist.

ADMIN PANELS
- Shop panel: admin.html
- Forum panel: forum-admin.html
Both require profiles.role = owner or admin to enter. Topic lock/unlock/delete controls are Owner-only in the UI, matching the existing database policy described in the project setup. If an Admin (not Owner) needs topic moderation permissions, update the RLS policy deliberately; do not disable RLS.

DEPLOY
Upload/replace all files in the ZIP at the root of the GitHub Pages repository, preserving images/ and all existing assets. Do not upload only selected HTML files because this update adds portal-auth.js and forum-admin.html/js.
