export const bdt = (n: number | string | null | undefined) => {
  const v = Number(n ?? 0);
  return "৳ " + v.toLocaleString("en-US", { maximumFractionDigits: 0 });
};

export const fmtDate = (d: string | Date | null | undefined, opts?: Intl.DateTimeFormatOptions) =>
  d
    ? new Date(d).toLocaleDateString("en-GB", opts ?? { day: "numeric", month: "short", year: "numeric" })
    : "";

export const fmtDateTime = (d: string | Date | null | undefined) =>
  d
    ? new Date(d).toLocaleString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "";

export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const dayMonth = (day?: number | null, month?: number | null) => {
  if (!day || !month) return "";
  const m = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${day} ${m[month] ?? ""}`;
};


export const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

export const avatarTone = (seed: string) => {
  let h = 0;
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) % 4;
  return ["bg-av-1", "bg-av-2", "bg-av-3", "bg-av-4"][h] as string;
};

export const toCsv = (rows: Record<string, unknown>[]) => {
  if (!rows.length) return "";
  const cols = Object.keys(rows[0]!);
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  return [cols.join(","), ...rows.map((r) => cols.map((c) => esc(r[c])).join(","))].join("\n");
};

export const downloadCsv = (filename: string, rows: Record<string, unknown>[]) => {
  const blob = new Blob([toCsv(rows)], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

export const FIELDS = [
  "Banking",
  "Academia",
  "Corporate",
  "Government",
  "Business",
  "Engineering",
  "Healthcare",
  "Expatriate",
  "Other",
] as const;
