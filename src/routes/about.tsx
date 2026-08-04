import { createFileRoute, Link } from "@tanstack/react-router";

import reunion from "@/assets/reunion.jpg";
import hero from "@/assets/hero-campus.jpg";
import { PageBanner } from "@/components/layout";
import { Btn, Card } from "@/components/ui";
import { pairs, paragraphs, useCopy } from "@/lib/copy";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About the batch — Finance 6th Batch Alumni, CU" },
      {
        name: "description",
        content:
          "Who we are: the sixth batch of the Department of Finance, University of Chittagong — one batch, one tier, and a permanent record kept by the batch itself.",
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

function About() {
  const copy = useCopy("about");
  const principles = pairs(copy["principles"] ?? "");

  return (
    <>
      <PageBanner
        kicker="About"
        title={copy["banner_title"] ?? ""}
        lede={copy["banner_lede"] ?? ""}
        image={hero}
      />

      <section className="wrap grid items-start gap-12 py-20 md:grid-cols-[1.15fr_1fr]">
        <div className="space-y-4 text-[15px] leading-relaxed text-muted-foreground">
          <span className="kicker text-accent">{copy["story_kicker"]}</span>
          <h2 className="text-[30px] text-foreground">{copy["story_title"]}</h2>
          {paragraphs(copy["story_body"] ?? "").map((p) => (
            <p key={p.slice(0, 24)}>{p}</p>
          ))}
          <div className="flex flex-wrap gap-3 pt-2">
            <Link to="/members" className="contents">
              <Btn>Browse the directory</Btn>
            </Link>
            <Link to="/events" className="contents">
              <Btn variant="ghost">See the events</Btn>
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
          <h2 className="mt-3 max-w-[26ch] text-[30px]">{copy["principles_title"]}</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {principles.map((p, i) => (
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
          <h2 className="mt-3 text-[26px]">{copy["care_title"]}</h2>
          <p className="mt-4 max-w-[62ch] text-[14.5px] leading-relaxed text-muted-foreground">
            {copy["care_body"]}
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
