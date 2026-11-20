KARASO ROLEPLAY — PRIVATE OWNER TICKETS

Files changed:
- community.js: users can submit a ticket and see only their own ticket plus Owner reply.
- forum-admin.html / forum-admin.js: adds private ticket inbox and reply controls; UI is shown only to role=owner.
- admin.css: styles ticket inbox.
- KARASO_PRIVATE_TICKETS_OWNER_ONLY.sql: required Supabase schema/RLS migration.

INSTALL:
1) Run KARASO_PRIVATE_TICKETS_OWNER_ONLY.sql in Supabase > SQL Editor > New query > Run.
2) Replace these files in the GitHub repository, preserving their paths:
   community.js, forum-admin.html, forum-admin.js, admin.css
3) Commit changes, then hard refresh the site (Ctrl+F5).

SECURITY:
The database RLS policies are the security boundary. Ticket SELECT is allowed only for the ticket creator or a user whose profiles.role is exactly 'owner'. Only Owner can update/reply/close tickets. Admin role is intentionally not enough. No email addresses are queried or displayed.
