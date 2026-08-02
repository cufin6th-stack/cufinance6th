-- ============ ROLES ============
CREATE TYPE public.app_role AS ENUM ('admin','moderator','member');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('admin','moderator'))
$$;

CREATE POLICY "own roles readable" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "admins manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ============ PROFILES ============
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name text NOT NULL,
  nickname text,
  avatar_url text,
  job_title text,
  organization text,
  field text,
  city text,
  country text,
  phone text,
  whatsapp text,
  email text,
  facebook_url text,
  linkedin_url text,
  blood_group text,
  birth_day int,
  birth_month int,
  bio text,
  section text,
  roll text,
  hide_phone boolean NOT NULL DEFAULT false,
  is_approved boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "members read approved profiles" ON public.profiles FOR SELECT TO authenticated
  USING (is_approved = true OR user_id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "insert own profile" ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "update own profile" ON public.profiles FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins delete profiles" ON public.profiles FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'admin'));

-- guard: only admins can flip approval
CREATE OR REPLACE FUNCTION public.guard_profile_approval()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.is_approved IS DISTINCT FROM OLD.is_approved AND NOT public.has_role(auth.uid(),'admin') THEN
    NEW.is_approved := OLD.is_approved;
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END; $$;
CREATE TRIGGER trg_guard_profile_approval BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.guard_profile_approval();

-- public safe view (no contact info)
CREATE VIEW public.members_public
WITH (security_invoker = off) AS
SELECT id, full_name, nickname, avatar_url, job_title, organization, field, city, country, created_at
FROM public.profiles WHERE is_approved = true;
GRANT SELECT ON public.members_public TO anon, authenticated;

-- auto profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email,'@',1)), NEW.email)
  ON CONFLICT (user_id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'member') ON CONFLICT DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ EVENTS ============
CREATE TABLE public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  summary text,
  description text,
  cover_url text,
  event_date timestamptz NOT NULL,
  venue text,
  map_url text,
  fee_single numeric(12,2) DEFAULT 0,
  fee_couple numeric(12,2) DEFAULT 0,
  fee_child numeric(12,2) DEFAULT 0,
  goal_amount numeric(12,2),
  contact_info text,
  status text NOT NULL DEFAULT 'published',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.events TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.events TO authenticated;
GRANT ALL ON public.events TO service_role;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "published events public" ON public.events FOR SELECT TO anon, authenticated USING (status = 'published' OR public.is_staff(auth.uid()));
CREATE POLICY "staff manage events" ON public.events FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- ============ REGISTRATIONS ============
CREATE TABLE public.event_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  attend_type text NOT NULL DEFAULT 'single',
  guests int NOT NULL DEFAULT 0,
  tshirt_size text,
  food_pref text,
  total_amount numeric(12,2) NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.event_registrations TO authenticated;
GRANT ALL ON public.event_registrations TO service_role;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read registrations" ON public.event_registrations FOR SELECT TO authenticated USING (true);
CREATE POLICY "members register self" ON public.event_registrations FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "staff manage registrations" ON public.event_registrations FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- ============ CONTRIBUTIONS ============
CREATE TABLE public.contributions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES public.events(id) ON DELETE SET NULL,
  profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  amount numeric(12,2) NOT NULL,
  method text NOT NULL DEFAULT 'bKash',
  trx_id text,
  proof_url text,
  status text NOT NULL DEFAULT 'pending',
  note text,
  verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contributions TO authenticated;
