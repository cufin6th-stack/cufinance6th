import { Link } from "@tanstack/react-router";
import { MapPin } from "lucide-react";

import iftar from "@/assets/iftar.jpg";
import picnic from "@/assets/picnic.jpg";
import reunion from "@/assets/reunion.jpg";
import type { EventRow } from "@/lib/api";
import { bdt, fmtDate } from "@/lib/format";
import { Card, Pill } from "@/components/ui";

const FALLBACK: Record<string, string> = {
  "reunion-2026": reunion,
  "iftar-mahfil-2026": iftar,
  "picnic-2025": picnic,
};

export function eventImage(e: Pick<EventRow, "slug" | "cover_url">) {
  return e.cover_url || FALLBACK[e.slug] || reunion;
}

export function EventCard({ event }: { event: EventRow }) {
  const d = new Date(event.event_date);
  const upcoming = d >= new Date();
  return (
    <Link to="/events/$slug" params={{ slug: event.slug }} className="block">
      <Card className="card-lift h-full overflow-hidden">
        <div className="relative h-44">
          <img
            src={eventImage(event)}
            alt={event.title}
            loading="lazy"
            className="h-full w-full object-cover"
          />
          <div className="absolute top-3 left-3 rounded-sm bg-card px-3 py-1.5 text-center shadow-flat">
            <b className="num block text-[17px] leading-none font-semibold text-primary">{d.getDate()}</b>
            <span className="kicker text-faint">
              {d.toLocaleDateString("en-GB", { month: "short" })} {d.getFullYear()}
            </span>
          </div>
        </div>
        <div className="p-5">
          <Pill tone={upcoming ? "accent" : "neutral"}>{upcoming ? "Upcoming" : "Completed"}</Pill>
          <h3 className="mt-2.5 text-[17px]">{event.title}</h3>
          <p className="mt-2 flex items-center gap-1.5 text-[12.5px] text-faint">
            <MapPin size={12} /> {event.venue}
          </p>
          <p className="mt-3 flex items-center justify-between text-[13px] text-muted-foreground">
            <span>
              From <span className="num font-semibold text-primary">{bdt(event.fee_single)}</span>
            </span>
            <span className="font-semibold text-primary">Details →</span>
          </p>
          <p className="sr-only">{fmtDate(event.event_date)}</p>
        </div>
      </Card>
    </Link>
  );
}
