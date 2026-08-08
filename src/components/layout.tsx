import { Link, useRouterState } from "@tanstack/react-router";
import { Facebook, Menu, Phone, X, ChevronDown } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

import { supabase } from "@/integrations/supabase/client";
import { lines, useCopy } from "@/lib/copy";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { Avatar, Btn } from "@/components/ui";

export const NAV = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/members", label: "Members" },
  { to: "/events", label: "Events" },
  
  { to: "/notices", label: "Notices" },
  { to: "/news", label: "News" },
  { to: "/gallery", label: "Gallery" },
  { to: "/contact", label: "Contact" },
] as const;

const FB_GROUP = "https://facebook.com/groups";

function Brand({ logo, badge, size }: { logo: string; badge: string; size: number }) {
  return logo ? (
    <img
      src={logo}
      alt=""
      style={{ height: size, width: size }}
      className="rounded-sm object-cover"
    />
  ) : (
    <span
      style={{ height: size, width: size }}
      className="flex items-center justify-center rounded-sm bg-accent font-display text-[17px] font-bold text-accent-foreground"
    >
      {badge}
    </span>
  );
}

export function AnnouncementBar() {
  const [message, setMessage] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    let alive = true;
    supabase
      .from("announcements")
      .select("message")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (!alive || !data?.message) return;
        setMessage(data.message);
        setDismissed(sessionStorage.getItem("ann-dismissed") === data.message);
      });
    return () => {
      alive = false;
    };
  }, []);

  if (!message || dismissed) return null;

  return (
    <div className="bg-ink text-[12.5px] text-white/80">
      <div className="wrap flex items-center gap-3 py-2">
        <span className="kicker text-accent">Notice</span>
        <p className="flex-1 truncate">{message}</p>
        <button
          aria-label="Dismiss announcement"
          onClick={() => {
            sessionStorage.setItem("ann-dismissed", message);
            setDismissed(true);
          }}
          className="text-white/50 transition-colors hover:text-accent"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const { user, profile, isStaff, signOut } = useAuth();
  const site = useCopy("site");
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    setOpen(false);
    setMenu(false);
  }, [pathname]);

  return (
    <>
      <div className="bg-primary text-primary-foreground">
        <div className="wrap flex items-center gap-4 py-5">
          <Link to="/" className="flex items-center gap-3">
            <Brand logo={site["logo_image"] ?? ""} badge={site["brand_badge"] ?? "06"} size={44} />
            <span>
              <span className="block font-display text-[17px] leading-tight font-semibold">
                {site["brand_name"]}
              </span>
              <span className="block text-[11.5px] tracking-wide text-white/60">
                {site["brand_tagline"]}
              </span>
            </span>
          </Link>
          <a
            href={site["facebook_url"] || FB_GROUP}
            target="_blank"
            rel="noreferrer"
            aria-label="Facebook group"
            className="ml-auto hidden h-9 w-9 items-center justify-center rounded-full border border-white/25 text-white/75 transition-colors hover:border-accent hover:text-accent sm:flex"
          >
            <Facebook size={15} />
          </a>
          {site["header_phone"] && (
            <a
              href={`tel:${site["header_phone"].replace(/\s/g, "")}`}
              className="hidden items-center gap-2 text-[12.5px] text-white/70 transition-colors hover:text-accent md:flex"
            >
              <Phone size={13} /> {site["header_phone"]}
            </a>
          )}
        </div>
      </div>

      <nav className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur">
        <div className="wrap flex items-center gap-1 py-2.5">
          <div className="hidden flex-1 items-center gap-1 lg:flex">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                activeOptions={{ exact: n.to === "/" }}
                activeProps={{ className: "text-primary font-semibold border-accent" }}
                inactiveProps={{ className: "text-muted-foreground border-transparent" }}
                className="border-b-2 px-3 py-2 text-[13.5px] transition-colors hover:text-primary"
              >
                {n.label}
              </Link>
            ))}
          </div>

          <button
            className="flex items-center gap-2 py-1.5 text-[13.5px] font-semibold text-primary lg:hidden"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={17} /> : <Menu size={17} />} Menu
          </button>

          <div className="ml-auto flex items-center gap-2">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setMenu((v) => !v)}
                  className="flex items-center gap-2 rounded-full border border-border py-1 pr-2.5 pl-1 text-[13px] font-semibold text-primary"
                >
                  <Avatar name={profile?.full_name ?? "Member"} src={profile?.avatar_url} size={26} />
                  <span className="hidden max-w-28 truncate sm:block">
                    {profile?.nickname || profile?.full_name?.split(" ")[0] || "Account"}
                  </span>
                  <ChevronDown size={13} />
                </button>
                {menu && (
                  <div className="absolute right-0 z-50 mt-2 w-52 overflow-hidden rounded-md border border-border bg-card shadow-lift">
                    <Link to="/profile" className="block px-4 py-2.5 text-[13.5px] hover:bg-primary-soft">
                      My profile
                    </Link>
                    <Link to="/notifications" className="block px-4 py-2.5 text-[13.5px] hover:bg-primary-soft">
                      Member updates
                    </Link>
                    <Link to="/funds" className="block px-4 py-2.5 text-[13.5px] hover:bg-primary-soft">
                      Batch accounts
                    </Link>
                    {isStaff && (
                      <Link to="/admin" className="block px-4 py-2.5 text-[13.5px] hover:bg-primary-soft">
                        Admin panel
                      </Link>
                    )}
                    <button
                      onClick={() => void signOut()}
                      className="block w-full px-4 py-2.5 text-left text-[13.5px] text-stop hover:bg-stop-soft"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/auth" search={{ mode: "signin" }} className="contents">
                <Btn size="sm">Sign in</Btn>
              </Link>
            )}
          </div>
        </div>

        {open && (
          <div className="wrap grid gap-1 border-t border-border pt-2 pb-4 lg:hidden">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                activeOptions={{ exact: n.to === "/" }}
                activeProps={{ className: "bg-primary-soft text-primary font-semibold" }}
                className="rounded-sm px-3 py-2.5 text-[14px] text-muted-foreground"
              >
                {n.label}
              </Link>
            ))}
          </div>
        )}
      </nav>
    </>
  );
}

