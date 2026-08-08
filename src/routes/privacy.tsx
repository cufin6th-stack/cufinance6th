import { createFileRoute } from "@tanstack/react-router";

import { CopyBanner } from "@/components/layout";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy policy — Finance 6th Batch Alumni, CU" },
      {
        name: "description",
        content:
          "What the Finance 6th batch alumni site publishes publicly, what stays behind member sign-in, and how to have your details corrected or removed.",
      },
      { property: "og:title", content: "Privacy policy — Finance 6th Batch Alumni, CU" },
      { property: "og:description", content: "How member data is handled on the Finance 6th batch site." },
    ],
  }),
  component: Privacy,
});

const SECTIONS = [
  {
    h: "What is public",
    p: "Name, nickname, photograph, profession, organisation, field of work, city and country of every approved member are visible to anyone. This is deliberate: it makes the batch findable and verifiable.",
  },
  {
    h: "What requires sign-in",
    p: "Phone numbers, WhatsApp numbers, email addresses, blood group, birthday, roll and section, and member activity (event registrations and verified contributions) are visible only to signed-in, approved batchmates.",
  },
  {
    h: "What you control",
    p: "You can edit your own profile at any time, and you can hide your phone number from other members with a single switch. Ask an admin to remove your listing entirely and it will be removed.",
  },
  {
    h: "Financial records",
    p: "The fund ledger is public by design, including the contributing member's name and the amount. If you would rather contribute anonymously, tell the treasurer before paying and the entry will be recorded without your name.",
  },
  {
    h: "What we do not do",
    p: "No advertising, no analytics profiling, no selling or sharing of the directory with third parties, and no bulk export of contact details by ordinary members.",
  },
  {
    h: "Corrections and removal",
    p: "Write to the admins through the contact page. Corrections are made promptly; ledger entries are never silently edited — a correcting entry is added so the history stays honest.",
  },
];

function Privacy() {
  return (
    <>
      <CopyBanner page="privacy" />
      <section className="wrap max-w-[72ch] py-14">
        <div className="space-y-9">
          {SECTIONS.map((s) => (
            <div key={s.h}>
              <h2 className="text-[20px]">{s.h}</h2>
              <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{s.p}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
