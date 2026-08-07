REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.guard_profile_approval() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.guard_contribution_status() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.public_stats() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.public_stats() TO anon, authenticated;