export function Footer() {
  const site = useCopy("site");
  return (
    <footer className="mt-20 bg-primary text-[13.5px] text-white/70">
      <div className="wrap grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            <Brand logo={site["logo_image"] ?? ""} badge={site["brand_badge"] ?? "06"} size={40} />
            <span className="font-display text-[16px] font-semibold text-white">{site["brand_name"]}</span>
          </div>
          <p className="mt-4 max-w-[42ch] leading-relaxed">{site["footer_about"]}</p>
          <p className="mt-4 text-white/50">
            {lines(site["footer_address"] ?? "").map((l, i) => (
              <span key={l} className="block">
                {i > 0 ? l : l}
              </span>
            ))}
          </p>
        </div>
        <div>
          <h5 className="mb-3 font-display text-[15px] font-semibold text-white">
            {site["footer_links_title"]}
          </h5>
          {[
            { to: "/", label: "Home" },
            { to: "/about", label: "About the batch" },
            { to: "/members", label: "Member directory" },
            { to: "/events", label: "Events" },
            { to: "/privacy", label: "Privacy policy" },
          ].map((l) => (
            <Link key={l.to} to={l.to} className="block py-1 transition-colors hover:text-accent">
              {l.label}
            </Link>
          ))}
        </div>
        <div>
          <h5 className="mb-3 font-display text-[15px] font-semibold text-white">
            {site["footer_contact_title"]}
          </h5>
          {lines(site["footer_contacts"] ?? "").map((c) => (
            <p key={c} className="num py-1">
              {c}
            </p>
          ))}
          <p className="py-1 text-white/50">{site["footer_hours"]}</p>
          <a
            href={site["facebook_url"] || FB_GROUP}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/25 transition-colors hover:border-accent hover:text-accent"
            aria-label="Facebook group"
          >
            <Facebook size={15} />
          </a>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="wrap flex flex-wrap items-center justify-between gap-2 py-5 text-[12.5px] text-white/45">
          <span>
            © {new Date().getFullYear()} {site["footer_copyright"]}
          </span>
          <span className="num">{site["footer_note"]}</span>
        </div>
      </div>
    </footer>
  );
}

/** Page banner whose kicker, heading, intro and background image come from editable page copy. */
export function CopyBanner({
  page,
  fallbackImage,
  children,
}: {
  page: string;
  fallbackImage?: string;
  children?: ReactNode;
}) {
  const copy = useCopy(page);
  const image = copy["banner_image"]?.trim() || fallbackImage;
  return (
    <PageBanner
      kicker={copy["banner_kicker"] ?? ""}
      title={copy["banner_title"] ?? ""}
      lede={copy["banner_lede"] ?? ""}
      {...(image ? { image } : {})}
    >
      {children}
    </PageBanner>
  );
}

export function PageBanner({
  kicker,
  title,
  lede,
  image,
  children,
}: {
  kicker?: string;
  title: string;
  lede?: string;
  image?: string;
  children?: ReactNode;
}) {
  return (
    <header
      className={cn("relative overflow-hidden bg-primary text-primary-foreground")}
      style={
        image
          ? { backgroundImage: `url(${image})`, backgroundSize: "cover", backgroundPosition: "center" }
          : undefined
      }
    >
      {image && <div className="absolute inset-0 bg-primary/85" />}
      <div className="wrap relative py-16">
        {kicker && <span className="kicker text-accent">{kicker}</span>}
        <h1 className="mt-3 max-w-[24ch] text-[34px] leading-tight text-white sm:text-[40px]">{title}</h1>
        {lede && <p className="mt-4 max-w-[56ch] text-[15px] text-white/70">{lede}</p>}
        {children && <div className="mt-7">{children}</div>}
      </div>
    </header>
  );
}
