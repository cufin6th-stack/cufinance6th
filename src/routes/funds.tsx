import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Download, Plus } from "lucide-react";
import { useState } from "react";

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
  component: () => (
    <MemberOnly what="The fund ledger">
      <Funds />
    </MemberOnly>
  ),
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
  const events = useQuery(eventsQuery);
  const [tab, setTab] = useState<"in" | "out">("in");
  const [eventFilter, setEventFilter] = useState("");

  const matches = (slug: string | null | undefined) =>
    !eventFilter || (eventFilter === "general" ? !slug : slug === eventFilter);

  const contributions = ((cons.data ?? []) as unknown as Contribution[]).filter(
    (c) => c.status === "verified" && matches(c.events?.slug),
  );
  const expenses = ((exps.data ?? []) as unknown as Expense[]).filter((e) => matches(e.events?.slug));

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
        <Card className="grid gap-3 p-4 sm:grid-cols-[1fr_auto] sm:items-center">
          <Field label="Filter by event" className="mb-0">
            <Select
              value={eventFilter}
              onChange={(e) => setEventFilter(e.target.value)}
              aria-label="Filter the ledger by event"
            >
              <option value="">All events &amp; general fund</option>
              <option value="general">General fund only</option>
              {(events.data ?? []).map((ev) => (
                <option key={ev.id} value={ev.slug}>
                  {ev.title}
                </option>
              ))}
            </Select>
          </Field>
          <p className="text-[12.5px] text-faint sm:pt-5">
            Showing <span className="num font-semibold text-primary">{contributions.length}</span> contributions and{" "}
            <span className="num font-semibold text-primary">{expenses.length}</span> expenses.
          </p>
        </Card>

        <Card className="mt-6 grid grid-cols-3">
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
            <Link to="/contribute" className="contents">
              <Btn size="sm">
                <Plus size={13} /> Log a contribution
              </Btn>
            </Link>
          </div>
        </div>


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
