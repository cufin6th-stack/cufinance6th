import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CalendarDays, MapPin } from "lucide-react";
import { useEffect, useState } from "react";

import heroCampus from "@/assets/hero-campus.jpg";
import reunionImg from "@/assets/reunion.jpg";
import { eventsQuery, noticesQuery, postsQuery, sliderQuery, statsQuery } from "@/lib/api";
import { useCopy } from "@/lib/copy";
import { fmtDate } from "@/lib/format";
import { Btn, Card, EmptyState, SectionHead } from "@/components/ui";
import { EventCard } from "@/components/event-card";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Finance 6th Batch Alumni — University of Chittagong" },
      {
        name: "description",
        content:
          "The permanent home of the sixth batch, Department of Finance, University of Chittagong: member directory, reunion events, notices, news and photographs.",
      },
      { property: "og:title", content: "Finance 6th Batch Alumni — University of Chittagong" },
      {
        property: "og:description",
        content:
          "Member directory, reunion events and the lasting archive of the sixth batch of Finance, University of Chittagong.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const copy = useCopy("home");
  const slides = useQuery(sliderQuery);
  const stats = useQuery(statsQuery);
  const events = useQuery(eventsQuery);
  const notices = useQuery(noticesQuery);
  const posts = useQuery(postsQuery);
  const [i, setI] = useState(0);

  const list = slides.data ?? [];
  useEffect(() => {
    if (list.length < 2) return;
    const t = setInterval(() => setI((v) => (v + 1) % list.length), 5000);
    return () => clearInterval(t);
  }, [list.length]);

  const upcoming = (events.data ?? []).filter((e) => new Date(e.event_date) >= new Date()).reverse();
  const past = (events.data ?? []).filter((e) => new Date(e.event_date) < new Date());
  const shown = (upcoming.length ? upcoming : past).slice(0, 3);
  const slide = list[i];

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-primary">
        <img
          src={heroCampus}
          alt="University of Chittagong campus at golden hour"
          width={1920}
          height={1088}
          className="absolute inset-0 h-full w-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/90 to-primary/40" />
        <div className="wrap relative flex min-h-[520px] flex-col justify-end py-16">
          <div className="max-w-[52ch]">
            <span className="kicker text-accent">
              {slide?.kicker ?? "Department of Finance · University of Chittagong"}
            </span>
            <h1 className="mt-4 text-[38px] leading-[1.15] text-white sm:text-[52px]">
              {slide?.title ?? "Sixth Batch. One Address."}
            </h1>
            <p className="mt-5 max-w-[46ch] text-[15px] leading-relaxed text-white/75">
              {slide?.description ??
                "A permanent, batch-owned home for our people, our events and every taka we raise together."}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to={(slide?.cta_url as "/members") ?? "/members"} className="contents">
                <Btn variant="accent">{slide?.cta_label ?? "Browse the directory"}</Btn>
              </Link>
              <Link to="/events" className="contents">
                <Btn variant="onDark">See the events</Btn>
              </Link>
            </div>
          </div>

          {list.length > 1 && (
            <div className="mt-10 flex items-center gap-2">
              {list.map((s, n) => (
                <button
                  key={s.id}
                  aria-label={`Slide ${n + 1}`}
                  onClick={() => setI(n)}
                  className={
                    n === i ? "h-1.5 w-8 rounded-full bg-accent" : "h-1.5 w-4 rounded-full bg-white/30"
                  }
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Stats */}
      <section className="wrap -mt-8 relative">
        <Card className="grid grid-cols-2 shadow-flat md:grid-cols-4">
          {[
            { l: "Members on record", v: stats.data?.members ?? 0 },
            { l: "Cities worldwide", v: stats.data?.cities ?? 0 },
            { l: "Events organised", v: stats.data?.events ?? 0 },
            { l: "Years as a batch", v: new Date().getFullYear() - 2008 },
          ].map((s) => (
            <div key={s.l} className="border-r border-b border-border-soft px-6 py-6 last:border-r-0 md:border-b-0">
              <div className="num text-[26px] font-semibold text-primary">{s.v}</div>
              <div className="mt-0.5 text-[12.5px] text-faint">{s.l}</div>
            </div>
          ))}
        </Card>
      </section>

      {/* Intro */}
      <section className="wrap grid items-center gap-12 py-20 md:grid-cols-2">
        <img
          src={reunionImg}
          alt="Batchmates gathered for the reunion photo"
          loading="lazy"
          width={1280}
          height={864}
          className="rounded-md border border-border object-cover"
        />
        <div>
          <span className="kicker text-accent">{copy["intro_kicker"]}</span>
          <h2 className="mt-3 text-[30px]">{copy["intro_title"]}</h2>
          <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">{copy["intro_body1"]}</p>
          <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">{copy["intro_body2"]}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link to="/members" className="contents">
              <Btn variant="ghost">See the directory</Btn>
            </Link>
          </div>
        </div>
      </section>

      {/* Events */}
      <section className="bg-card py-20">
        <div className="wrap">
          <SectionHead
            title={upcoming.length ? "Upcoming events" : "Recent events"}
            sub="Registration, headcount and accounts all run through this site."
            action={
              <Link to="/events" className="contents">
                <Btn variant="ghost" size="sm">
                  All events <ArrowRight size={14} />
                </Btn>
              </Link>
            }
          />
          {shown.length ? (
            <div className="grid gap-6 md:grid-cols-3">
              {shown.map((e) => (
                <EventCard key={e.id} event={e} />
              ))}
            </div>
          ) : (
            <EmptyState title="No events yet" body="The next reunion will be announced here first." />
          )}
        </div>
      </section>

      {/* Notices + news */}
      <section className="wrap grid gap-12 py-20 md:grid-cols-[1.1fr_1fr]">
        <div>
          <SectionHead title="Notice board" sub="Deadlines and batch decisions." />
          <div className="grid gap-3">
            {(notices.data ?? []).slice(0, 4).map((n) => (
              <Card key={n.id} className="card-lift px-5 py-4">
                <div className="flex items-center gap-2">
                  <span className="num text-[11.5px] text-faint">{fmtDate(n.published_at)}</span>
                  {n.is_pinned && (
                    <span className="kicker rounded-full bg-accent-soft px-2 py-0.5 text-accent-foreground">
                      Pinned
                    </span>
                  )}
                </div>
                <h3 className="mt-1.5 text-[16px]">{n.title}</h3>
                <p className="mt-1 line-clamp-2 text-[13.5px] text-muted-foreground">{n.body}</p>
              </Card>
            ))}
            {!notices.data?.length && <EmptyState title="No notices yet" />}
          </div>
          <Link to="/notices" className="mt-4 inline-block text-[13.5px] font-semibold text-primary">
            All notices →
          </Link>
        </div>
        <div>
          <SectionHead title="Batch news" sub="Promotions, achievements, condolences." />
          <div className="grid gap-3">
            {(posts.data ?? []).slice(0, 3).map((p) => (
              <Link key={p.id} to="/news/$slug" params={{ slug: p.slug }} className="block">
                <Card className="card-lift px-5 py-4">
                  <span className="kicker text-accent">{p.category}</span>
                  <h3 className="mt-1.5 text-[16px]">{p.title}</h3>
                  <p className="mt-1 line-clamp-2 text-[13.5px] text-muted-foreground">{p.excerpt}</p>
                </Card>
              </Link>
            ))}
            {!posts.data?.length && <EmptyState title="No news yet" />}
          </div>
          <Link to="/news" className="mt-4 inline-block text-[13.5px] font-semibold text-primary">
            All news →
          </Link>
        </div>
      </section>

      {/* Gathering CTA */}
      <section className="wrap pb-20">
        <div className="rounded-md bg-ink px-8 py-12 text-center text-white sm:px-14">
          <span className="kicker text-accent">Stay in the record</span>
          <h2 className="mx-auto mt-3 max-w-[22ch] text-[30px] text-white">
            Every gathering, every headcount, kept properly.
          </h2>
          <p className="mx-auto mt-4 max-w-[54ch] text-[14.5px] text-white/65">
            Registration runs through this site, so organisers know exactly who is coming — and the batch
            keeps a permanent record of who was there.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link to="/events" className="contents">
              <Btn variant="accent">
                <CalendarDays size={14} /> Register for an event
              </Btn>
            </Link>
          </div>
          <p className="mt-6 flex items-center justify-center gap-1.5 text-[12.5px] text-white/45">
            <MapPin size={12} /> Hathazari, Chattogram — since 2008
          </p>
        </div>
      </section>
    </>
  );
}
