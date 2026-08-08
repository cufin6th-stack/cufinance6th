import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { CopyBanner } from "@/components/layout";
import { EmptyState, Spinner, Tabs } from "@/components/ui";
import { EventCard } from "@/components/event-card";
import { eventsQuery } from "@/lib/api";

export const Route = createFileRoute("/events/")({
  head: () => ({
    meta: [
      { title: "Events & reunions — Finance 6th Batch Alumni, CU" },
      {
        name: "description",
        content:
          "Reunions, iftar mahfils and picnics of the Finance 6th batch, University of Chittagong. Register online and see the headcount and accounts for each event.",
      },
      { property: "og:title", content: "Events & reunions — Finance 6th Batch Alumni, CU" },
      {
        property: "og:description",
        content: "Upcoming and past gatherings of the Finance 6th batch, with open registration and accounts.",
      },
    ],
  }),
  component: Events,
});

function Events() {
  const q = useQuery(eventsQuery);
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");

  const all = q.data ?? [];
  const now = new Date();
  const upcoming = all.filter((e) => new Date(e.event_date) >= now).reverse();
  const past = all.filter((e) => new Date(e.event_date) < now);
  const shown = tab === "upcoming" ? upcoming : past;

  return (
    <>
      <CopyBanner page="events" />
      <section className="wrap py-12">
        <Tabs
          tabs={[
            { value: "upcoming", label: "Upcoming", count: upcoming.length },
            { value: "past", label: "Past", count: past.length },
          ]}
          value={tab}
          onChange={setTab}
        />
        <div className="pt-8">
          {q.isPending ? (
            <Spinner label="Loading events" />
          ) : shown.length ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {shown.map((e) => (
                <EventCard key={e.id} event={e} />
              ))}
            </div>
          ) : (
            <EmptyState
              title={tab === "upcoming" ? "Nothing scheduled yet" : "No past events on record"}
              body="Announcements appear here first, then in the notice board."
            />
          )}
        </div>
      </section>
    </>
  );
}
