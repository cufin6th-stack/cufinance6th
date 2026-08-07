-- 1. Event registrations: own or staff only
DROP POLICY IF EXISTS "members read registrations" ON public.event_registrations;
CREATE POLICY "own or staff read registrations" ON public.event_registrations
FOR SELECT TO authenticated
USING (user_id = auth.uid() OR public.is_staff(auth.uid()));

-- Safe, PII-free summary for counts and member activity
CREATE OR REPLACE VIEW public.event_registrations_summary AS
SELECT id, event_id, profile_id, created_at
FROM public.event_registrations;

GRANT SELECT ON public.event_registrations_summary TO anon, authenticated;

-- 2. Notifications: audience-aware reads
DROP POLICY IF EXISTS "members read notifications" ON public.notifications;
CREATE POLICY "audience read notifications" ON public.notifications
FOR SELECT TO authenticated
USING (
  public.is_staff(auth.uid())
  OR audience = 'members'
  OR (
    audience = 'registered'
    AND event_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.event_registrations r
      WHERE r.event_id = notifications.event_id AND r.user_id = auth.uid()
    )
  )
);

-- 3. Media bucket: only staff or the uploader may list/sign objects
DROP POLICY IF EXISTS "media read authenticated" ON storage.objects;
CREATE POLICY "media read staff or owner" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'media' AND (public.is_staff(auth.uid()) OR owner = auth.uid()));
