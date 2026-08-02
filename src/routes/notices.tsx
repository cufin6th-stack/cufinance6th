import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Paperclip, Pin } from "lucide-react";

import { PageBanner } from "@/components/layout";
import { Card, EmptyState, Spinner } from "@/components/ui";
import { noticesQuery } from "@/lib/api";
import { fmtDate } from "@/lib/format";

export const Route = createFileRoute("/notices")({
  head: () => ({
    meta: [
      { title: "Notice board — Finance 6th Batch Alumni, CU" },
      {
        name: "description",
        content:
          "Official notices, deadlines and decisions of the Finance 6th batch alumni body, University of Chittagong.",
      },
      { property: "og:title", content: "Notice board — Finance 6th Batch Alumni, CU" },
      {
        property: "og:description",
        content: "Every batch notice in one dated, permanent list.",
      },
    ],
  }),
  component: Notices,
});

type Notice = {
  id: string;
  title: string;
  body: string;
  attachment_url: string | null;
  is_pinned: boolean;
  published_at: string;
};

function Notices() {
  const q = useQuery(noticesQuery);
  const rows = (q.data ?? []) as unknown as Notice[];

  return (
    <>
      <PageBanner
        kicker="Notices"
        title="Decisions, deadlines and dues."
        lede="If it matters to the batch, it is written down here with a date on it."
      />
      <section className="wrap py-12">
        {q.isPending ? (
          <Spinner label="Loading notices" />
        ) : rows.length ? (
          <div className="grid gap-4">
            {rows.map((n) => (
              <Card key={n.id} className="p-6">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="num text-[12.5px] text-faint">{fmtDate(n.published_at)}</span>
                  {n.is_pinned && (
                    <span className="kicker inline-flex items-center gap-1 rounded-full bg-accent-soft px-2.5 py-0.5 text-accent-foreground">
                      <Pin size={10} /> Pinned
                    </span>
                  )}
                </div>
                <h2 className="mt-2 text-[20px]">{n.title}</h2>
                <p className="mt-3 text-[14.5px] leading-relaxed whitespace-pre-line text-muted-foreground">
                  {n.body}
                </p>
                {n.attachment_url && (
                  <a
                    href={n.attachment_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-primary"
                  >
                    <Paperclip size={13} /> Attachment
                  </a>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState title="No notices published yet" />
        )}
      </section>
    </>
  );
}
