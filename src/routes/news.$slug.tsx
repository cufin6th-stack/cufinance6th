import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

import { Pill, Spinner } from "@/components/ui";
import { supabase } from "@/integrations/supabase/client";
import { fmtDate } from "@/lib/format";

export const Route = createFileRoute("/news/$slug")({
  head: () => ({
    meta: [
      { title: "Batch news — Finance 6th Batch Alumni, CU" },
      {
        name: "description",
        content: "A news post from the Finance 6th batch alumni body, University of Chittagong.",
      },
      { property: "og:title", content: "Batch news — Finance 6th Batch Alumni, CU" },
      { property: "og:description", content: "News and milestones from the Finance 6th batch." },
    ],
  }),
  component: NewsDetail,
});

function NewsDetail() {
  const { slug } = Route.useParams();
  const q = useQuery({
    queryKey: ["post", slug],
    queryFn: async () => {
      const { data, error } = await supabase.from("posts").select("*").eq("slug", slug).maybeSingle();
      if (error) throw new Error(error.message);
      return data as {
        title: string;
        body: string | null;
        excerpt: string | null;
        cover_url: string | null;
        category: string;
        published_at: string;
      } | null;
    },
  });

  if (q.isPending) return <Spinner label="Loading post" />;
  const p = q.data;
  if (!p)
    return (
      <div className="wrap py-24 text-center">
        <h1 className="text-[26px]">Post not found</h1>
        <Link to="/news" className="mt-4 inline-block text-[13.5px] font-semibold text-primary">
          ← All news
        </Link>
      </div>
    );

  return (
    <article className="wrap max-w-[70ch] py-14">
      <Link to="/news" className="inline-flex items-center gap-1.5 text-[13px] text-faint">
        <ArrowLeft size={13} /> All news
      </Link>
      <div className="mt-6 flex items-center gap-3">
        <Pill tone="accent">{p.category}</Pill>
        <span className="num text-[12.5px] text-faint">{fmtDate(p.published_at)}</span>
      </div>
      <h1 className="mt-3 text-[34px] leading-tight">{p.title}</h1>
      {p.excerpt && <p className="mt-4 text-[16px] leading-relaxed text-muted-foreground">{p.excerpt}</p>}
      {p.cover_url && (
        <img
          src={p.cover_url}
          alt={p.title}
          className="mt-8 w-full rounded-md border border-border object-cover"
        />
      )}
      {p.body && (
        <div className="mt-8 space-y-4 text-[15px] leading-relaxed whitespace-pre-line text-foreground">
          {p.body}
        </div>
      )}
    </article>
  );
}
