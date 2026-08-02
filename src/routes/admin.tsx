import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { AdminOnly } from "@/components/guards";
import { Avatar, Btn, Card, EmptyState, Pill, Spinner, StatusPill, Tabs } from "@/components/ui";
import { supabase } from "@/integrations/supabase/client";
import {
  allProfilesQuery,
  contributionsQuery,
  messagesQuery,
  pendingProfilesQuery,
  registrationsQuery,
} from "@/lib/api";
import { useAuth, type Profile } from "@/lib/auth";
import { bdt, fmtDate } from "@/lib/format";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin panel — Finance 6th Batch Alumni, CU" },
      {
        name: "description",
        content:
          "Volunteer caretaker panel for the Finance 6th batch: approve members, verify contributions, review registrations and messages.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Admin panel — Finance 6th Batch Alumni, CU" },
      { property: "og:description", content: "Caretaker tools for the Finance 6th batch alumni record." },
    ],
  }),
  component: () => (
    <AdminOnly>
      <Admin />
    </AdminOnly>
  ),
});

type Tab = "approvals" | "contributions" | "registrations" | "members" | "messages";

function Admin() {
  const { profile } = useAuth();
  const [tab, setTab] = useState<Tab>("approvals");

  const pending = useQuery({ ...pendingProfilesQuery, enabled: tab === "approvals" });
  const cons = useQuery({ ...contributionsQuery, enabled: tab === "contributions" });
  const regs = useQuery({ ...registrationsQuery, enabled: tab === "registrations" });
  const all = useQuery({ ...allProfilesQuery, enabled: tab === "members" });
  const msgs = useQuery({ ...messagesQuery, enabled: tab === "messages" });
  const qc = useQueryClient();

  const approve = useMutation({
    mutationFn: async ({ id, value }: { id: string; value: boolean }) => {
      const { error } = await supabase.from("profiles").update({ is_approved: value }).eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("Membership updated.");
      void qc.invalidateQueries({ queryKey: ["pending-profiles"] });
      void qc.invalidateQueries({ queryKey: ["all-profiles"] });
      void qc.invalidateQueries({ queryKey: ["members-public"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const verify = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("contributions")
        .update({ status, verified_at: status === "verified" ? new Date().toISOString() : null })
        .eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("Contribution updated.");
      void qc.invalidateQueries({ queryKey: ["contributions"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const pendingRows = (pending.data ?? []) as unknown as Profile[];
  const allRows = (all.data ?? []) as unknown as Profile[];
  const conRows = (cons.data ?? []) as unknown as {
    id: string;
    amount: number;
    method: string | null;
    trx_id: string | null;
    status: string;
    created_at: string;
    profiles: { id: string; full_name: string; avatar_url: string | null } | null;
    events: { title: string } | null;
  }[];
  const regRows = (regs.data ?? []) as unknown as {
    id: string;
    attend_type: string | null;
    guests: number | null;
    total_amount: number | null;
    created_at: string;
    profiles: { full_name: string; phone: string | null; email: string | null } | null;
    events: { title: string } | null;
  }[];
  const msgRows = (msgs.data ?? []) as unknown as {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    message: string;
    created_at: string;
  }[];

  return (
    <section className="wrap py-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="kicker text-accent">Caretaker panel</span>
          <h1 className="mt-2 text-[28px]">Batch administration</h1>
          <p className="mt-1 text-[13.5px] text-faint">
            Signed in as {profile?.full_name ?? "admin"}. You cannot approve yourself or verify your own
            payments — the database blocks it.
          </p>
        </div>
      </div>

      <div className="mt-8">
        <Tabs
          tabs={[
            { value: "approvals" as Tab, label: "Approvals", count: pendingRows.length },
            { value: "contributions" as Tab, label: "Contributions" },
            { value: "registrations" as Tab, label: "Registrations" },
            { value: "members" as Tab, label: "Members" },
            { value: "messages" as Tab, label: "Messages" },
          ]}
          value={tab}
          onChange={setTab}
        />
      </div>

      <div className="pt-8">
        {tab === "approvals" &&
          (pending.isPending ? (
            <Spinner />
          ) : pendingRows.length ? (
            <Card className="divide-y divide-border-soft">
              {pendingRows.map((p) => (
                <div key={p.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
                  <Avatar name={p.full_name} src={p.avatar_url} size={40} />
                  <div className="min-w-0 flex-1">
                    <p className="text-[15px] font-semibold">{p.full_name}</p>
                    <p className="text-[12.5px] text-faint">
                      {p.email ?? "no email"} · <span className="num">{p.phone ?? "no phone"}</span> · requested{" "}
                      {fmtDate(p.created_at)}
                    </p>
                  </div>
                  <Btn size="sm" onClick={() => approve.mutate({ id: p.id, value: true })}>
                    Approve
                  </Btn>
                </div>
              ))}
            </Card>
          ) : (
            <EmptyState title="No pending requests" body="Every account on record has been reviewed." />
          ))}

        {tab === "contributions" &&
          (cons.isPending ? (
            <Spinner />
          ) : conRows.length ? (
            <Card className="divide-y divide-border-soft">
              {conRows.map((c) => (
                <div key={c.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
                  <Avatar name={c.profiles?.full_name ?? "Anonymous"} src={c.profiles?.avatar_url} size={36} />
                  <div className="min-w-0 flex-1">
                    <p className="text-[14.5px]">
                      <span className="num font-semibold text-primary">{bdt(c.amount)}</span> ·{" "}
                      {c.profiles?.full_name ?? "Anonymous"}
                    </p>
                    <p className="text-[12.5px] text-faint">
                      {c.events?.title ?? "General fund"} · {c.method ?? "—"} ·{" "}
                      <span className="num">{c.trx_id ?? "no trx"}</span> · {fmtDate(c.created_at)}
                    </p>
                  </div>
                  <StatusPill status={c.status} />
                  {c.status !== "verified" && (
                    <Btn size="xs" onClick={() => verify.mutate({ id: c.id, status: "verified" })}>
                      Verify
                    </Btn>
                  )}
                  {c.status !== "rejected" && (
                    <Btn size="xs" variant="danger" onClick={() => verify.mutate({ id: c.id, status: "rejected" })}>
                      Reject
                    </Btn>
                  )}
                </div>
              ))}
            </Card>
          ) : (
            <EmptyState title="No contributions logged yet" />
          ))}

        {tab === "registrations" &&
          (regs.isPending ? (
            <Spinner />
          ) : regRows.length ? (
            <Card className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-[13.5px]">
                <thead>
                  <tr className="border-b border-border bg-background text-left">
                    {["Member", "Event", "Type", "Guests", "Payable", "Contact"].map((h) => (
                      <th key={h} className="kicker px-4 py-3 text-faint">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {regRows.map((r) => (
                    <tr key={r.id} className="border-b border-border-soft last:border-0">
                      <td className="px-4 py-3">{r.profiles?.full_name ?? "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{r.events?.title ?? "—"}</td>
                      <td className="px-4 py-3">{r.attend_type ?? "—"}</td>
                      <td className="num px-4 py-3">{r.guests ?? 0}</td>
                      <td className="num px-4 py-3">{bdt(r.total_amount)}</td>
                      <td className="num px-4 py-3 text-faint">{r.profiles?.phone ?? r.profiles?.email ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          ) : (
            <EmptyState title="No registrations yet" />
          ))}

        {tab === "members" &&
          (all.isPending ? (
            <Spinner />
          ) : (
            <Card className="divide-y divide-border-soft">
              {allRows.map((p) => (
                <div key={p.id} className="flex flex-wrap items-center gap-4 px-5 py-3.5">
                  <Avatar name={p.full_name} src={p.avatar_url} size={34} />
                  <div className="min-w-0 flex-1">
                    <p className="text-[14.5px]">{p.full_name}</p>
                    <p className="text-[12.5px] text-faint">
                      {[p.job_title, p.organization, p.city].filter(Boolean).join(" · ") || "—"}
                    </p>
                  </div>
                  <Pill tone={p.is_approved ? "ok" : "wait"}>{p.is_approved ? "Approved" : "Pending"}</Pill>
                  <Btn
                    size="xs"
                    variant={p.is_approved ? "danger" : "primary"}
                    onClick={() => approve.mutate({ id: p.id, value: !p.is_approved })}
                  >
                    {p.is_approved ? "Revoke" : "Approve"}
                  </Btn>
                </div>
              ))}
            </Card>
          ))}

        {tab === "messages" &&
          (msgs.isPending ? (
            <Spinner />
          ) : msgRows.length ? (
            <div className="grid gap-4 md:grid-cols-2">
              {msgRows.map((m) => (
                <Card key={m.id} className="p-5">
                  <p className="text-[14.5px] font-semibold">{m.name}</p>
                  <p className="text-[12.5px] text-faint">
                    {m.email} · <span className="num">{m.phone ?? "—"}</span> · {fmtDate(m.created_at)}
                  </p>
                  <p className="mt-3 text-[13.5px] whitespace-pre-line text-muted-foreground">{m.message}</p>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState title="No messages" />
          ))}
      </div>
    </section>
  );
}
