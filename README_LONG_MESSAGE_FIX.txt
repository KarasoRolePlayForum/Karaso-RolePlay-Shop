KARASO ROLEPLAY — LONG MESSAGE FIX

What changed:
- Removed HTML maxlength restrictions from forum topic body, forum replies, and support ticket message.
- Updated community.css so long messages wrap and remain readable on mobile.
- Added KARASO_UNLIMITED_MESSAGE_LENGTH.sql to convert message body columns to PostgreSQL TEXT.
- Topic titles and ticket subjects remain bounded; the request was for long message content.

Install:
1. Run KARASO_UNLIMITED_MESSAGE_LENGTH.sql in Supabase > SQL Editor.
2. Replace community.html, community.js, and community.css in GitHub.
3. Commit and hard-refresh the site (Ctrl+F5).

Note:
No database can accept literally infinite data. PostgreSQL TEXT removes the artificial VARCHAR length cap; practical limits remain from request size, database/storage, and hosting.
