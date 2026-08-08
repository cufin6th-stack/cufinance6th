import { queryOptions, useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";

export type Copy = Record<string, string>;

export type CopyField = {
  name: string;
  label: string;
  type: "text" | "textarea" | "image";
  default: string;
  hint?: string;
};

export type PageSchema = {
  key: string;
  label: string;
  group: string;
  note: string;
  fields: CopyField[];
};

const t = (name: string, label: string, def: string, hint?: string): CopyField => ({
  name,
  label,
  type: "text",
  default: def,
  ...(hint ? { hint } : {}),
});
const ta = (name: string, label: string, def: string, hint?: string): CopyField => ({
  name,
  label,
  type: "textarea",
  default: def,
  ...(hint ? { hint } : {}),
});
const img = (name: string, label: string, hint?: string): CopyField => ({
  name,
  label,
  type: "image",
  default: "",
  ...(hint ? { hint } : {}),
});

const banner = (kicker: string, title: string, lede: string): CopyField[] => [
  t("banner_kicker", "Banner kicker", kicker),
  t("banner_title", "Banner heading", title),
  ta("banner_lede", "Banner intro", lede),
  img("banner_image", "Banner background image", "Optional. Leave empty for the plain teal banner."),
];

export const PAGE_SCHEMAS: PageSchema[] = [
  {
    key: "site",
    label: "Header & footer",
    group: "Site design",
    note: "Applies to every page: the top bar, contact strip and the footer.",
    fields: [
      img("logo_image", "Logo image", "Optional. Replaces the “06” badge in the header and footer."),
      t("brand_badge", "Logo text (fallback)", "06"),
      t("brand_name", "Site name", "Finance 6th Batch"),
      t("brand_tagline", "Site tagline", "University of Chittagong · Alumni"),
      t("header_phone", "Header phone number", "+880 1711 000001"),
      t("facebook_url", "Facebook group link", "https://facebook.com/groups"),
      ta(
        "footer_about",
        "Footer description",
        "The alumni record of the sixth batch, Department of Finance, University of Chittagong. Built and owned by the batch — a permanent address for our people, our events and our accounts.",
      ),
      ta(
        "footer_address",
        "Footer address",
        "Department of Finance, Faculty of Business Administration\nUniversity of Chittagong, Hathazari, Chattogram 4331",
        "One line per row.",
      ),
      t("footer_links_title", "Footer links heading", "Site"),
      t("footer_contact_title", "Footer contact heading", "Contact"),
      ta(
        "footer_contacts",
        "Footer contact lines",
        "+880 1711 000001\n+880 1711 000007",
        "One phone number or email per line.",
      ),
      t("footer_hours", "Footer availability line", "Saturday–Thursday, 6pm–10pm"),
      t(
        "footer_copyright",
        "Footer copyright",
        "Finance 6th Batch Alumni, University of Chittagong.",
        "The year is added automatically in front of this.",
      ),
      t("footer_note", "Footer right-hand note", "Batch record · not a social network"),
    ],
  },
  {
    key: "home",
    label: "Home page",
    group: "Pages",
    note: "Hero imagery, the stat strip, the introduction block and the closing call to action.",
    fields: [
      img("hero_image", "Hero background image", "Shown behind the hero headline."),
      t("hero_kicker", "Hero kicker (fallback)", "Department of Finance · University of Chittagong"),
      t("hero_title", "Hero heading (fallback)", "Sixth Batch. One Address."),
      ta(
        "hero_body",
        "Hero text (fallback)",
        "A permanent, batch-owned home for our people, our events and every taka we raise together.",
      ),
      t("hero_cta_label", "Hero button label (fallback)", "Browse the directory"),
      t("stat_members", "Stat 1 label", "Members on record"),
      t("stat_cities", "Stat 2 label", "Cities worldwide"),
      t("stat_events", "Stat 3 label", "Events organised"),
      t("stat_years", "Stat 4 label", "Years as a batch"),
      img("intro_image", "Introduction image"),
      t("intro_kicker", "Introduction kicker", "About the batch"),
      t("intro_title", "Introduction heading", "We were a class. Now we are a record."),
      ta(
        "intro_body1",
        "Introduction paragraph 1",
        "Our contact list used to live in a WhatsApp group where everything scrolls away. This site keeps it: who is where, what they do, and which events we ran.",
      ),
      ta(
        "intro_body2",
        "Introduction paragraph 2",
        "Membership is free and single-tier. One batch, everyone equal. WhatsApp stays for conversation; this is the permanent record.",
      ),
      t("intro_cta_label", "Introduction button label", "See the directory"),
      t("events_title", "Events section heading", "Upcoming events"),
      t("events_title_past", "Events section heading (nothing upcoming)", "Recent events"),
      t("events_sub", "Events section subtitle", "Registration, headcount and accounts all run through this site."),
      t("notices_title", "Notice board heading", "Notice board"),
      t("notices_sub", "Notice board subtitle", "Deadlines and batch decisions."),
      t("news_title", "Batch news heading", "Batch news"),
      t("news_sub", "Batch news subtitle", "Promotions, achievements, condolences."),
      t("cta_kicker", "Closing kicker", "Stay in the record"),
      t("cta_title", "Closing heading", "Every gathering, every headcount, kept properly."),
      ta(
        "cta_body",
        "Closing text",
        "Registration runs through this site, so organisers know exactly who is coming — and the batch keeps a permanent record of who was there.",
      ),
      t("cta_label", "Closing button label", "Register for an event"),
      t("cta_footnote", "Closing footnote", "Hathazari, Chattogram — since 2008"),
    ],
  },
  {
    key: "about",
    label: "About page",
    group: "Pages",
    note: "The batch story, the working principles and the caretaker note.",
    fields: [
      t("banner_kicker", "Banner kicker", "About"),
      t("banner_title", "Banner heading", "The sixth batch, on the record."),
      ta(
        "banner_lede",
        "Banner intro",
        "Department of Finance, Faculty of Business Administration, University of Chittagong — a batch that decided its history was worth keeping properly.",
      ),
      img("banner_image", "Banner background image"),
      t("story_kicker", "Story kicker", "Our story"),
      t("story_title", "Story heading", "From a corridor to a country-wide network"),
      ta(
        "story_body",
        "Story text",
        "We arrived on the Hathazari campus as strangers and left as a batch. Some of us stayed in Chattogram, many moved to Dhaka, and a good number now work abroad.\n\nFor years the batch lived inside a messaging group. It worked for a day and failed for a decade: numbers changed, photos expired and records scrolled away.\n\nThis site fixes that: a directory that stays current, an event register that produces real headcounts, member-only accounts kept for the batch, and an archive that will still be readable in twenty years.",
        "Leave a blank line between paragraphs.",
      ),
      img("story_image", "Story image"),
      t("principles_kicker", "Principles kicker", "How we work"),
      t("principles_title", "Principles heading", "Four rules that keep this place trustworthy."),
      ta(
        "principles",
        "Principles list",
        "One batch, one tier :: Membership is free and equal. No paid tiers, no donor badges, no ranking of members.\nAccountable to the batch :: Event accounts are documented and released to signed-in batchmates. Corrections are added as visible new entries.\nPrivacy where it matters :: The directory is public so the batch is findable. Phone numbers, emails and member activity appear only after a batchmate signs in.\nA record, not a feed :: No wall, no likes, no comment war. Conversation stays in WhatsApp; the durable record stays here.",
        "One rule per line, written as “Title :: description”.",
      ),
      t("care_kicker", "Caretaker kicker", "Who runs it"),
      t("care_title", "Caretaker heading", "Volunteer caretakers, rotating by choice."),
      ta(
        "care_body",
        "Caretaker text",
        "A small group of batchmates hold admin and moderator access: they approve new members against the batch list, publish notices and events, and verify contributions. Anyone from the batch willing to take a turn is welcome to ask.",
      ),
      t("care_cta_label", "Caretaker button label", "Get in touch"),
    ],
  },
  {
    key: "members",
    label: "Directory page",
    group: "Pages",
    note: "Banner text above the member directory.",
    fields: banner(
      "Directory",
      "Every batchmate, one searchable list.",
      "Names, professions and cities are open to everyone. Phone numbers, email addresses and member activity appear only when a batchmate signs in.",
    ),
  },
  {
    key: "events",
    label: "Events page",
    group: "Pages",
    note: "Banner text above the event list.",
    fields: banner(
      "Events",
      "We still show up for each other.",
      "Every gathering is registered here, so the cook knows the headcount and the batch knows the cost.",
    ),
  },
  {
    key: "notices",
    label: "Notices page",
    group: "Pages",
    note: "Banner text above the notice board.",
    fields: banner(
      "Notices",
      "Decisions, deadlines and dues.",
      "If it matters to the batch, it is written down here with a date on it.",
    ),
  },
  {
    key: "news",
    label: "News page",
    group: "Pages",
    note: "Banner text above the batch news list.",
    fields: banner(
      "News",
      "What our people are doing.",
      "Promotions, degrees, new ventures — and the losses we mark together.",
    ),
  },
  {
    key: "gallery",
    label: "Gallery page",
    group: "Pages",
    note: "Banner text above the photo albums.",
    fields: banner(
      "Gallery",
      "Proof that we were there.",
      "Photographs from the campus years and every gathering since, kept where they will not disappear.",
    ),
  },
  {
    key: "contact",
    label: "Contact page",
    group: "Pages",
    note: "Banner text above the contact form.",
    fields: [
      ...banner(
        "Contact",
        "Talk to the caretakers.",
        "Membership questions, event help, corrections to the ledger — anything that needs a human.",
      ),
      t("form_title", "Message form heading", "Send a message"),
      t("direct_title", "Direct lines heading", "Direct lines"),
      ta(
        "phones",
        "Phone lines",
        "+880 1711 000001 :: Convener · Saturday–Thursday, 6pm–10pm\n+880 1711 000007 :: Treasurer · ledger and payments",
        "One per line, written as “number :: role”.",
      ),
      t("email", "Email address", "finance06.cu@gmail.com"),
      ta(
        "address",
        "Postal address",
        "Department of Finance, University of Chittagong, Hathazari, Chattogram 4331",
      ),
      t("facebook_label", "Facebook link label", "Batch Facebook group"),
      t("facebook_url", "Facebook link", "https://facebook.com/groups"),
    ],
  },
  {
    key: "privacy",
    label: "Privacy page",
    group: "Pages",
    note: "Banner text above the privacy summary.",
    fields: banner(
      "Privacy",
      "Public where it helps. Private where it matters.",
      "A plain-language summary of what this site shows, to whom, and what you can change.",
    ),
  },
  {
    key: "funds",
    label: "Batch accounts page",
    group: "Member pages",
    note: "Banner text on the member-only accounts page.",
    fields: banner(
      "Open books",
      "Every taka, on the record.",
      "Contributions appear once an admin has verified the payment. Nothing is ever deleted — a mistake is corrected with a new, visible entry.",
    ),
  },
  {
    key: "contribute",
    label: "Contribution page",
    group: "Member pages",
    note: "Banner text on the contribution form page.",
    fields: banner(
      "Batch fund",
      "Log your contribution.",
      "Fill in the payment details you already made. An admin verifies every entry before it appears on the ledger.",
    ),
  },
  {
    key: "notifications",
    label: "Member updates page",
    group: "Member pages",
    note: "Banner text on the member updates page.",
    fields: banner(
      "Members only",
      "Updates from the caretakers.",
      "Announcements, reminders and released event statements — sent to signed-in batchmates.",
    ),
  },
];

export const SCHEMA_BY_KEY: Record<string, PageSchema> = Object.fromEntries(
  PAGE_SCHEMAS.map((s) => [s.key, s]),
);

const defaultsOf = (s: PageSchema): Copy =>
  Object.fromEntries(s.fields.map((f) => [f.name, f.default])) as Copy;

export const PAGE_COPY: Record<string, Copy> = Object.fromEntries(
  PAGE_SCHEMAS.map((s) => [s.key, defaultsOf(s)]),
);

export const siteContentQuery = (key: string) =>
  queryOptions({
    queryKey: ["site-content", key],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_content").select("data").eq("key", key).maybeSingle();
      if (error) throw new Error(error.message);
      return (data?.data ?? {}) as Copy;
    },
  });

/** Page copy with database overrides applied on top of the built-in defaults. */
export function useCopy(key: string): Copy {
  const q = useQuery(siteContentQuery(key));
  const stored = q.data ?? {};
  const merged: Copy = { ...(PAGE_COPY[key] ?? {}) };
  for (const [k, v] of Object.entries(stored)) if (typeof v === "string" && v.trim()) merged[k] = v;
  return merged;
}

export const paragraphs = (text: string) => text.split(/\n{2,}/).filter(Boolean);

export const lines = (text: string) =>
  text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

export const pairs = (text: string) =>
  text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const [t, ...rest] = l.split("::");
      return { t: (t ?? "").trim(), d: rest.join("::").trim() };
    });
