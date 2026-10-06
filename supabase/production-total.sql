-- =============================================================================
-- ProductionTotal — einmal in Supabase SQL ausführen
-- =============================================================================

-- ——— Enum + Tabelle projekte ———
DO $$
BEGIN
  CREATE TYPE public.projekt_kategorie AS ENUM (
    'social_media',
    'youtube',
    'imagefilm',
    'event'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

CREATE TABLE IF NOT EXISTS public.projekte (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titel text NOT NULL,
  subtitel text,
  projekttext text,
  kategorie public.projekt_kategorie NOT NULL DEFAULT 'social_media',
  video_url text,
  thumbnail_url text,
  slug text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS projekte_kategorie_idx ON public.projekte (kategorie);
CREATE INDEX IF NOT EXISTS projekte_created_at_idx ON public.projekte (created_at DESC);

COMMENT ON TABLE public.projekte IS 'Video-Projekte; Thumbnails z. B. Vercel Blob / Storage; Video-URL Vimeo/YouTube.';

ALTER TABLE public.projekte ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "projekte_select_anon" ON public.projekte;
CREATE POLICY "projekte_select_anon"
  ON public.projekte
  FOR SELECT
  TO anon, authenticated
  USING (true);

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

DROP TRIGGER IF EXISTS projekte_set_updated_at ON public.projekte;
CREATE TRIGGER projekte_set_updated_at
  BEFORE UPDATE ON public.projekte
  FOR EACH ROW
  EXECUTE PROCEDURE public.set_updated_at();

-- ——— Zusatzspalten (Filter, Vorschau, Sortierung) ———
ALTER TABLE public.projekte ADD COLUMN IF NOT EXISTS portfolio_kategorien public.projekt_kategorie[];

UPDATE public.projekte
SET portfolio_kategorien = ARRAY[kategorie]::public.projekt_kategorie[]
WHERE portfolio_kategorien IS NULL;

ALTER TABLE public.projekte ALTER COLUMN portfolio_kategorien SET NOT NULL;
ALTER TABLE public.projekte ALTER COLUMN portfolio_kategorien
  SET DEFAULT ARRAY['social_media']::public.projekt_kategorie[];

ALTER TABLE public.projekte ADD COLUMN IF NOT EXISTS preview_darken boolean NOT NULL DEFAULT false;

ALTER TABLE public.projekte ADD COLUMN IF NOT EXISTS listen_index integer NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS projekte_listen_index_idx ON public.projekte (listen_index ASC);

COMMENT ON COLUMN public.projekte.listen_index IS 'Sortierung der öffentlichen Projektliste: 0 = zuerst; wird im Admin per Reihenfolge-API gesetzt.';

-- ——— Storage: öffentliche Buckets „logos“, „thumbs“ (thumbs = Projekt-Thumbnails, max. 2 MB) ———
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'logos',
  'logos',
  true,
  5242880,
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'thumbs',
  'thumbs',
  true,
  2097152,
  ARRAY['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'image/gif', 'image/avif']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Öffentlicher Bucket: Zugriff über …/object/public/logos/<datei> ohne breite SELECT-Policy.
-- (Keine Policy „alle Objekte lesen“ — sonst wäre Auflisten aller Dateien für Clients möglich.)
DROP POLICY IF EXISTS "public_read_logos" ON storage.objects;

-- =============================================================================
-- Beispieldaten (optional: DELETE ersetzt alle Zeilen in projekte)
-- =============================================================================
BEGIN;

DELETE FROM public.projekte;

INSERT INTO public.projekte (
  id, titel, subtitel, projekttext, kategorie, portfolio_kategorien, video_url, thumbnail_url, slug, preview_darken, listen_index
) VALUES
  ( gen_random_uuid(), 'Pimp Your Ride mit Rosemondy', 'Mr. Germany Rosemondy · Cupra', $pt$Spektakuläre Umbauten für Prominente und Community: Mr. Germany Rosemondy mit Cupra – Emotion, Dynamik und hochwertige Entertainment-Produktion.

In diesem Format werden Autos von Prominenten und Community-Mitgliedern spektakulär umgebaut und individuell veredelt. Zu Gast war Mr. Germany Rosemondy mit seinem Cupra. Der Ausschnitt zeigt die Emotionen, Dynamik und Qualität der Produktion und steht exemplarisch für unsere professionelle Umsetzung hochwertiger Entertainment-Formate.$pt$, 'youtube'::public.projekt_kategorie, ARRAY['youtube']::public.projekt_kategorie[], 'https://www.youtube.com/watch?v=Be-c7oIe0ww', '/assets/img/thumbs/pimp-your-ride-mit-rosemondy.jpg', 'pimp-your-ride-mit-rosemondy', FALSE, 0 ),
  ( gen_random_uuid(), 'Pimp Your Ride mit Yonca', 'Yonca Hagen · Cupra', $pt$Spektakuläre Umbauten für Prominente und Community: Yonca Hagen mit Cupra – Emotion, Dynamik und hochwertige Entertainment-Produktion.

In diesem Format werden Autos von Prominenten und Community-Mitgliedern spektakulär umgebaut und individuell veredelt. Zu Gast war Yonca Hagen mit ihrem Cupra. Der Ausschnitt zeigt die Emotionen, Dynamik und Qualität der Produktion und steht exemplarisch für unsere professionelle Umsetzung hochwertiger Entertainment-Formate.$pt$, 'youtube'::public.projekt_kategorie, ARRAY['youtube']::public.projekt_kategorie[], 'https://www.youtube.com/watch?v=ZRW34kCdwqM', '/assets/img/thumbs/pimp-your-ride-mit-yonca-hagen.jpg', 'pimp-your-ride-mit-yonca-hagen', FALSE, 1 ),
  ( gen_random_uuid(), 'Pimp Your Ride Challenge', 'Breitenberg', $pt$„Pimp Your Ride Challenge“: Entertainment mit Spannungsbogen und Preisen bis 20.000 Euro. Kameras, Licht und Schnitt stützen die Challenges klar und dynamisch. Referenz für Show mit Publikum und Moderation; von Live-Regie bis schnellen Clips für Trailer und Social.

Dieses Projekt zeigt die Produktion des Formats „Pimp Your Ride Challenge“, bei dem Entertainment, Spannung und hochwertige Produktion aufeinandertreffen. In packenden Challenges treten Zuschauer gegeneinander an, beweisen ihr Können und haben die Chance, Preise von bis zu 20.000 Euro zu gewinnen. Der gezeigte Ausschnitt gibt einen authentischen Einblick in die Dynamik, Emotionen und Intensität des Formats. Gleichzeitig dient das Projekt als starkes Beispiel für unsere Fähigkeit, aufwendige Entertainment-Produktionen professionell und wirkungsvoll umzusetzen.$pt$, 'youtube'::public.projekt_kategorie, ARRAY['youtube']::public.projekt_kategorie[], 'https://www.youtube.com/watch?v=9-mnUZfoREo', '/assets/img/thumbs/pimp-your-ride-challenge-breitenberg-youtube.jpg', 'pimp-your-ride-challenge-breitenberg-youtube', FALSE, 2 ),
  ( gen_random_uuid(), 'JIMI PALAIS', '40% Sale Campaign', $pt$Fashion trifft Performance, starke Bilder für maximale Aufmerksamkeit im Sale.

Für JIMI PALAIS haben wir eine visuelle Kampagne umgesetzt, die den 40% Sale emotional und hochwertig inszeniert. Ziel war es, die Marke nicht nur über den Rabatt zu kommunizieren, sondern über Bildsprache und Stil aufzuwerten. Der Film kombiniert Fashion, Ästhetik und klare Botschaften, um Aufmerksamkeit zu erzeugen und gleichzeitig die Markenidentität zu stärken.$pt$, 'social_media'::public.projekt_kategorie, ARRAY['social_media']::public.projekt_kategorie[], 'https://vimeo.com/1180297950', '/assets/img/thumbs/jimi-palais-40-sale-campaign.jpg', 'jimi-palais-40-sale-campaign', FALSE, 3 ),
  ( gen_random_uuid(), 'THE BRIDE', 'Meet the Founder - Layla', $pt$Ein persönlicher Einblick in die Welt von Layla – Designerin, Gründerin und kreative Vision hinter THE BRIDE.

Dieses Branding- und Imagefilm-Projekt erzählt die Geschichte von Layla, der Gründerin von THE BRIDE. In einem persönlichen Interview gibt sie Einblicke in ihre Arbeit, ihre Leidenschaft für Brautmode und den Weg hinter ihrer Marke. Der Film verbindet emotionale Nähe mit hochwertiger Ästhetik und schafft Vertrauen, Identität und eine starke Verbindung zur Zielgruppe.$pt$, 'social_media'::public.projekt_kategorie, ARRAY['social_media']::public.projekt_kategorie[], 'https://vimeo.com/1180298085', '/assets/img/thumbs/the-bride-meet-the-founder-layla.jpg', 'the-bride-meet-the-founder-layla', FALSE, 4 ),
  ( gen_random_uuid(), 'Excellence is my Poison Teil 2', 'Fashion Drop Campaign', $pt$Der Drop ist da, reduzierte Inszenierung trifft auf maximale Spannung und Attitude.

Nach dem Early Access Teaser folgt mit „Excellence is my Poison, Teil 2“ der eigentliche Drop der Kollektion. Der Fokus liegt auf Spannung, Ästhetik und gezielter Inszenierung. Die Produkte werden bewusst nicht vollständig gezeigt, um Neugier zu erzeugen und den Hype zu steigern. Der Film lädt die Marke emotional auf und schafft ein starkes Verlangen nach dem Release, mit klarer Botschaft: Verpass nicht den Drop.$pt$, 'imagefilm'::public.projekt_kategorie, ARRAY['imagefilm']::public.projekt_kategorie[], 'https://vimeo.com/1180296984', '/assets/img/thumbs/eimp-excellence-is-my-poison-teil-2-fashion-drop.jpg', 'eimp-excellence-is-my-poison-teil-2-fashion-drop', FALSE, 5 ),
  ( gen_random_uuid(), 'Biker Rollers', 'Social Media Reel', $pt$Schnell, roh und on trend – Biker-Rollers für maximale Aufmerksamkeit auf Social Media.

Für dieses Projekt haben wir dynamische Roller-Aufnahmen mit zwei Motorradfahrern produziert, speziell optimiert für Instagram und TikTok. Ziel war es, aktuelle Trends visuell umzusetzen und mit schnellen Schnitten, starken Bewegungen und moderner Ästhetik maximale Aufmerksamkeit zu erzeugen. Das Ergebnis: ein energiegeladenes Reel, das Performance und Lifestyle vereint.$pt$, 'social_media'::public.projekt_kategorie, ARRAY['social_media']::public.projekt_kategorie[], 'https://vimeo.com/1180300174', '/assets/img/thumbs/biker-rollers-social-media-reel.jpg', 'biker-rollers-social-media-reel', FALSE, 6 ),
  ( gen_random_uuid(), 'WS Racing Team', 'Nürburgring Team Portrait', $pt$Die Menschen hinter dem Motorsport – roh, ehrlich und voller Leidenschaft.

In diesem Projekt stehen nicht die Autos, sondern die Menschen im Mittelpunkt. Das WS Racing Team wird in seiner ganzen Authentizität gezeigt, abseits der Strecke, im echten Moment. Der Film porträtiert den Zusammenhalt, die Leidenschaft und den Alltag im Motorsport. Eine visuelle Hommage an die Crew hinter dem Erfolg.$pt$, 'social_media'::public.projekt_kategorie, ARRAY['social_media']::public.projekt_kategorie[], 'https://vimeo.com/1180298415', '/assets/img/thumbs/ws-racing-team-nuerburgring-portrait.jpg', 'ws-racing-team-nuerburgring-portrait', FALSE, 7 ),
  ( gen_random_uuid(), 'WS Racing', 'Nürburgring – 24h Race Coverage', $pt$Motorsport pur – vom ersten Licht bis tief in die Nacht. Emotionen, Adrenalin und 24h Racing am Nürburgring.

Dieses Projekt dokumentiert WS Racing beim legendären 24h-Rennen am Nürburgring – vom frühen Morgen bis in die Nacht. Der Fokus liegt auf der Intensität des Motorsports: Boxenstopps, Teamdynamik, Spannung und pure Ausdauer. Durch authentische Bilder und nahbare Perspektiven entsteht ein Film, der nicht nur das Rennen zeigt, sondern das Gefühl, Teil davon zu sein.$pt$, 'social_media'::public.projekt_kategorie, ARRAY['social_media']::public.projekt_kategorie[], 'https://vimeo.com/1180298900', '/assets/img/thumbs/ws-racing-nuerburgring-24h-race-coverage.jpg', 'ws-racing-nuerburgring-24h-race-coverage', FALSE, 8 ),
  ( gen_random_uuid(), 'John Mahlmann', 'Porsche 911 Rollers', $pt$Dynamische Highspeed-Rollers mit dem Porsche 911 – präzise, cinematic und voller Adrenalin.

Für dieses Projekt haben wir gemeinsam mit John Mahlmann eindrucksvolle Roller-Aufnahmen eines Porsche 911 umgesetzt. Im Fokus standen Geschwindigkeit, Präzision und ein cineastischer Look, der die Performance und Ästhetik des Fahrzeugs perfekt einfängt. Durch gezielte Kameraführung, Motion und Licht entsteht ein intensives Fahrerlebnis, das die Energie der Straße spürbar macht und den Charakter des 911 kompromisslos in Szene setzt.$pt$, 'social_media'::public.projekt_kategorie, ARRAY['social_media']::public.projekt_kategorie[], 'https://vimeo.com/1180297746', '/assets/img/thumbs/rollers-john-mahlmann-porsche-911.jpg', 'rollers-john-mahlmann-porsche-911', FALSE, 9 ),
  ( gen_random_uuid(), 'More Than Connections', 'Cinematic Networking Film', $pt$Imagefilm für das Wecon Netzwerk: echte Verbindungen, Vertrauen und nachhaltige Beziehungen. Cineastische Bildsprache, authentische Begegnungen und die Dynamik eines starken Netzwerks – Nähe, Professionalität und gemeinsames Wachstum.

Dieses Projekt zeigt die Kraft echter Verbindungen. Das Wecon Netzwerk bringt Menschen zusammen, schafft Vertrauen und fördert nachhaltige Beziehungen.

In cineastischen Bildern werden authentische Begegnungen und die Dynamik eines starken Netzwerks erlebbar, ein Gefühl von Nähe, Professionalität und gemeinsamem Wachstum.$pt$, 'imagefilm'::public.projekt_kategorie, ARRAY['event', 'imagefilm']::public.projekt_kategorie[], 'https://vimeo.com/1180614882', '/assets/img/thumbs/more-than-connections.jpg', 'more-than-connections', FALSE, 10 ),
  ( gen_random_uuid(), 'Standing Still', 'Nike Spec Ad', $pt$Spec-Ad mit sportlichem Kern: visuelle und emotionale Reise über Hingabe, Fokus und Glauben an den eigenen Traum; authentische Bildsprache, motivierend und merkfähig. Für Marken, die über Leistung und Geschichte sprechen wollen.

„Standing Still“ ist mehr als nur ein Sportfilm. Es ist eine visuelle und emotionale Reise über Hingabe, Fokus und den unerschütterlichen Glauben an den eigenen Traum. Der Film zeigt, dass Erfolg nur durch harte Arbeit, Ausdauer und Selbstüberwindung entsteht, egal, ob im Sport, im Unternehmertum oder im Leben allgemein. Dieses Projekt verkörpert, was wir mit unserer Arbeit erreichen wollen: authentische, visuell eindrucksvolle Geschichten, die motivieren, inspirieren und im Gedächtnis bleiben.$pt$, 'imagefilm'::public.projekt_kategorie, ARRAY['imagefilm']::public.projekt_kategorie[], 'https://vimeo.com/1178197975', '/assets/img/thumbs/standing-still.jpg', 'standing-still', FALSE, 11 ),
  ( gen_random_uuid(), 'No Face, No Case', 'Motorsport Ad', $pt$Motorsport-Werbespot mit Fokus auf Geschwindigkeit, Präzision und modernes Fahrzeugdesign: Hochleistungsfahrzeuge wie BMW und Porsche in dynamischen Fahrszenen auf der Autobahn, ästhetische Bilder und intensive Bewegung. Referenz für hochwertige Automotive-Produktion.

Dieses Projekt fängt die pure Faszination von Geschwindigkeit, Präzision und modernem Fahrzeugdesign ein. Hochleistungsfahrzeuge wie BMW und Porsche werden in dynamischen Fahrszenen auf der Autobahn eindrucksvoll in Szene gesetzt und vermitteln ein Gefühl von Kraft, Kontrolle und Freiheit. Der Film kombiniert ästhetische Bilder mit intensiver Bewegung und schafft so ein visuelles Erlebnis, das Emotionen weckt. Gleichzeitig dient er als starkes Referenzprojekt für hochwertige Automotive-Produktionen und unterstreicht unsere Fähigkeit, Performance und Stil perfekt zu vereinen.$pt$, 'imagefilm'::public.projekt_kategorie, ARRAY['imagefilm']::public.projekt_kategorie[], 'https://vimeo.com/1128870587', '/assets/img/thumbs/no-face-no-case.jpg', 'no-face-no-case', FALSE, 12 ),
  ( gen_random_uuid(), 'Excellence is my poison', 'Fashion Brand', $pt$Early-Access-Teaser für eine Streetwear-Marke: zurückhaltende Inszenierung und Launch-Vorfreude, ohne jedes Produktdetail zu zeigen. Bildsprache und Rhythmus transportieren den Marken-Vibe; der Schnitt bündelt Aufmerksamkeit für den Early Access. Passend für Website und Social, ohne laute Werbeformel.

In diesem Early-Access-Teaser-Imagefilm stand die Inszenierung der Streetwear-Marke im Mittelpunkt. Ziel war es, die Kleidung bewusst nur teilweise zu zeigen, um eine besondere Atmosphäre und Neugier zu erzeugen. Durch eine stilvolle und reduzierte Darstellung sollte der Vibe der Marke vermittelt werden, ohne jedes Detail der Produkte preiszugeben. Der Film dient dazu, die Marke emotional aufzuladen, Aufmerksamkeit zu erzeugen und potenzielle Kunden dazu zu motivieren, sich für den Early Access anzumelden und den Launch der Kollektion gespannt zu erwarten.$pt$, 'imagefilm'::public.projekt_kategorie, ARRAY['imagefilm']::public.projekt_kategorie[], 'https://vimeo.com/1176714430', '/assets/img/thumbs/eimp-early-access-trailer.jpg', 'eimp-early-access-trailer', FALSE, 13 ),
  ( gen_random_uuid(), 'GTR Rise of Godzilla', 'GTR', $pt$Hommage an die GTR-Ikone „Godzilla“: vom legendären R32 bis zum modernen R35; warum der Wagen weltweit Ehrfurcht auslöst. Tempo und Bildwahl unterstreichen Technik und Rennsport-DNA. Kompaktes Porträt für Fans und Neueinsteiger, geeignet für Social und Community-Auftritt.

„GTR Rise of Godzilla“ verbindet Nissan-GTR-Vergangenheit und Gegenwart; ikonische R32-Momente bis zum R35. Präziser Schnitt und Bildkomposition erzählen Mythos, Leistung und Motorsport-Erbe. Für YouTube und Events; emotionale Geschichte für alle, die „Godzilla“ neu entdecken oder feiern wollen.$pt$, 'imagefilm'::public.projekt_kategorie, ARRAY['imagefilm']::public.projekt_kategorie[], 'https://vimeo.com/1128610929', '/assets/img/thumbs/gtr-rise-of-godzilla.jpg', 'gtr-rise-of-godzilla', FALSE, 14 ),
  ( gen_random_uuid(), 'Racing Thrill', 'Leon', $pt$Imagefilm über Leon: Rennsport trotz Rückschlägen; Training, Fokus und Einsatz für Marke und Sponsoring. Wir zeigen Person und Disziplin authentisch, nicht nur Zeiten. Motivierend für Partner:innen, Social und Bewerbungen; dokumentarisch nah mit sauberem produktionstechnischen Finish.

Porträt eines Fahrers, der nach Rückschlägen dranbleibt: Training, mentale Stärke, klare Ziele. On- und Off-Track ergeben eine glaubwürdige Story für Sponsoren und Fans. Stärkt Außenauftritt und liefert Kampagnenmaterial; nah am Sport, professionell in Bild und Ton.$pt$, 'imagefilm'::public.projekt_kategorie, ARRAY['imagefilm']::public.projekt_kategorie[], 'https://vimeo.com/1085255672', '/assets/img/thumbs/racing-thrill.jpg', 'racing-thrill', FALSE, 15 ),
  ( gen_random_uuid(), 'Twitch Experience MotorSport Event', 'Großdölln - Juni 2026', $pt$Motorsport-Live-Event für Twitch: zehn Influencer, Onboards, mobile Tracking-Shots und stabile Live-Regie. Schnitte und Moderation halten Nähe und Spannung im Stream. Für Marken, die Motorsport und Gaming verbinden; mit messbarem Engagement und gleichbleibender Übertragungsqualität auf der Plattform.

Mit einem exklusiven und einmaligen Livestream direkt aus einem GT Masters Fahrzeug am Red Bull Ring haben wir Motorsport Content auf ein neues Produktionsniveau gehoben. Durch speziell integrierte Onboard Kameras, mobile Signaltechnik und eine hochstabile Live Regie konnten wir erstmals direkt aus dem Rennfahrzeug senden und die Perspektive des Fahrers authentisch erlebbar machen. Ergänzt wurde das Format durch Interviews mit DTM Legenden, die wir nahtlos in die Live Produktion integriert haben und so echten Mehrwert für Zuschauer und Partner geschaffen haben. Die Verbindung aus technischer Innovation, Zugang zu exklusiven Persönlichkeiten und unmittelbarer Rennatmosphäre schafft ein einzigartiges Erlebnis mit maximaler Strahlkraft. Als Produktionspartner liefern wir damit Premium Content, der sich klar vom Markt abhebt und neue Maßstäbe im Live Motorsport setzt.$pt$, 'event'::public.projekt_kategorie, ARRAY['social_media', 'event']::public.projekt_kategorie[], 'https://vimeo.com/1177391839', '/assets/img/thumbs/twitch-experience-motorsport-event.jpg', 'twitch-experience-motorsport-event', FALSE, 16 ),
  ( gen_random_uuid(), 'Twitch Experience Golf Event', 'Golfcity Pulheim', $pt$Golf-Live-Event auf Twitch: Turnier mit zehn Creator:innen, Multicam-Regie und ergänzenden Formaten wie Padel für Reichweite. Ruhige Moderation und Chat-Nähe halten die Session lebendig. Premium-Live-Content für Marken an Schnittstelle Lifestyle, Sport und Creator; ohne starre Traditionsübertragung.

Mit unserem Golf Live Event auf Twitch haben wir ein hochkarätiges Influencer Turnier mit zehn Creatorn erfolgreich in ein technisch anspruchsvolles Live-Format übersetzt. Die Produktion vereinte präzise Regie, stabile Multicam Setups und interaktive Zuschauerintegration zu einem nahtlosen Streaming Erlebnis auf Top Niveau. Ergänzend wurden weitere Sportformate wie Padel Tennis integriert, um Reichweite, Dynamik und Content Vielfalt gezielt zu steigern. Das Ergebnis ist ein skalierbares Eventkonzept, das Sport, Entertainment und Markeninszenierung effizient verbindet. Als Produktionspartner liefern wir damit nicht nur Content, sondern messbare Performance für Plattformen, Sponsoren und Communities.$pt$, 'event'::public.projekt_kategorie, ARRAY['social_media', 'event']::public.projekt_kategorie[], 'https://vimeo.com/1177388298', '/assets/img/thumbs/twitch-experience-golf-event.jpg', 'twitch-experience-golf-event', TRUE, 17 ),
  ( gen_random_uuid(), 'Twitch Experience Rad Tour', 'Hamburg → Lübeck', $pt$Bike-Live-Event für Twitch: 30 Influencer von Hamburg bis Lübeck, mobile Produktion und Live-Regie. Dynamische Perspektiven und stabile Signale machen Strecke und Gruppenstimmung spürbar. Outdoor-Storytelling mit skalierbarer Logistik; für langfristige Marken- und Plattform-Kooperationen mit Live-Fokus.

Mit unserem Bike Live Event haben wir 30 Influencer auf einer aufmerksamkeitsstarken Strecke von Hamburg nach Lübeck inszeniert und die gesamte Tour in ein hochwertiges Live Format für Twitch übersetzt. Durch mobile Produktionseinheiten, dynamische Kameraführung und eine stabile Live Regie konnten wir Bewegung, Landschaft und Community Gefühl in Echtzeit erlebbar machen. Die Kombination aus sportlicher Challenge, Storytelling entlang der Route und aktiver Zuschauer Integration sorgt für ein nachhaltiges Content Erlebnis über mehrere Plattformen hinweg.$pt$, 'event'::public.projekt_kategorie, ARRAY['social_media', 'event']::public.projekt_kategorie[], 'https://vimeo.com/1178199708', '/assets/img/thumbs/twitch-experience-rad-tour.jpg', 'twitch-experience-rad-tour', FALSE, 18 ),
  ( gen_random_uuid(), 'Pimp Your Ride Challenge', 'Breitenberg', $pt$„Pimp Your Ride Challenge“: Entertainment mit Spannungsbogen und Preisen bis 20.000 Euro. Kameras, Licht und Schnitt stützen die Challenges klar und dynamisch. Referenz für Show mit Publikum und Moderation; von Live-Regie bis schnellen Clips für Trailer und Social.

Dieses Projekt zeigt die Produktion des Formats „Pimp Your Ride Challenge“, bei dem Entertainment, Spannung und hochwertige Produktion aufeinandertreffen. In packenden Challenges treten Zuschauer gegeneinander an, beweisen ihr Können und haben die Chance, Preise von bis zu 20.000 Euro zu gewinnen. Der gezeigte Ausschnitt gibt einen authentischen Einblick in die Dynamik, Emotionen und Intensität des Formats. Gleichzeitig dient das Projekt als starkes Beispiel für unsere Fähigkeit, aufwendige Entertainment-Produktionen professionell und wirkungsvoll umzusetzen.$pt$, 'youtube'::public.projekt_kategorie, ARRAY['youtube']::public.projekt_kategorie[], 'https://vimeo.com/1178203344', NULL, 'pimp-your-ride-challenge-breitenberg', FALSE, 19 ),
  ( gen_random_uuid(), 'Giti Rennsport 24H Nürburgring 2025', 'Giti Rennsport & VS Racing', $pt$Social-Reel zum 24h-Rennen Nürburgring 2025 für Giti Rennsport und VS Racing: 30 Sekunden mit Rennszenen, Team und Erschöpfung im klaren Bogen. Für Feed und Stories optimiert; Motorsport authentisch, emotional dicht, gut teilbar für Kampagnen und Saison-Storys.

Dieses Projekt zeigt ein dynamisches Social-Media-Reel für Giti Rennsport und VS Racing, entstanden beim legendären 24-Stunden-Rennen am Nürburgring 2025. In einem kompakten 30-Sekunden-Edit verbinden sich intensive Rennszenen mit authentischen Momenten von Erschöpfung, Teamgeist und purer Leidenschaft. Das Reel transportiert die Energie und Härte des 24-Stunden-Rennens und ist gezielt für maximale Wirkung auf Social Media konzipiert. Gleichzeitig unterstreicht das Projekt unsere Stärke, emotionale Motorsport-Content-Formate schnell, hochwertig und aufmerksamkeitsstark umzusetzen.$pt$, 'social_media'::public.projekt_kategorie, ARRAY['social_media']::public.projekt_kategorie[], 'https://vimeo.com/1178201469', '/assets/img/thumbs/giti-rennsport-24h-nuerburgring-2025.jpg', 'giti-rennsport-24h-nuerburgring-2025', FALSE, 20 );

COMMIT;
