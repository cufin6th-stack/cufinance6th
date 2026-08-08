import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

import { CopyBanner } from "@/components/layout";
import { Card, EmptyState, Pill, Spinner, Tabs } from "@/components/ui";
import { postsQuery } from "@/lib/api";
import { fmtDate } from "@/lib/format";

export const Route = createFileRoute("/news/")({
  head: () => ({
    meta: [
      { title: "Batch news — Finance 6th Batch Alumni, CU" },
      {
        name: "description",
        content:
          "Promotions, achievements, milestones and condolences from the sixth batch of Finance, University of Chittagong.",
      },
      { property: "og:title", content: "Batch news — Finance 6th Batch Alumni, CU" },
      {
        property: "og:description",
        content: "What our batchmates are doing: achievements, milestones and remembrances.",
      },
    ],
  }),
  component: News,
});

type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  cover_url: string | null;
  category: string;
  published_at: string;
};

const CATS = ["All", "Achievement", "Milestone", "Condolence", "Update"];

function News() {
  const q = useQuery(postsQuery);
  const [cat, setCat] = useState("All");
  const rows = (q.data ?? []) as unknown as Post[];
  const shown = cat === "All" ? rows : rows.filter((p) => p.category === cat);

  return (
    <>
      <CopyBanner page="news" />
      <section className="wrap py-12">
        <Tabs
          tabs={CATS.map((c) => ({
            value: c,
            label: c,
            count: c === "All" ? rows.length : rows.filter((p) => p.category === c).length,
          }))}
          value={cat}
          onChange={setCat}
        />
        <div className="pt-8">
          {q.isPending ? (
            <Spinner label="Loading news" />
          ) : shown.length ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {shown.map((p) => (
                <Link key={p.id} to="/news/$slug" params={{ slug: p.slug }} className="block">
                  <Card className="card-lift h-full overflow-hidden">
                    {p.cover_url && (
                      <img src={p.cover_url} alt={p.title} loading="lazy" className="h-40 w-full object-cover" />
                    )}
                    <div className="p-5">
                      <div className="flex items-center gap-2">
                        <Pill tone="accent">{p.category}</Pill>
                        <span className="num text-[12px] text-faint">{fmtDate(p.published_at)}</span>
                      </div>
                      <h2 className="mt-2.5 text-[17px] leading-snug">{p.title}</h2>
                      <p className="mt-2 line-clamp-3 text-[13.5px] text-muted-foreground">{p.excerpt}</p>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState title="Nothing here yet" body="Send your news to an admin and it will be posted." />
          )}
        </div>
      </section>
    </>
  );
}
