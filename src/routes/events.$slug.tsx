import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, CalendarDays, MapPin, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { eventImage } from "@/components/event-card";
import { MemberOnly } from "@/components/guards";
import { Btn, Card, Field, Input, Pill, Select, Spinner, Textarea } from "@/components/ui";
import { supabase } from "@/integrations/supabase/client";
import { eventQuery, registrationCountQuery, type EventRow } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { bdt, fmtDate } from "@/lib/format";

export const Route = createFileRoute("/events/$slug")({
  head: () => ({
    meta: [
      { title: "Event details — Finance 6th Batch Alumni, CU" },
      {
        name: "description",
        content:
          "Date, venue, fees and registration for a gathering of the Finance 6th batch, University of Chittagong.",
      },
      { property: "og:title", content: "Event details — Finance 6th Batch Alumni, CU" },
      {
        property: "og:description",
        content: "Register and see the accounts for this Finance 6th batch event.",
      },
    ],
  }),
  component: EventDetail,
});

function EventDetail() {
  const { slug } = Route.useParams();
  const q = useQuery(eventQuery(slug));
  const count = useQuery(registrationCountQuery(q.data?.id));

  if (q.isPending) return <Spinner label="Loading event" />;
  const e = q.data;
  if (!e)
    return (
      <div className="wrap py-24 text-center">
        <h1 className="text-[26px]">Event not found</h1>
        <Link to="/events" className="mt-4 inline-block text-[13.5px] font-semibold text-primary">
          ← All events
        </Link>
      </div>
    );

  const upcoming = new Date(e.event_date) >= new Date();

  return (
    <>
      <header className="relative overflow-hidden bg-primary">
        <img src={eventImage(e)} alt={e.title} className="absolute inset-0 h-full w-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/90 to-primary/50" />
        <div className="wrap relative py-16">
          <Link to="/events" className="inline-flex items-center gap-1.5 text-[13px] text-white/60">
            <ArrowLeft size={13} /> All events
          </Link>
          <div className="mt-5">
            <Pill tone={upcoming ? "accent" : "neutral"}>{upcoming ? "Upcoming" : "Completed"}</Pill>
            <h1 className="mt-3 max-w-[26ch] text-[36px] leading-tight text-white">{e.title}</h1>
            <p className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-[14px] text-white/75">
              <span className="flex items-center gap-1.5">
                <CalendarDays size={14} /> {fmtDate(e.event_date, { weekday: "long" })}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin size={14} /> {e.venue}
              </span>
              <span className="flex items-center gap-1.5">
                <Users size={14} /> <span className="num">{count.data ?? 0}</span> registered
              </span>
            </p>
          </div>
        </div>
      </header>

      <section className="wrap grid gap-8 py-14 md:grid-cols-[1.3fr_1fr]">
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-[19px]">Details</h2>
            <p className="mt-3 text-[14.5px] leading-relaxed whitespace-pre-line text-muted-foreground">
              {e.description || e.summary}
            </p>
            {e.map_url && (
              <a href={e.map_url} target="_blank" rel="noreferrer" className="mt-5 inline-block">
                <Btn variant="ghost" size="sm">
                  <MapPin size={13} /> Open map
                </Btn>
              </a>
            )}
          </Card>

          <Card className="p-6">
            <h2 className="text-[19px]">Fees</h2>
            <MemberOnly what="Event fees">
              <div className="mt-4 grid grid-cols-3 divide-x divide-border-soft text-center">
                {[
                  { l: "Single", v: e.fee_single },
                  { l: "Couple", v: e.fee_couple },
                  { l: "Child", v: e.fee_child },
                ].map((f) => (
                  <div key={f.l} className="px-3">
                    <div className="num text-[20px] font-semibold text-primary">{bdt(f.v)}</div>
                    <div className="kicker mt-1 text-faint">{f.l}</div>
                  </div>
                ))}
              </div>
            </MemberOnly>
            {e.contact_info && (
              <p className="mt-5 border-t border-border-soft pt-4 text-[13.5px] text-muted-foreground">
                {e.contact_info}
              </p>
            )}
          </Card>

          <MemberOnly what="The event statement">
            <EventStatement event={e} />
          </MemberOnly>
        </div>

        <div id="register">
          <Card className="p-6">
            <h2 className="text-[19px]">Registration</h2>
            <MemberOnly what="Event registration">
              {upcoming ? <RegisterForm event={e} /> : <p className="mt-3 text-[13.5px] text-faint">This event has already taken place.</p>}
            </MemberOnly>
          </Card>
        </div>
      </section>
    </>
  );
}

function RegisterForm({ event }: { event: EventRow }) {
  const { user, profile } = useAuth();
  const qc = useQueryClient();
  const [attend, setAttend] = useState("single");
  const [guests, setGuests] = useState(0);
  const [tshirt, setTshirt] = useState("M");
  const [food, setFood] = useState("Any");
  const [notes, setNotes] = useState("");

  const fee =
    (attend === "couple" ? Number(event.fee_couple ?? 0) : Number(event.fee_single ?? 0)) +
    guests * Number(event.fee_child ?? 0);

  const m = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("event_registrations").insert({
        event_id: event.id,
        profile_id: profile?.id ?? null,
        user_id: user?.id ?? null,
        attend_type: attend,
        guests,
        tshirt_size: tshirt,
        food_pref: food,
        total_amount: fee,
        notes: notes || null,
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("You're registered. Please pay and log your contribution.");
      void qc.invalidateQueries({ queryKey: ["registration-count"] });
      void qc.invalidateQueries({ queryKey: ["registrations"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <form
      className="mt-5 space-y-4"
      onSubmit={(ev) => {
        ev.preventDefault();
        m.mutate();
      }}
    >
      <Field label="Attending as">
        <Select value={attend} onChange={(e) => setAttend(e.target.value)}>
          <option value="single">Single</option>
          <option value="couple">Couple</option>
        </Select>
      </Field>
      <Field label="Children / extra guests">
        <Input
          type="number"
          min={0}
          max={8}
          value={guests}
          onChange={(e) => setGuests(Number(e.target.value))}
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="T-shirt size">
          <Select value={tshirt} onChange={(e) => setTshirt(e.target.value)}>
            {["S", "M", "L", "XL", "XXL"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </Select>
        </Field>
        <Field label="Food preference">
          <Select value={food} onChange={(e) => setFood(e.target.value)}>
            {["Any", "Beef", "Chicken", "Fish", "Vegetarian"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </Select>
        </Field>
      </div>
      <Field label="Notes for the organisers" hint="Optional">
        <Textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </Field>
      <div className="flex items-center justify-between rounded-sm bg-primary-soft px-4 py-3">
        <span className="text-[13px] text-muted-foreground">Payable</span>
        <span className="num text-[19px] font-semibold text-primary">{bdt(fee)}</span>
      </div>
      <Btn type="submit" disabled={m.isPending} className="w-full">
        {m.isPending ? "Registering…" : "Confirm registration"}
      </Btn>
      <p className="text-[12.5px] text-faint">
        Your registration is recorded straight away; an organiser will confirm the details with you.
      </p>
    </form>
  );
}
