import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { BellRing, Receipt } from "lucide-react";

import { MemberOnly } from "@/components/guards";
import { PageBanner } from "@/components/layout";
import { Card, EmptyState, Pill, Spinner } from "@/components/ui";
import { supabase } from "@/integrations/supabase/client";
import { fmtDate } from "@/lib/format";

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [
      { title: "Member updates — Finance 6th Batch Alumni, CU" },
      {
        name: "description",
        content:
          "Notices sent by the caretakers to signed-in members of the Finance 6th batch, University of Chittagong, including released event statements.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Member updates — Finance 6th Batch Alumni, CU" },
      { property: "og:description", content: "Caretaker updates for signed-in batchmates." },
    ],
  }),
  component: () => (
    <MemberOnly what="Member updates">
      <Updates />
    </MemberOnly>
  ),
});

type Notification = {
  id: string;
  title: string;
  body: string | null;
  created_at: string;
  audience: string | null;
  events: { slug: string; title: string; finance_published: boolean } | null;
};

function Updates() {
  const q = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("id, title, body, created_at, audience, events(slug, title, finance_published)")
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return (data ?? []) as unknown as Notification[];
    },
  });

  return (
    <>
      <PageBanner
        kicker="Members only"
        title="Updates from the caretakers."
        lede="Announcements, reminders and released event statements — sent to signed-in batchmates."
      />
      <section className="wrap py-12">
        {q.isPending ? (
          <Spinner label="Loading updates" />
        ) : q.data?.length ? (
          <div className="grid gap-4">
            {q.data.map((n) => (
              <Card key={n.id} className="p-6">
                <div className="flex flex-wrap items-center gap-3">
                  <BellRing size={15} className="text-accent" />
                  <h2 className="flex-1 text-[18px]">{n.title}</h2>
                  <span className="num text-[12.5px] text-faint">{fmtDate(n.created_at)}</span>
                  {n.audience === "registered" && <Pill tone="accent">Registered members</Pill>}
                </div>
                {n.body && (
                  <p className="mt-3 text-[14.5px] leading-relaxed whitespace-pre-line text-muted-foreground">
                    {n.body}
                  </p>
                )}
                {n.events && (
                  <Link
                    to="/events/$slug"
                    params={{ slug: n.events.slug }}
                    className="mt-4 inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-primary"
                  >
                    <Receipt size={13} />
                    {n.events.finance_published
                      ? `See the statement for ${n.events.title}`
                      : `Open ${n.events.title}`}
                  </Link>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState title="No updates yet" body="Caretaker announcements will appear here." />
        )}
      </section>
    </>
  );
}
