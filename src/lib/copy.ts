import { queryOptions, useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";

export type Copy = Record<string, string>;

export const HOME_COPY: Copy = {
  intro_kicker: "About the batch",
  intro_title: "We were a class. Now we are a record.",
  intro_body1:
    "Our contact list used to live in a WhatsApp group where everything scrolls away. This site keeps it: who is where, what they do, and which events we ran.",
  intro_body2:
    "Membership is free and single-tier. One batch, everyone equal. WhatsApp stays for conversation; this is the permanent record.",
  cta_kicker: "Stay in the record",
  cta_title: "Every gathering, every headcount, kept properly.",
  cta_body:
    "Registration runs through this site, so organisers know exactly who is coming — and the batch keeps a permanent record of who was there.",
  cta_label: "Register for an event",
  cta_footnote: "Hathazari, Chattogram — since 2008",
};

export const ABOUT_COPY: Copy = {
  banner_title: "The sixth batch, on the record.",
  banner_lede:
    "Department of Finance, Faculty of Business Administration, University of Chittagong — a batch that decided its history was worth keeping properly.",
  story_kicker: "Our story",
  story_title: "From a corridor to a country-wide network",
  story_body:
    "We arrived on the Hathazari campus as strangers and left as a batch. Some of us stayed in Chattogram, many moved to Dhaka, and a good number now work abroad.\n\nFor years the batch lived inside a messaging group. It worked for a day and failed for a decade: numbers changed, photos expired and records scrolled away.\n\nThis site fixes that: a directory that stays current, an event register that produces real headcounts, member-only accounts kept for the batch, and an archive that will still be readable in twenty years.",
  principles_title: "Four rules that keep this place trustworthy.",
  principles:
    "One batch, one tier :: Membership is free and equal. No paid tiers, no donor badges, no ranking of members.\nAccountable to the batch :: Event accounts are documented and released to signed-in batchmates. Corrections are added as visible new entries.\nPrivacy where it matters :: The directory is public so the batch is findable. Phone numbers, emails and member activity appear only after a batchmate signs in.\nA record, not a feed :: No wall, no likes, no comment war. Conversation stays in WhatsApp; the durable record stays here.",
  care_title: "Volunteer caretakers, rotating by choice.",
  care_body:
    "A small group of batchmates hold admin and moderator access: they approve new members against the batch list, publish notices and events, and verify contributions. Anyone from the batch willing to take a turn is welcome to ask.",
};

export const PAGE_COPY: Record<string, Copy> = { home: HOME_COPY, about: ABOUT_COPY };

export const siteContentQuery = (key: string) =>
  queryOptions({
    queryKey: ["site-content", key],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_content").select("data").eq("key", key).maybeSingle();
      if (error) throw new Error(error.message);
      return ((data?.data ?? {}) as Copy) ?? {};
    },
  });

/** Page copy with database overrides applied on top of the built-in defaults. */
export function useCopy(key: "home" | "about"): Copy {
  const q = useQuery(siteContentQuery(key));
  const stored = q.data ?? {};
  const merged: Copy = { ...PAGE_COPY[key] };
  for (const [k, v] of Object.entries(stored)) if (typeof v === "string" && v.trim()) merged[k] = v;
  return merged;
}

export const paragraphs = (text: string) => text.split(/\n{2,}/).filter(Boolean);

export const pairs = (text: string) =>
  text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const [t, ...rest] = l.split("::");
      return { t: (t ?? "").trim(), d: rest.join("::").trim() };
    });
