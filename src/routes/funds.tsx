import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Download, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { MemberOnly } from "@/components/guards";
import { PageBanner } from "@/components/layout";
import {
  Avatar,
  Btn,
  Card,
  EmptyState,
  Field,
  Input,
  Select,
  Spinner,
  StatusPill,
  Tabs,
  Textarea,
} from "@/components/ui";
import { supabase } from "@/integrations/supabase/client";
import { contributionsQuery, eventsQuery, expensesQuery } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { bdt, downloadCsv, fmtDate } from "@/lib/format";

export const Route = createFileRoute("/funds")({
  head: () => ({
    meta: [
      { title: "Fund ledger — Finance 6th Batch Alumni, CU" },
      {
        name: "description",
        content:
          "The open books of the Finance 6th batch, University of Chittagong: every verified contribution and every expense, line by line, with running balance.",
      },
      { property: "og:title", content: "Fund ledger — Finance 6th Batch Alumni, CU" },
      {
        property: "og:description",
        content: "Public, line-by-line accounts of the Finance 6th batch alumni fund.",
      },
    ],
  }),
  component: Funds,
});

type Contribution = {
  id: string;
  amount: number;
  method: string | null;
  trx_id: string | null;
  status: string;
  note: string | null;
  created_at: string;
  profiles: { id: string; full_name: string; avatar_url: string | null } | null;
  events: { slug: string; title: string } | null;
};

type Expense = {
  id: string;
  category: string | null;
  description: string | null;
  amount: number;
  receipt_url: string | null;
  spent_on: string;
  events: { slug: string; title: string } | null;
};

