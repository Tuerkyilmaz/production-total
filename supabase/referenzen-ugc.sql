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

CREATE TABLE IF NOT EXISTS public.referenzen (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT '',
  logo_url text NOT NULL,
  href text,
  listen_index integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS referenzen_listen_index_idx ON public.referenzen (listen_index ASC);

ALTER TABLE public.referenzen ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "referenzen_select_anon" ON public.referenzen;
CREATE POLICY "referenzen_select_anon"
  ON public.referenzen FOR SELECT TO anon, authenticated USING (true);

DROP TRIGGER IF EXISTS referenzen_set_updated_at ON public.referenzen;
CREATE TRIGGER referenzen_set_updated_at
  BEFORE UPDATE ON public.referenzen
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.ugc_creators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  foto_url text,
  instagram_url text,
  youtube_url text,
  tiktok_url text,
  twitch_url text,
  linkedin_url text,
  custom_link_url text,
  custom_link_label text,
  eigenschaft_1 text,
  eigenschaft_2 text,
  eigenschaft_3 text,
  skill_bildpraesenz smallint NOT NULL DEFAULT 3,
  skill_retorik smallint NOT NULL DEFAULT 3,
  skill_hook smallint NOT NULL DEFAULT 3,
  skill_reichweite smallint NOT NULL DEFAULT 3,
  nogo_1 text,
  nogo_2 text,
  nogo_3 text,
  listen_index integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT ugc_skill_bildpraesenz_range CHECK (skill_bildpraesenz BETWEEN 1 AND 5),
  CONSTRAINT ugc_skill_retorik_range CHECK (skill_retorik BETWEEN 1 AND 5),
  CONSTRAINT ugc_skill_hook_range CHECK (skill_hook BETWEEN 1 AND 5),
  CONSTRAINT ugc_skill_reichweite_range CHECK (skill_reichweite BETWEEN 1 AND 5)
);

CREATE INDEX IF NOT EXISTS ugc_creators_listen_index_idx ON public.ugc_creators (listen_index ASC);

ALTER TABLE public.ugc_creators ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ugc_creators_select_anon" ON public.ugc_creators;
CREATE POLICY "ugc_creators_select_anon"
  ON public.ugc_creators FOR SELECT TO anon, authenticated USING (true);

DROP TRIGGER IF EXISTS ugc_creators_set_updated_at ON public.ugc_creators;
CREATE TRIGGER ugc_creators_set_updated_at
  BEFORE UPDATE ON public.ugc_creators
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
