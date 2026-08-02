import { createFileRoute, Link } from "@tanstack/react-router";

import reunion from "@/assets/reunion.jpg";
import hero from "@/assets/hero-campus.jpg";
import { PageBanner } from "@/components/layout";
import { Btn, Card } from "@/components/ui";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About the batch — Finance 6th Batch Alumni, CU" },
      {
        name: "description",
        content:
          "Who we are: the sixth batch of the Department of Finance, University of Chittagong — one batch, one tier, open books and a permanent record.",
      },
      { property: "og:title", content: "About the batch — Finance 6th Batch Alumni, CU" },
      {
        property: "og:description",
        content:
          "The story, principles and working rules of the Finance 6th batch alumni body at the University of Chittagong.",
      },
    ],
  }),
  component: About,
});

const PRINCIPLES = [
  {
    t: "One batch, one tier",
    d: "Membership is free and equal. There are no paid tiers, no donor badges and no ranking of members. Admins are caretakers, not a class above.",
  },
  {
    t: "Open books by default",
    d: "Every contribution and every expense is published on a public ledger. Entries are corrected by adding a visible new entry, never by deletion.",
  },
  {
    t: "Privacy where it matters",
    d: "The directory is public so the batch is findable. Phone numbers, email addresses and member activity appear only after a batchmate signs in.",
  },
  {
    t: "A record, not a feed",
    d: "There is no wall, no likes and no comment war. Conversation stays in WhatsApp; the durable record stays here.",
  },
];

function About() {
  return (
    <>
      <PageBanner
        kicker="About"
        title="The sixth batch, on the record."
        lede="Department of Finance, Faculty of Business Administration, University of Chittagong — a batch that decided its history was worth keeping properly."
        image={hero}
      />

      <section className="wrap grid items-start gap-12 py-20 md:grid-cols-[1.15fr_1fr]">
        <div className="space-y-4 text-[15px] leading-relaxed text-muted-foreground">
          <span className="kicker text-accent">Our story</span>
          <h2 className="text-[30px] text-foreground">From a corridor to a country-wide network</h2>
          <p>
            We arrived on the Hathazari campus as strangers and left as a batch. Some of us stayed in
            Chattogram, many moved to Dhaka, and a good number now work abroad — banking, academia,
            government, corporate finance and businesses of our own.
          </p>
          <p>
            For years the batch lived inside a messaging group. It worked for a day and failed for a decade:
            numbers changed, photos expired, contribution lists scrolled away, and nobody could say with
            certainty how much a reunion had cost or who had already paid.
          </p>
          <p>
            This site fixes that. It is a small, deliberately boring institution: a directory that stays
            current, an event register that produces real headcounts, a fund ledger anyone can audit, and an
            archive of notices, news and photographs that will still be readable in twenty years.
          </p>
          <p>
            It is maintained by volunteers from the batch and paid for by the batch. Nothing here is
            sponsored, and nothing here is for sale.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link to="/members" className="contents">
              <Btn>Browse the directory</Btn>
            </Link>
            <Link to="/funds" className="contents">
              <Btn variant="ghost">Audit the ledger</Btn>
            </Link>
          </div>
        </div>
        <img
          src={reunion}
          alt="Members of the batch at a reunion gathering"
          loading="lazy"
          className="rounded-md border border-border object-cover"
        />
      </section>

      <section className="bg-card py-20">
        <div className="wrap">
          <span className="kicker text-accent">How we work</span>
          <h2 className="mt-3 max-w-[26ch] text-[30px]">Four rules that keep this place trustworthy.</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {PRINCIPLES.map((p, i) => (
              <Card key={p.t} className="card-lift p-6">
                <span className="num text-[13px] font-semibold text-accent">0{i + 1}</span>
                <h3 className="mt-2 text-[18px]">{p.t}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">{p.d}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="wrap py-20">
        <div className="rounded-md border border-border bg-primary-soft px-8 py-12 sm:px-14">
          <span className="kicker text-accent">Who runs it</span>
          <h2 className="mt-3 text-[26px]">Volunteer caretakers, rotating by choice.</h2>
          <p className="mt-4 max-w-[62ch] text-[14.5px] leading-relaxed text-muted-foreground">
            A small group of batchmates hold admin and moderator access: they approve new members against the
            batch list, publish notices and events, and verify contributions. An admin cannot approve their
            own membership and cannot verify their own payment — the database itself refuses it. Anyone from
            the batch willing to take a turn is welcome to ask.
          </p>
          <div className="mt-7">
            <Link to="/contact" className="contents">
              <Btn variant="accent">Get in touch</Btn>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