function Funds() {
  const cons = useQuery(contributionsQuery);
  const exps = useQuery(expensesQuery);
  const [tab, setTab] = useState<"in" | "out">("in");
  const [open, setOpen] = useState(false);

  const contributions = ((cons.data ?? []) as unknown as Contribution[]).filter(
    (c) => c.status === "verified",
  );
  const expenses = (exps.data ?? []) as unknown as Expense[];

  const totalIn = contributions.reduce((s, c) => s + Number(c.amount), 0);
  const totalOut = expenses.reduce((s, e) => s + Number(e.amount), 0);

  return (
    <>
      <PageBanner
        kicker="Open books"
        title="Every taka, on the record."
        lede="Contributions appear once an admin has verified the payment. Nothing is ever deleted — a mistake is corrected with a new, visible entry."
      />

      <section className="wrap py-12">
        <Card className="grid grid-cols-3">
          {[
            { l: "Collected", v: bdt(totalIn), c: "text-ok" },
            { l: "Spent", v: bdt(totalOut), c: "text-stop" },
            { l: "Balance", v: bdt(totalIn - totalOut), c: "text-primary" },
          ].map((s) => (
            <div key={s.l} className="border-r border-border-soft px-5 py-6 text-center last:border-r-0">
              <div className={`num text-[24px] font-semibold ${s.c}`}>{s.v}</div>
              <div className="kicker mt-1 text-faint">{s.l}</div>
            </div>
          ))}
        </Card>

        <div className="mt-10 flex flex-wrap items-end justify-between gap-3">
          <Tabs
            tabs={[
              { value: "in", label: "Contributions", count: contributions.length },
              { value: "out", label: "Expenses", count: expenses.length },
            ]}
            value={tab}
            onChange={setTab}
          />
          <div className="flex gap-2">
            <Btn
              variant="ghost"
              size="sm"
              onClick={() =>
                tab === "in"
                  ? downloadCsv(
                      "contributions.csv",
                      contributions.map((c) => ({
                        date: fmtDate(c.created_at),
                        member: c.profiles?.full_name ?? "Anonymous",
                        purpose: c.events?.title ?? c.note ?? "General fund",
                        method: c.method ?? "",
                        amount: c.amount,
                      })),
                    )
                  : downloadCsv(
                      "expenses.csv",
                      expenses.map((e) => ({
                        date: fmtDate(e.spent_on),
                        category: e.category ?? "",
                        description: e.description ?? "",
                        event: e.events?.title ?? "",
                        amount: e.amount,
                      })),
                    )
              }
            >
              <Download size={13} /> CSV
            </Btn>
            <Btn size="sm" onClick={() => setOpen((v) => !v)}>
              <Plus size={13} /> Log a contribution
            </Btn>
          </div>
        </div>

        {open && (
          <Card className="mt-5 p-6">
            <h2 className="text-[18px]">Log your contribution</h2>
            <MemberOnly what="Contribution logging">
              <ContributionForm onDone={() => setOpen(false)} />
            </MemberOnly>
          </Card>
        )}

        <div className="pt-8">
          {cons.isPending || exps.isPending ? (
            <Spinner label="Loading ledger" />
          ) : tab === "in" ? (
            contributions.length ? (
              <Card className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-[13.5px]">
                  <thead>
                    <tr className="border-b border-border bg-background text-left">
                      <Th>Date</Th>
                      <Th>Member</Th>
                      <Th>Purpose</Th>
                      <Th>Method</Th>
                      <Th className="text-right">Amount</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {contributions.map((c) => (
                      <tr key={c.id} className="border-b border-border-soft last:border-0">
                        <Td className="num text-faint">{fmtDate(c.created_at)}</Td>
                        <Td>
                          <span className="flex items-center gap-2">
                            <Avatar name={c.profiles?.full_name ?? "Anonymous"} src={c.profiles?.avatar_url} size={26} />
                            {c.profiles?.full_name ?? "Anonymous"}
                          </span>
                        </Td>
                        <Td className="text-muted-foreground">
                          {c.events?.title ?? c.note ?? "General fund"}
                        </Td>
                        <Td className="text-muted-foreground">{c.method ?? "—"}</Td>
                        <Td className="num text-right font-semibold text-ok">{bdt(c.amount)}</Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            ) : (
              <EmptyState title="No verified contributions yet" />
            )
          ) : expenses.length ? (
            <Card className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-[13.5px]">
                <thead>
                  <tr className="border-b border-border bg-background text-left">
                    <Th>Date</Th>
                    <Th>Category</Th>
                    <Th>Description</Th>
                    <Th>Event</Th>
                    <Th className="text-right">Amount</Th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((e) => (
                    <tr key={e.id} className="border-b border-border-soft last:border-0">
                      <Td className="num text-faint">{fmtDate(e.spent_on)}</Td>
                      <Td>{e.category ?? "—"}</Td>
                      <Td className="text-muted-foreground">{e.description ?? "—"}</Td>
                      <Td className="text-muted-foreground">{e.events?.title ?? "—"}</Td>
                      <Td className="num text-right font-semibold text-stop">{bdt(e.amount)}</Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          ) : (
            <EmptyState title="No expenses recorded yet" />
          )}
        </div>

        <MyContributions />
      </section>
    </>
  );
}

function Th({ children, className }: { children: React.ReactNode; className?: string }) {
  return <th className={`kicker px-4 py-3 font-semibold text-faint ${className ?? ""}`}>{children}</th>;
}
function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 align-middle ${className ?? ""}`}>{children}</td>;
}

function ContributionForm({ onDone }: { onDone: () => void }) {
  const { user, profile } = useAuth();
  const events = useQuery(eventsQuery);
  const qc = useQueryClient();
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("bKash");
  const [trx, setTrx] = useState("");
  const [eventId, setEventId] = useState("");
  const [note, setNote] = useState("");

  const m = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("contributions").insert({
        profile_id: profile?.id ?? null,
        user_id: user?.id ?? null,
        event_id: eventId || null,
        amount: Number(amount),
        method,
        trx_id: trx || null,
        note: note || null,
        status: "pending",
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("Logged. An admin will verify it before it appears on the ledger.");
      void qc.invalidateQueries({ queryKey: ["contributions"] });
      onDone();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <form
      className="mt-5 grid gap-4 md:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault();
        m.mutate();
      }}
    >
      <Field label="Amount (BDT)">
        <Input required type="number" min={1} value={amount} onChange={(e) => setAmount(e.target.value)} />
      </Field>
      <Field label="Method">
        <Select value={method} onChange={(e) => setMethod(e.target.value)}>
          {["bKash", "Nagad", "Rocket", "Bank transfer", "Cash"].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </Select>
      </Field>
      <Field label="Transaction ID" hint="From your bKash/Nagad/bank receipt">
        <Input value={trx} onChange={(e) => setTrx(e.target.value)} />
      </Field>
      <Field label="For which event?" hint="Leave blank for the general fund">
        <Select value={eventId} onChange={(e) => setEventId(e.target.value)}>
          <option value="">General fund</option>
          {(events.data ?? []).map((ev) => (
            <option key={ev.id} value={ev.id}>
              {ev.title}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Note" className="md:col-span-2">
        <Textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
      </Field>
      <div className="flex gap-2 md:col-span-2">
        <Btn type="submit" disabled={m.isPending}>
          {m.isPending ? "Submitting…" : "Submit for verification"}
        </Btn>
        <Btn type="button" variant="quiet" onClick={onDone}>
          Cancel
        </Btn>
      </div>
    </form>
  );
}

function MyContributions() {
  const { user, profile } = useAuth();
  const q = useQuery({
    queryKey: ["my-contributions", profile?.id],
    enabled: !!user && !!profile?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contributions")
        .select("id, amount, method, status, created_at, events(title)")
        .eq("profile_id", profile!.id)
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return (data ?? []) as unknown as {
        id: string;
        amount: number;
        method: string | null;
        status: string;
        created_at: string;
        events: { title: string } | null;
      }[];
    },
  });

  if (!user || !q.data?.length) return null;

  return (
    <div className="mt-14">
      <h2 className="text-[20px]">My contributions</h2>
      <p className="mt-1 text-[13.5px] text-faint">Including entries still awaiting verification.</p>
      <Card className="mt-5 divide-y divide-border-soft">
        {q.data.map((c) => (
          <div key={c.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5">
            <div>
              <span className="num text-[15px] font-semibold text-primary">{bdt(c.amount)}</span>
              <span className="ml-2 text-[13px] text-muted-foreground">
                {c.events?.title ?? "General fund"} · {c.method ?? "—"}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="num text-[12.5px] text-faint">{fmtDate(c.created_at)}</span>
              <StatusPill status={c.status} />
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}
