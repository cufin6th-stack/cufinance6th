import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { X } from "lucide-react";
import { useState } from "react";

import { PageBanner } from "@/components/layout";
import { Card, EmptyState, Spinner } from "@/components/ui";
import { albumsQuery } from "@/lib/api";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Photo gallery — Finance 6th Batch Alumni, CU" },
      {
        name: "description",
        content:
          "Photographs from reunions, iftar mahfils, picnics and campus days of the Finance 6th batch, University of Chittagong.",
      },
      { property: "og:title", content: "Photo gallery — Finance 6th Batch Alumni, CU" },
      { property: "og:description", content: "The visual archive of the Finance 6th batch." },
    ],
  }),
  component: Gallery,
});

type Album = {
  id: string;
  title: string;
  description: string | null;
  cover_url: string | null;
  gallery_photos: { id: string; image_url: string; caption: string | null }[];
};

function Gallery() {
  const q = useQuery(albumsQuery);
  const albums = (q.data ?? []) as unknown as Album[];
  const [lightbox, setLightbox] = useState<{ url: string; caption: string | null } | null>(null);

  return (
    <>
      <PageBanner
        kicker="Gallery"
        title="Proof that we were there."
        lede="Photographs from the campus years and every gathering since, kept where they will not disappear."
      />
      <section className="wrap py-12">
        {q.isPending ? (
          <Spinner label="Loading gallery" />
        ) : albums.length ? (
          <div className="space-y-14">
            {albums.map((a) => (
              <div key={a.id}>
                <h2 className="text-[22px]">{a.title}</h2>
                {a.description && <p className="mt-1 text-[13.5px] text-faint">{a.description}</p>}
                {a.gallery_photos?.length ? (
                  <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {a.gallery_photos.map((ph) => (
                      <button
                        key={ph.id}
                        onClick={() => setLightbox({ url: ph.image_url, caption: ph.caption })}
                        className="group overflow-hidden rounded-sm border border-border bg-card"
                      >
                        <img
                          src={ph.image_url}
                          alt={ph.caption ?? a.title}
                          loading="lazy"
                          className="h-40 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </button>
                    ))}
                  </div>
                ) : (
                  <Card className="mt-6 px-6 py-10 text-center text-[13.5px] text-faint">
                    Photos for this album are being collected.
                  </Card>
                )}
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="No albums yet" body="Send your photographs to an admin to have them archived." />
        )}
      </section>

      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/90 p-6"
          onClick={() => setLightbox(null)}
        >
          <button
            aria-label="Close"
            className="absolute top-5 right-5 text-white/70 hover:text-accent"
            onClick={() => setLightbox(null)}
          >
            <X size={22} />
          </button>
          <figure className="max-h-full max-w-4xl">
            <img src={lightbox.url} alt={lightbox.caption ?? ""} className="max-h-[80vh] rounded-md object-contain" />
            {lightbox.caption && (
              <figcaption className="mt-3 text-center text-[13px] text-white/60">{lightbox.caption}</figcaption>
            )}
          </figure>
        </div>
      )}
    </>
  );
}