GRANT ALL ON public.contributions TO service_role;
ALTER TABLE public.contributions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read contributions" ON public.contributions FOR SELECT TO authenticated
  USING (status = 'verified' OR user_id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "members add own contribution" ON public.contributions FOR INSERT TO authenticated
  WITH CHECK ((user_id = auth.uid() AND status = 'pending') OR public.is_staff(auth.uid()));
CREATE POLICY "admins manage contributions" ON public.contributions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE OR REPLACE FUNCTION public.guard_contribution_status()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status AND NOT public.has_role(auth.uid(),'admin') THEN
    NEW.status := OLD.status;
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER trg_guard_contribution_status BEFORE UPDATE ON public.contributions
  FOR EACH ROW EXECUTE FUNCTION public.guard_contribution_status();

-- ============ EXPENSES ============
CREATE TABLE public.expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES public.events(id) ON DELETE SET NULL,
  category text NOT NULL,
  description text,
  amount numeric(12,2) NOT NULL,
  receipt_url text,
  spent_on date NOT NULL DEFAULT current_date,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.expenses TO authenticated;
GRANT ALL ON public.expenses TO service_role;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read expenses" ON public.expenses FOR SELECT TO authenticated USING (true);
CREATE POLICY "admins manage expenses" ON public.expenses FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ============ CONTENT ============
CREATE TABLE public.notices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text,
  attachment_url text,
  is_pinned boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'published',
  published_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.notices TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notices TO authenticated;
GRANT ALL ON public.notices TO service_role;
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "published notices public" ON public.notices FOR SELECT TO anon, authenticated USING (status = 'published' OR public.is_staff(auth.uid()));
CREATE POLICY "staff manage notices" ON public.notices FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE TABLE public.posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  excerpt text,
  body text,
  cover_url text,
  category text,
  status text NOT NULL DEFAULT 'published',
  published_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.posts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.posts TO authenticated;
GRANT ALL ON public.posts TO service_role;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "published posts public" ON public.posts FOR SELECT TO anon, authenticated USING (status = 'published' OR public.is_staff(auth.uid()));
CREATE POLICY "staff manage posts" ON public.posts FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE TABLE public.gallery_albums (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  description text,
  cover_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.gallery_albums TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.gallery_albums TO authenticated;
GRANT ALL ON public.gallery_albums TO service_role;
ALTER TABLE public.gallery_albums ENABLE ROW LEVEL SECURITY;
CREATE POLICY "albums public" ON public.gallery_albums FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "staff manage albums" ON public.gallery_albums FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE TABLE public.gallery_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  album_id uuid NOT NULL REFERENCES public.gallery_albums(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  caption text,
  sort_order int NOT NULL DEFAULT 0
);
GRANT SELECT ON public.gallery_photos TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.gallery_photos TO authenticated;
GRANT ALL ON public.gallery_photos TO service_role;
ALTER TABLE public.gallery_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "photos public" ON public.gallery_photos FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "staff manage photos" ON public.gallery_photos FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE TABLE public.home_slider (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text,
  kicker text,
  title text NOT NULL,
  description text,
  cta_label text,
  cta_url text,
  sort_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true
);
GRANT SELECT ON public.home_slider TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.home_slider TO authenticated;
GRANT ALL ON public.home_slider TO service_role;
ALTER TABLE public.home_slider ENABLE ROW LEVEL SECURITY;
CREATE POLICY "slider public" ON public.home_slider FOR SELECT TO anon, authenticated USING (is_active OR public.is_staff(auth.uid()));
CREATE POLICY "staff manage slider" ON public.home_slider FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE TABLE public.announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message text NOT NULL,
  link_url text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.announcements TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.announcements TO authenticated;
GRANT ALL ON public.announcements TO service_role;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "announcements public" ON public.announcements FOR SELECT TO anon, authenticated USING (is_active OR public.is_staff(auth.uid()));
CREATE POLICY "staff manage announcements" ON public.announcements FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE TABLE public.contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  message text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.contact_messages TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contact_messages TO authenticated;
GRANT ALL ON public.contact_messages TO service_role;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can send message" ON public.contact_messages FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "staff read messages" ON public.contact_messages FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "staff manage messages" ON public.contact_messages FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- ============ PUBLIC STATS ============
CREATE OR REPLACE FUNCTION public.public_stats()
RETURNS json LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT json_build_object(
    'members', (SELECT count(*) FROM public.profiles WHERE is_approved),
    'cities', (SELECT count(DISTINCT city) FROM public.profiles WHERE is_approved AND city IS NOT NULL),
    'events', (SELECT count(*) FROM public.events WHERE status='published'),
    'funds', (SELECT COALESCE(sum(amount),0) FROM public.contributions WHERE status='verified')
  )
$$;
GRANT EXECUTE ON FUNCTION public.public_stats() TO anon, authenticated;

-- ============ SEED ============
INSERT INTO public.announcements (message, link_url) VALUES
  ('Reunion 2026 registration is now open — deadline 30 September.', '/events');

INSERT INTO public.home_slider (kicker, title, description, cta_label, cta_url, sort_order) VALUES
  ('Department of Finance · University of Chittagong', 'Sixth Batch. One Address.', 'A permanent, batch-owned home for our people, our events and every taka we raise together.', 'Browse the directory', '/members', 1),
  ('Reunion 2026', 'We meet again in December', 'Two days in Chittagong — campus walk, dinner and the batch photo we keep postponing.', 'See the event', '/events', 2),
  ('Open books', 'Every taka on the record', 'Contributions and expenses published line by line, with receipts. No verbal accounting.', 'Open the ledger', '/funds', 3);

INSERT INTO public.profiles (full_name, nickname, job_title, organization, field, city, country, phone, whatsapp, email, blood_group, birth_day, birth_month, section, roll, bio, is_approved) VALUES
  ('Ahsan Habib','Habib','Senior Principal Officer','Islami Bank Bangladesh','Banking','Dhaka','Bangladesh','+8801711000001','+8801711000001','ahsan.habib@example.com','B+',14,3,'A','601','Started in retail banking, now leads the SME desk.',true),
  ('Farzana Rahman','Farzana','Assistant Professor','University of Chittagong','Academia','Chattogram','Bangladesh','+8801711000002','+8801711000002','farzana.rahman@example.com','O+',2,7,'B','612','Teaches corporate finance at the same department we graduated from.',true),
  ('Mahmudul Hasan','Mahmud','Finance Manager','Grameenphone','Corporate','Dhaka','Bangladesh','+8801711000003','+8801711000003','mahmudul.hasan@example.com','A+',21,11,'A','604','Handles treasury and FX exposure.',true),
  ('Nusrat Jahan','Nusrat','Investment Analyst','IDLC Finance','Banking','Dhaka','Bangladesh','+8801711000004','+8801711000004','nusrat.jahan@example.com','AB+',9,1,'B','625','Equity research, energy sector coverage.',true),
  ('Tanvir Ahmed','Tanvir','Deputy Commissioner of Taxes','National Board of Revenue','Government','Sylhet','Bangladesh','+8801711000005','+8801711000005','tanvir.ahmed@example.com','B+',30,5,'A','608','BCS 34th batch, taxation cadre.',true),
  ('Sumaiya Akter','Sumi','Data Analyst','Standard Chartered','Banking','Singapore','Singapore','+6581000006','+6581000006','sumaiya.akter@example.com','O-',17,9,'B','630','Moved to Singapore in 2019.',true),
  ('Rakibul Islam','Rakib','Managing Director','Islam Trading House','Business','Chattogram','Bangladesh','+8801711000007','+8801711000007','rakibul.islam@example.com','A-',5,2,'A','617','Family import business, third generation.',true),
  ('Ishrat Binte Karim','Ishrat','Audit Senior','KPMG Bangladesh','Corporate','Dhaka','Bangladesh','+8801711000008','+8801711000008','ishrat.karim@example.com','B-',26,8,'B','633','Chartered accountant, finishing articleship.',true),
  ('Shahriar Kabir','Shahriar','Software Engineer','Optimizely','Engineering','Toronto','Canada','+14160000009','+14160000009','shahriar.kabir@example.com','O+',11,12,'A','640','Switched from finance to software in 2016.',true),
  ('Mehedi Hassan','Mehedi','Branch Manager','Dutch-Bangla Bank','Banking','Cox''s Bazar','Bangladesh','+8801711000010','+8801711000010','mehedi.hassan@example.com','A+',3,6,'B','645','Runs the Cox''s Bazar branch.',true),
  ('Rumana Parvin','Rumana','Lecturer','Chittagong Independent University','Academia','Chattogram','Bangladesh','+8801711000011','+8801711000011','rumana.parvin@example.com','AB-',19,4,'A','650','Also does CFA prep coaching.',true),
  ('Kazi Nazmul Huda','Nazmul','Consultant','Deloitte Middle East','Expatriate','Dubai','UAE','+9715000012','+9715000012','nazmul.huda@example.com','B+',8,10,'B','655','Risk advisory practice.',true);

INSERT INTO public.events (slug, title, summary, description, event_date, venue, map_url, fee_single, fee_couple, fee_child, goal_amount, contact_info, status) VALUES
  ('reunion-2026','Sixth Batch Reunion 2026','Two days on campus and in the city — the full batch, finally in one frame.','Day one is a campus walk, department visit and an evening at the Faculty club. Day two is a full-day programme at a city venue: lunch, cultural session, batch photo and the annual accounts presentation. Bring family — children under ten are free of charge.','2026-12-18 10:00:00+06','Faculty of Business Administration, University of Chittagong','https://maps.google.com/?q=University+of+Chittagong','2500','4000','1200','450000','Ahsan Habib +8801711000001 · Rakibul Islam +8801711000007','published'),
  ('iftar-mahfil-2026','Batch Iftar Mahfil','An evening iftar for members based in and around Dhaka.','A simple sit-down iftar at a Dhanmondi restaurant. Registration helps us confirm the headcount three days in advance.','2026-03-14 17:30:00+06','Dhanmondi 27, Dhaka','https://maps.google.com/?q=Dhanmondi+27+Dhaka','1200','2000','600','120000','Mahmudul Hasan +8801711000003','published'),
  ('picnic-2025','Winter Picnic 2025','A day trip to Bhatiary with families.','Bus from Chattogram city at 8am, lunch on site, games for children, back by evening. Fully accounted for in the ledger.','2025-01-24 08:00:00+06','Bhatiary Golf & Country Club, Chattogram','https://maps.google.com/?q=Bhatiary','1500','2600','800','180000','Rakibul Islam +8801711000007','published');

INSERT INTO public.contributions (event_id, profile_id, amount, method, trx_id, status, verified_at, created_at)
SELECT e.id, p.id, v.amount, v.method, v.trx, v.status, CASE WHEN v.status='verified' THEN now() END, now() - (v.days || ' days')::interval
FROM (VALUES
  ('picnic-2025','Ahsan Habib',1500,'bKash','TRX8842001','verified',210),
  ('picnic-2025','Farzana Rahman',2600,'Nagad','TRX8842002','verified',208),
  ('picnic-2025','Rakibul Islam',1500,'Cash','TRX8842003','verified',205),
  ('picnic-2025','Mehedi Hassan',2600,'bKash','TRX8842004','verified',202),
  ('picnic-2025','Rumana Parvin',1500,'bKash','TRX8842005','verified',200),
  ('reunion-2026','Ahsan Habib',4000,'bKash','TRX9930011','verified',24),
  ('reunion-2026','Mahmudul Hasan',2500,'bKash','TRX9930012','verified',22),
  ('reunion-2026','Nusrat Jahan',2500,'Nagad','TRX9930013','verified',20),
  ('reunion-2026','Tanvir Ahmed',4000,'Bank transfer','TRX9930014','verified',18),
  ('reunion-2026','Sumaiya Akter',2500,'Bank transfer','TRX9930015','verified',15),
  ('reunion-2026','Ishrat Binte Karim',2500,'bKash','TRX9930016','pending',4),
  ('reunion-2026','Shahriar Kabir',4000,'Bank transfer','TRX9930017','pending',2)
) AS v(slug,member,amount,method,trx,status,days)
JOIN public.events e ON e.slug = v.slug
JOIN public.profiles p ON p.full_name = v.member;

INSERT INTO public.expenses (event_id, category, description, amount, spent_on)
SELECT e.id, v.cat, v.descr, v.amount, v.d::date
FROM (VALUES
  ('picnic-2025','Food','Lunch and snacks for 78 people',46800,'2025-01-24'),
  ('picnic-2025','Transport','Two buses, Chattogram to Bhatiary return',18000,'2025-01-24'),
  ('picnic-2025','Venue','Day rental of the lawn',12000,'2025-01-22'),
  ('picnic-2025','Gifts','Prizes for children''s games',6500,'2025-01-23'),
  ('reunion-2026','Venue','Advance booking, city venue',60000,'2026-06-10'),
  ('reunion-2026','Printing','Invitation cards and banners',14500,'2026-07-02')
) AS v(slug,cat,descr,amount,d)
JOIN public.events e ON e.slug = v.slug;

INSERT INTO public.event_registrations (event_id, profile_id, attend_type, guests, total_amount, tshirt_size)
SELECT e.id, p.id, v.t, v.g, v.amt, v.sz
FROM (VALUES
  ('reunion-2026','Ahsan Habib','couple',1,4000,'L'),
  ('reunion-2026','Mahmudul Hasan','single',0,2500,'M'),
  ('reunion-2026','Nusrat Jahan','single',0,2500,'S'),
  ('reunion-2026','Tanvir Ahmed','family',3,4000,'XL'),
  ('reunion-2026','Sumaiya Akter','single',0,2500,'M')
) AS v(slug,member,t,g,amt,sz)
JOIN public.events e ON e.slug = v.slug
JOIN public.profiles p ON p.full_name = v.member;

INSERT INTO public.notices (title, body, is_pinned, published_at) VALUES
  ('Reunion 2026 registration deadline: 30 September','Register through the site so the headcount, t-shirt sizes and food count are accurate. Late registrations cannot be guaranteed a seat at the dinner.', true, now() - interval '3 days'),
  ('Directory data drive','If your workplace or city changed, update your own profile. Volunteers will call anyone whose record is still blank after 15 September.', false, now() - interval '12 days'),
  ('Picnic 2025 accounts published','The full income and expense statement for the winter picnic is now on the funds page, with receipts attached.', false, now() - interval '40 days');

INSERT INTO public.posts (slug, title, excerpt, body, category, published_at) VALUES
  ('farzana-rahman-joins-cu-faculty','Farzana Rahman joins the Finance faculty','Our batchmate returns to the department as Assistant Professor.','After completing her MPhil, Farzana Rahman has joined the Department of Finance at the University of Chittagong as Assistant Professor — the first from our batch to teach where we studied.','Achievement', now() - interval '20 days'),
  ('tanvir-ahmed-promoted','Tanvir Ahmed promoted to Deputy Commissioner of Taxes','A promotion within the taxation cadre, effective this month.','Tanvir Ahmed has been promoted to Deputy Commissioner of Taxes and posted to Sylhet. He has served in the taxation cadre since 2015.','Achievement', now() - interval '55 days'),
  ('condolence-note','In memory of our teacher, Professor A. K. Azad','The department lost a teacher who taught almost all of us.','Professor A. K. Azad, who taught Financial Management to our batch, passed away last month. A condolence gathering will be held during the reunion programme.','Condolence', now() - interval '70 days');

INSERT INTO public.gallery_albums (slug, title, description) VALUES
  ('picnic-2025','Winter Picnic 2025','Bhatiary, January 2025.'),
  ('campus-days','Campus Days','Scanned photographs from our years on campus.');