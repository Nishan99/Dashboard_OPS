
-- Discussion channels
CREATE TABLE public.discussion_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.discussion_channels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read/write on channels" ON public.discussion_channels FOR ALL USING (true) WITH CHECK (true);

-- Discussion messages with realtime
CREATE TABLE public.discussion_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES public.discussion_channels(id) ON DELETE CASCADE NOT NULL,
  sender_name TEXT NOT NULL DEFAULT 'Alex Chen',
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.discussion_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read/write on messages" ON public.discussion_messages FOR ALL USING (true) WITH CHECK (true);

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.discussion_messages;

-- Call rooms
CREATE TABLE public.call_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'video' CHECK (type IN ('video', 'audio')),
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'ended')),
  created_by TEXT NOT NULL DEFAULT 'Alex Chen',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.call_rooms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read/write on call_rooms" ON public.call_rooms FOR ALL USING (true) WITH CHECK (true);

-- Seed some channels
INSERT INTO public.discussion_channels (name, description) VALUES
  ('general', 'General team discussion'),
  ('engineering', 'Engineering team chat'),
  ('design', 'Design team updates'),
  ('random', 'Off-topic and fun');

-- Seed some messages
INSERT INTO public.discussion_messages (channel_id, sender_name, content) VALUES
  ((SELECT id FROM public.discussion_channels WHERE name = 'general'), 'Alex Chen', 'Welcome to the team chat! 🎉'),
  ((SELECT id FROM public.discussion_channels WHERE name = 'general'), 'Sarah Kim', 'Hey everyone, great to be here!'),
  ((SELECT id FROM public.discussion_channels WHERE name = 'engineering'), 'Marcus Johnson', 'Deployed v2.1 to staging. Please review.'),
  ((SELECT id FROM public.discussion_channels WHERE name = 'engineering'), 'Alex Chen', 'Looks good, running tests now.'),
  ((SELECT id FROM public.discussion_channels WHERE name = 'design'), 'Emily Park', 'New mockups are ready for the dashboard redesign'),
  ((SELECT id FROM public.discussion_channels WHERE name = 'random'), 'James Wilson', 'Anyone up for lunch today? 🍕');
