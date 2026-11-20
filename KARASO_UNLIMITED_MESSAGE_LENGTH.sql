-- KARASO ROLEPLAY: remove artificial length limits from forum and support message bodies.
-- Run in Supabase SQL Editor. This preserves existing content.
ALTER TABLE public.forum_topics
  ALTER COLUMN body TYPE text USING body::text;

ALTER TABLE public.forum_posts
  ALTER COLUMN body TYPE text USING body::text;

ALTER TABLE public.support_tickets
  ALTER COLUMN message TYPE text USING message::text;

-- Keep topic titles and ticket subjects reasonably bounded for display/search.
