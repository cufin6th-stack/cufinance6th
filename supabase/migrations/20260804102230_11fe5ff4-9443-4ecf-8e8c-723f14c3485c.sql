ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS finance_published boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS finance_note text;

CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text,
  event_id uuid REFERENCES public.events(id) ON DELETE SET NULL,
  audience text NOT NULL DEFAULT 'members',
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
GRANT SELECT ON public.notifications TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read notifications" ON public.notifications
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "staff manage notifications" ON public.notifications
  FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE TABLE public.site_content (
  key text PRIMARY KEY,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_content TO anon;
GRANT SELECT ON public.site_content TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.site_content TO authenticated;
GRANT ALL ON public.site_content TO service_role;
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "site content public" ON public.site_content
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "staff manage site content" ON public.site_content
  FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER trg_site_content_updated
  BEFORE UPDATE ON public.site_content
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP POLICY IF EXISTS "members read contributions" ON public.contributions;
CREATE POLICY "members read contributions" ON public.contributions
  FOR SELECT TO authenticated USING (
    public.is_staff(auth.uid())
    OR user_id = auth.uid()
    OR (
      status = 'verified'
      AND (
        event_id IS NULL
        OR EXISTS (SELECT 1 FROM public.events e WHERE e.id = contributions.event_id AND e.finance_published)
      )
    )
  );

DROP POLICY IF EXISTS "members read expenses" ON public.expenses;
CREATE POLICY "members read expenses" ON public.expenses
  FOR SELECT TO authenticated USING (
    public.is_staff(auth.uid())
    OR event_id IS NULL
    OR EXISTS (SELECT 1 FROM public.events e WHERE e.id = expenses.event_id AND e.finance_published)
  );

INSERT INTO public.site_content (key, data) VALUES
  ('home', '{"kicker":"Finance, 6th batch — University of Chittagong","title":"One batch, one record, kept by us.","body":"A living record of the Finance 6th batch: who we are, where we are, and what we are building together."}'::jsonb),
  ('about', '{"title":"About the batch","body":"We are the Finance 6th batch of the University of Chittagong. This site keeps our directory, gatherings and shared records in one place."}'::jsonb)
ON CONFLICT (key) DO NOTHING;
