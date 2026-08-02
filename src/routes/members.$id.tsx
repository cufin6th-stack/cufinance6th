import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  ArrowLeft,
  Briefcase,
  CalendarDays,
  Droplet,
  Facebook,
  Linkedin,
  Lock,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react";

import { Avatar, Btn, Card, Pill, Spinner } from "@/components/ui";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, type Profile } from "@/lib/auth";
import { bdt, dayMonth, fmtDate } from "@/lib/format";

export const Route = createFileRoute("/members/$id")({
  head: () => ({
    meta: [
      { title: "Member profile — Finance 6th Batch Alumni, CU" },
      {
        name: "description",
        content:
          "Profile of a member of the sixth batch, Department of Finance, University of Chittagong. Contact details require member sign-in.",
      },
      { property: "og:title", content: "Member profile — Finance 6th Batch Alumni, CU" },
      {
        property: "og:description",
        content: "A batchmate's profile in the Finance 6th batch alumni directory.",
      },
    ],
  }),
  component: MemberDetail,
});

function MemberDetail() {
  const { id } = Route.useParams();
  const { user, isApproved, isStaff } = useAuth();
  const canSee = !!user && (isApproved || isStaff);

  const q = useQuery({
    queryKey: ["member", id, canSee],
    queryFn: async () => {
      const res = canSee
        ? await supabase.from("profiles").select("*").eq("id", id).maybeSingle()
        : await supabase.from("members_public").select("*").eq("id", id).maybeSingle();
      if (res.error) throw new Error(res.error.message);
      if (!res.data) throw notFound();
      return res.data as unknown as Profile;
    },
  });

  const activity = useQuery({
    queryKey: ["member-activity", id],
    enabled: canSee,
    queryFn: async () => {
      const [regs, cons] = await Promise.all([
        supabase
          .from("event_registrations")
          .select("id, created_at, attend_type, guests, total_amount, events(title, slug, event_date)")
          .eq("profile_id", id)
          .order("created_at", { ascending: false }),
        supabase
          .from("contributions")
          .select("id, amount, method, note, status, created_at")
          .eq("profile_id", id)
          .eq("status", "verified")
          .order("created_at", { ascending: false }),
      ]);
      return {
        regs: (regs.data ?? []) as unknown as {
          id: string;
          created_at: string;
          attend_type: string | null;
          guests: number | null;
          total_amount: number | null;
          events: { title: string; slug: string; event_date: string } | null;
        }[],
        cons: (cons.data ?? []) as unknown as {
          id: string;
          amount: number;
          method: string | null;
          note: string | null;
          status: string;
          created_at: string;
        }[],
      };
    },
  });

  if (q.isPending) return <Spinner label="Loading profile" />;
  const m = q.data;
  if (!m) return null;

  return (
    <>
      <header className="bg-primary text-primary-foreground">
        <div className="wrap py-14">
          <Link to="/members" className="inline-flex items-center gap-1.5 text-[13px] text-white/60">
            <ArrowLeft size={13} /> Back to directory
          </Link>
          <div className="mt-6 flex flex-wrap items-center gap-6">
            <Avatar name={m.full_name} src={m.avatar_url} size={92} className="ring-4 ring-white/15" />
            <div>
              <h1 className="text-[32px] leading-tight text-white">{m.full_name}</h1>
              {m.nickname && <p className="text-[13.5px] text-white/55">“{m.nickname}”</p>}
              <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13.5px] text-white/75">
                <span className="flex items-center gap-1.5">
                  <Briefcase size={13} /> {m.job_title || "—"}
                  {m.organization ? `, ${m.organization}` : ""}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin size={13} /> {[m.city, m.country].filter(Boolean).join(", ") || "—"}
                </span>
              </p>
              {m.field && (
                <span className="kicker mt-3 inline-block rounded-full bg-white/10 px-2.5 py-1 text-accent">
                  {m.field}
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      <section className="wrap grid gap-8 py-14 md:grid-cols-[1.3fr_1fr]">
        <div className="space-y-8">
          {m.bio && (
            <Card className="p-6">
              <h2 className="text-[18px]">About</h2>
              <p className="mt-3 text-[14.5px] leading-relaxed text-muted-foreground">{m.bio}</p>
            </Card>
          )}

          <Card className="p-6">
            <h2 className="text-[18px]">Member activity</h2>
            {!canSee ? (
              <LockedBox />
            ) : activity.isPending ? (
              <Spinner label="Loading activity" />
            ) : (
              <div className="mt-5 grid gap-6 sm:grid-cols-2">
                <div>
                  <h3 className="kicker text-faint">Events attended</h3>
                  <ul className="mt-3 space-y-2.5">
                    {activity.data?.regs.length ? (
                      activity.data.regs.map((r) => (
                        <li key={r.id} className="text-[13.5px]">
                          <span className="font-semibold text-primary">{r.events?.title ?? "Event"}</span>
                          <span className="num block text-[12px] text-faint">
                            {fmtDate(r.events?.event_date)} · {r.attend_type ?? "single"}
                            {(r.guests ?? 0) > 0 ? ` · ${r.guests} guest(s)` : ""}
                          </span>
                        </li>
                      ))
                    ) : (
                      <li className="text-[13.5px] text-faint">No registrations yet.</li>
                    )}
                  </ul>
                </div>
                <div>
                  <h3 className="kicker text-faint">Verified contributions</h3>
                  <ul className="mt-3 space-y-2.5">
                    {activity.data?.cons.length ? (
                      activity.data.cons.map((c) => (
                        <li key={c.id} className="text-[13.5px]">
                          <span className="num font-semibold text-ok">{bdt(c.amount)}</span>
                          <span className="block text-[12px] text-faint">
                            {c.method || "General fund"} · {fmtDate(c.created_at)}
                          </span>
                        </li>
                      ))
                    ) : (
                      <li className="text-[13.5px] text-faint">No verified contributions yet.</li>
                    )}
                  </ul>
                </div>
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-[18px]">Contact</h2>
            {canSee ? (
              <dl className="mt-4 space-y-3 text-[13.5px]">
                <Row icon={<Phone size={13} />} label="Phone">
                  {m.hide_phone ? <span className="text-faint">Hidden by member</span> : <span className="num">{m.phone || "—"}</span>}
                </Row>
                <Row icon={<MessageCircle size={13} />} label="WhatsApp">
                  <span className="num">{m.whatsapp || "—"}</span>
                </Row>
                <Row icon={<Mail size={13} />} label="Email">
                  {m.email ? (
                    <a href={`mailto:${m.email}`} className="break-all text-primary">
                      {m.email}
                    </a>
                  ) : (
                    "—"
                  )}
                </Row>
                <Row icon={<Droplet size={13} />} label="Blood group">
                  <span className="num">{m.blood_group || "—"}</span>
                </Row>
                <Row icon={<CalendarDays size={13} />} label="Birthday">
                  {dayMonth(m.birth_day, m.birth_month) || "—"}
                </Row>
                <div className="flex gap-2 pt-2">
                  {m.facebook_url && (
                    <a href={m.facebook_url} target="_blank" rel="noreferrer" aria-label="Facebook">
                      <Btn variant="ghost" size="xs">
                        <Facebook size={13} /> Facebook
                      </Btn>
                    </a>
                  )}
                  {m.linkedin_url && (
                    <a href={m.linkedin_url} target="_blank" rel="noreferrer" aria-label="LinkedIn">
                      <Btn variant="ghost" size="xs">
                        <Linkedin size={13} /> LinkedIn
                      </Btn>
                    </a>
                  )}
                </div>
              </dl>
            ) : (
              <LockedBox />
            )}
          </Card>

          <Card className="p-6">
            <h2 className="text-[18px]">Batch record</h2>
            <dl className="mt-4 space-y-3 text-[13.5px]">
              <Row label="Session">2008 — 6th batch</Row>
              <Row label="Field">{m.field || "—"}</Row>
              {canSee && (
                <>
                  <Row label="Roll">
                    <span className="num">{m.roll || "—"}</span>
                  </Row>
                  <Row label="Section">{m.section || "—"}</Row>
                </>
              )}
              <Row label="Status">
                <Pill tone={m.is_approved === false ? "wait" : "ok"}>
                  {m.is_approved === false ? "Pending" : "Approved member"}
                </Pill>
              </Row>
            </dl>
          </Card>
        </div>
      </section>
    </>
  );
}

function Row({
  icon,
  label,
  children,
}: {
  icon?: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border-soft pb-2.5 last:border-0">
      <dt className="flex items-center gap-1.5 text-faint">
        {icon}
        {label}
      </dt>
      <dd className="text-right">{children}</dd>
    </div>
  );
}

function LockedBox() {
  return (
    <div className="mt-4 rounded-sm border border-dashed border-border bg-background px-5 py-8 text-center">
      <Lock size={16} className="mx-auto text-faint" />
      <p className="mt-2 text-[13.5px] text-muted-foreground">
        Contact details and member activity are visible to signed-in batchmates only.
      </p>
      <div className="mt-4 flex justify-center gap-2">
        <Link to="/auth" search={{ mode: "signin" }} className="contents">
          <Btn size="sm">Sign in</Btn>
        </Link>
        <Link to="/auth" search={{ mode: "signup" }} className="contents">
          <Btn size="sm" variant="ghost">
            Request access
          </Btn>
        </Link>
      </div>
    </div>
  );
}
