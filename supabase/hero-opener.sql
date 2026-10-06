CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.set_updated_at() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.set_updated_at() FROM anon, authenticated;

CREATE TABLE IF NOT EXISTS public.hero_opener (
  id text PRIMARY KEY DEFAULT 'default' CHECK (id = 'default'),
  video_url text NOT NULL,
  provider text NOT NULL CHECK (provider IN ('vimeo', 'youtube')),
  video_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.hero_opener ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "hero_opener_select_anon" ON public.hero_opener;
CREATE POLICY "hero_opener_select_anon"
  ON public.hero_opener FOR SELECT TO anon, authenticated USING (true);

DROP TRIGGER IF EXISTS hero_opener_set_updated_at ON public.hero_opener;
CREATE TRIGGER hero_opener_set_updated_at
  BEFORE UPDATE ON public.hero_opener
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

INSERT INTO public.hero_opener (id, video_url, provider, video_id)
VALUES (
  'default',
  'https://vimeo.com/1178774007',
  'vimeo',
  '1178774007'
)
ON CONFLICT (id) DO NOTHING;
