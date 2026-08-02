import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Briefcase, Lock, MapPin, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { PageBanner } from "@/components/layout";
import { Avatar, Btn, Card, EmptyState, Input, Select, Spinner } from "@/components/ui";
import { fullMembersQuery, publicMembersQuery, type PublicMember } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { Profile } from "@/lib/auth";
import { FIELDS } from "@/lib/format";

export const Route = createFileRoute("/members")({
  head: () => ({
    meta: [
      { title: "Member directory — Finance 6th Batch Alumni, CU" },
      {
        name: "description",
        content:
          "Search the sixth batch of Finance, University of Chittagong by name, profession, field and city. Contact details are visible to signed-in batchmates.",
      },
      { property: "og:title", content: "Member directory — Finance 6th Batch Alumni, CU" },
      {
        property: "og:description",
        content:
          "A public, searchable directory of the Finance 6th batch. Phone and email stay behind member sign-in.",
      },
    ],
  }),
  component: Members,
});

function Members() {
  const { user, isApproved, isStaff } = useAuth();
  const canSeeContacts = !!user && (isApproved || isStaff);

  const pub = useQuery({ ...publicMembersQuery, enabled: !canSeeContacts });
  const full = useQuery({ ...fullMembersQuery, enabled: canSeeContacts });

  const [q, setQ] = useState("");
  const [field, setField] = useState("");
  const [city, setCity] = useState("");

  const rows = (canSeeContacts ? (full.data as Profile[] | undefined) : (pub.data as PublicMember[] | undefined)) ?? [];
  const loading = canSeeContacts ? full.isPending : pub.isPending;

  const cities = useMemo(
    () => [...new Set(rows.map((r) => r.city).filter(Boolean) as string[])].sort(),
    [rows],
  );

  const filtered = rows.filter((r) => {
    const hay = `${r.full_name} ${r.nickname ?? ""} ${r.job_title ?? ""} ${r.organization ?? ""} ${r.city ?? ""}`.toLowerCase();
    return (
      hay.includes(q.toLowerCase().trim()) &&
      (!field || r.field === field) &&
      (!city || r.city === city)
    );
  });

  return (
    <>
      <PageBanner
        kicker="Directory"
        title="Every batchmate, one searchable list."
        lede="Names, professions and cities are open to everyone. Phone numbers, email addresses and member activity appear only when a batchmate signs in."
      >
        {!canSeeContacts && (
          <div className="flex flex-wrap gap-3">
            <Link to="/auth" search={{ mode: "signin" }} className="contents">
              <Btn variant="accent">Sign in to see contacts</Btn>
            </Link>
            <Link to="/auth" search={{ mode: "signup" }} className="contents">
              <Btn variant="onDark">Request membership</Btn>
            </Link>
          </div>
        )}
      </PageBanner>

      <section className="wrap py-12">
        <Card className="grid gap-3 p-4 md:grid-cols-[1.6fr_1fr_1fr]">
          <label className="relative block">
            <Search size={15} className="absolute top-1/2 left-3 -translate-y-1/2 text-faint" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search name, workplace or city"
              className="pl-9"
              aria-label="Search members"
            />
          </label>
          <Select value={field} onChange={(e) => setField(e.target.value)} aria-label="Filter by field">
            <option value="">All fields</option>
            {FIELDS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </Select>
          <Select value={city} onChange={(e) => setCity(e.target.value)} aria-label="Filter by city">
            <option value="">All cities</option>
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </Card>

        <p className="mt-5 mb-6 text-[13px] text-faint">
          <span className="num font-semibold text-primary">{filtered.length}</span> of {rows.length} members
          {!canSeeContacts && " · contact details hidden"}
        </p>

        {loading ? (
          <Spinner label="Loading directory" />
        ) : filtered.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((m) => (
              <MemberCard key={m.id} m={m} canSeeContacts={canSeeContacts} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No members match"
            body="Try a different spelling, or clear the field and city filters."
          />
        )}
      </section>
    </>
  );
}

function MemberCard({ m, canSeeContacts }: { m: PublicMember | Profile; canSeeContacts: boolean }) {
  const p = m as Profile;
  return (
    <Link to="/members/$id" params={{ id: m.id }} className="block">
      <Card className="card-lift h-full p-5">
        <div className="flex items-start gap-4">
          <Avatar name={m.full_name} src={m.avatar_url} size={52} />
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-[16.5px] leading-snug">{m.full_name}</h3>
            {m.nickname && <p className="text-[12.5px] text-faint">“{m.nickname}”</p>}
            <p className="mt-2 flex items-start gap-1.5 text-[13px] text-muted-foreground">
              <Briefcase size={12} className="mt-[3px] shrink-0" />
              <span className="line-clamp-2">
                {m.job_title || "—"}
                {m.organization ? `, ${m.organization}` : ""}
              </span>
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-[12.5px] text-faint">
              <MapPin size={12} /> {[m.city, m.country].filter(Boolean).join(", ") || "—"}
            </p>
          </div>
        </div>
        <div className="mt-4 border-t border-border-soft pt-3 text-[12.5px]">
          {canSeeContacts ? (
            <span className="num text-primary">{p.hide_phone ? "Phone hidden by member" : p.phone || "—"}</span>
          ) : (
            <span className="flex items-center gap-1.5 text-faint">
              <Lock size={11} /> Contact visible to members
            </span>
          )}
        </div>
      </Card>
    </Link>
  );
}
