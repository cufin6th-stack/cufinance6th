import { cva, type VariantProps } from "class-variance-authority";
import type { ReactNode, ButtonHTMLAttributes, InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

import { cn } from "@/lib/utils";
import { avatarTone, initials } from "@/lib/format";

/* ---------- Button ---------- */
export const btn = cva(
  "inline-flex items-center justify-center gap-2 rounded-sm border border-transparent font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:bg-primary-mid",
        accent: "bg-accent text-accent-foreground hover:bg-accent/85",
        ghost: "bg-transparent text-primary border-border hover:border-primary hover:bg-primary-soft",
        onDark: "bg-transparent text-primary-foreground border-white/35 hover:bg-white/10",
        danger: "bg-stop-soft text-stop hover:bg-stop hover:text-white",
        quiet: "bg-transparent text-muted-foreground hover:text-primary",
      },
      size: {
        md: "px-[18px] py-[10px] text-sm",
        sm: "px-[15px] py-[7px] text-[13px]",
        xs: "px-[10px] py-[5px] text-[12px]",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export function Btn({
  className,
  variant,
  size,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof btn>) {
  return <button className={cn(btn({ variant, size }), className)} {...props} />;
}

/* ---------- Pill ---------- */
const pill = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-semibold tracking-wide",
  {
    variants: {
      tone: {
        ok: "bg-ok-soft text-ok",
        wait: "bg-wait-soft text-wait",
        stop: "bg-stop-soft text-stop",
        neutral: "bg-primary-soft text-primary",
        accent: "bg-accent-soft text-accent-foreground",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

export function Pill({
  children,
  tone,
  className,
}: { children: ReactNode; className?: string } & VariantProps<typeof pill>) {
  return <span className={cn(pill({ tone }), className)}>{children}</span>;
}

export function StatusPill({ status }: { status: string }) {
  const tone = status === "verified" ? "ok" : status === "rejected" ? "stop" : "wait";
  return <Pill tone={tone}>{status[0]?.toUpperCase() + status.slice(1)}</Pill>;
}

/* ---------- Form ---------- */
export function Field({
  label,
  hint,
  children,
  className,
}: {
  label?: string | undefined;
  hint?: string | undefined;
  children: ReactNode;
  className?: string | undefined;
}) {
  return (
    <label className={cn("block", className)}>
      {label && <span className="mb-1.5 block text-[13.5px] font-semibold text-ink">{label}</span>}
      {children}
      {hint && <span className="mt-1.5 block text-[12.5px] text-faint">{hint}</span>}
    </label>
  );
}

const inputCls =
  "w-full rounded-sm border border-border bg-card px-3.5 py-2.5 text-[14.5px] text-foreground outline-none transition placeholder:text-faint focus:border-primary focus:shadow-[0_0_0_3px_var(--primary-soft)]";

export function Input({ className, ...p }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(inputCls, className)} {...p} />;
}
export function Textarea({ className, ...p }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(inputCls, "min-h-24 resize-y", className)} {...p} />;
}
export function Select({ className, ...p }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn(inputCls, "cursor-pointer appearance-none pr-9", className)} {...p} />;
}

/* ---------- Surfaces ---------- */
export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("rounded-md border border-border bg-card", className)}>{children}</div>;
}

export function SectionHead({
  title,
  sub,
  action,
}: {
  title: string;
  sub?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h2 className="text-[22px]">{title}</h2>
        {sub && <p className="mt-1 text-[13.5px] text-faint">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({ title, body, action }: { title: string; body?: string; action?: ReactNode }) {
  return (
    <div className="rounded-md border border-dashed border-border bg-card px-6 py-14 text-center">
      <h3 className="text-[17px]">{title}</h3>
      {body && <p className="mx-auto mt-1.5 max-w-[38ch] text-[13.5px] text-muted-foreground">{body}</p>}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}

export function Avatar({
  name,
  src,
  size = 56,
  className,
}: {
  name: string;
  src?: string | null | undefined;
  size?: number | undefined;
  className?: string | undefined;
}) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        loading="lazy"
        style={{ width: size, height: size }}
        className={cn("shrink-0 rounded-full object-cover", className)}
      />
    );
  }
  return (
    <span
      style={{ width: size, height: size, fontSize: Math.max(11, size * 0.36) }}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white",
        avatarTone(name),
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}

export function Spinner({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-16 text-[13px] text-faint">
      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-border border-t-primary" />
      {label}
    </div>
  );
}

export function Tabs<T extends string>({
  tabs,
  value,
  onChange,
}: {
  tabs: { value: T; label: string; count?: number }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex overflow-x-auto border-b border-border bg-background">
      {tabs.map((t) => (
        <button
          key={t.value}
          onClick={() => onChange(t.value)}
          className={cn(
            "shrink-0 border-b-2 px-[18px] py-3 text-[13.5px] font-semibold whitespace-nowrap transition-colors",
            value === t.value
              ? "border-accent bg-card text-primary"
              : "border-transparent text-muted-foreground hover:text-primary",
          )}
        >
          {t.label}
          {t.count !== undefined && <span className="num ml-1.5 text-[12px] text-faint">{t.count}</span>}
        </button>
      ))}
    </div>
  );
}

export function SumCell({ label, value, tone }: { label: string; value: string; tone?: "in" | "out" | "bal" }) {
  return (
    <div className="border-r border-border-soft px-5 py-4 last:border-r-0">
      <div className="kicker text-faint">{label}</div>
      <div
        className={cn(
          "num mt-1 text-[20px] font-semibold",
          tone === "in" && "text-ok",
          tone === "out" && "text-stop",
          tone === "bal" && "text-primary",
        )}
      >
        {value}
      </div>
    </div>
  );
}
