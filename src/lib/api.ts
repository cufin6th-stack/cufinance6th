import { queryOptions } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";

const must = <T,>(r: { data: T | null; error: { message: string } | null }): T => {
  if (r.error) throw new Error(r.error.message);
  return (r.data ?? []) as T;
};

export type PublicMember = {
  id: string;
  full_name: string;
  nickname: string | null;
  avatar_url: string | null;
  job_title: string | null;
  organization: string | null;
  field: string | null;
  city: string | null;
  country: string | null;
  created_at: string;
};

export type EventRow = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  description: string | null;
  cover_url: string | null;
  event_date: string;
  venue: string | null;
  map_url: string | null;
  fee_single: number | null;
  fee_couple: number | null;
  fee_child: number | null;
  goal_amount: number | null;
  contact_info: string | null;
  status: string;
  finance_published: boolean;
  finance_note: string | null;
};

export const statsQuery = queryOptions({
  queryKey: ["public-stats"],
  queryFn: async () => {
    const { data, error } = await supabase.rpc("public_stats");
    if (error) throw new Error(error.message);
    return data as { members: number; cities: number; events: number; funds: number };
  },
});

export const sliderQuery = queryOptions({
  queryKey: ["slider"],
  queryFn: async () =>
    must(
      await supabase
        .from("home_slider")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true }),
    ),
});

export const eventsQuery = queryOptions({
  queryKey: ["events"],
  queryFn: async () =>
    must<EventRow[]>(await supabase.from("events").select("*").order("event_date", { ascending: false })),
});

export const eventQuery = (slug: string) =>
  queryOptions({
    queryKey: ["event", slug],
    queryFn: async () => {
      const { data, error } = await supabase.from("events").select("*").eq("slug", slug).maybeSingle();
      if (error) throw new Error(error.message);
      return data as EventRow | null;
    },
  });

export const publicMembersQuery = queryOptions({
  queryKey: ["members-public"],
  queryFn: async () =>
    must<unknown>(
      await supabase.from("members_public").select("*").order("full_name", { ascending: true }),
    ) as PublicMember[],
});

export const fullMembersQuery = queryOptions({
  queryKey: ["members-full"],
  queryFn: async () =>
    must(
      await supabase
        .from("profiles")
        .select("*")
        .eq("is_approved", true)
        .order("full_name", { ascending: true }),
    ),
});

export const noticesQuery = queryOptions({
  queryKey: ["notices"],
  queryFn: async () =>
    must(
      await supabase
        .from("notices")
        .select("*")
        .order("is_pinned", { ascending: false })
        .order("published_at", { ascending: false }),
    ),
});

export const postsQuery = queryOptions({
  queryKey: ["posts"],
  queryFn: async () =>
    must(await supabase.from("posts").select("*").order("published_at", { ascending: false })),
});

export const albumsQuery = queryOptions({
  queryKey: ["albums"],
  queryFn: async () =>
    must(await supabase.from("gallery_albums").select("*, gallery_photos(*)").order("created_at")),
});

export const contributionsQuery = queryOptions({
  queryKey: ["contributions"],
  queryFn: async () =>
    must(
      await supabase
        .from("contributions")
        .select("*, profiles(id, full_name, avatar_url), events(slug, title)")
        .order("created_at", { ascending: false }),
    ),
});

export const expensesQuery = queryOptions({
  queryKey: ["expenses"],
  queryFn: async () =>
    must(
      await supabase
        .from("expenses")
        .select("*, events(slug, title)")
        .order("spent_on", { ascending: false }),
    ),
});

export const registrationsQuery = queryOptions({
  queryKey: ["registrations"],
  queryFn: async () =>
    must(
      await supabase
        .from("event_registrations")
        .select("*, profiles(id, full_name, phone, email), events(slug, title)")
        .order("created_at", { ascending: false }),
    ),
});

export const registrationCountQuery = (eventId: string | undefined) =>
  queryOptions({
    queryKey: ["registration-count", eventId],
    enabled: !!eventId,
    queryFn: async () => {
      const { count, error } = await supabase
        .from("event_registrations")
        .select("id", { count: "exact", head: true })
        .eq("event_id", eventId!);
      if (error) throw new Error(error.message);
      return count ?? 0;
    },
  });

export const pendingProfilesQuery = queryOptions({
  queryKey: ["pending-profiles"],
  queryFn: async () =>
    must(
      await supabase
        .from("profiles")
        .select("*")
        .eq("is_approved", false)
        .order("created_at", { ascending: false }),
    ),
});

export const allProfilesQuery = queryOptions({
  queryKey: ["all-profiles"],
  queryFn: async () =>
    must(await supabase.from("profiles").select("*").order("full_name", { ascending: true })),
});

export const messagesQuery = queryOptions({
  queryKey: ["messages"],
  queryFn: async () =>
    must(await supabase.from("contact_messages").select("*").order("created_at", { ascending: false })),
});

export const rolesQuery = queryOptions({
  queryKey: ["all-roles"],
  queryFn: async () => must(await supabase.from("user_roles").select("*")),
});
