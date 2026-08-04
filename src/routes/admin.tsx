import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { CrudSection, EditForm, type CrudConfig, type FieldDef, type Row } from "@/components/admin/crud";
import { AdminOnly } from "@/components/guards";
import { Avatar, Btn, Card, EmptyState, Pill, Spinner, StatusPill, Tabs } from "@/components/ui";
import { supabase } from "@/integrations/supabase/client";
import {
  allProfilesQuery,
  eventsQuery,
  messagesQuery,
  pendingProfilesQuery,
  registrationsQuery,
} from "@/lib/api";
import { useAuth, type Profile } from "@/lib/auth";
import { PAGE_COPY, siteContentQuery } from "@/lib/copy";
import { bdt, downloadCsv, fmtDate } from "@/lib/format";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin panel — Finance 6th Batch Alumni, CU" },
      {
        name: "description",
        content:
          "Volunteer caretaker panel for the Finance 6th batch: edit every page, event, notice and album, approve members, verify contributions and release event statements.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Admin panel — Finance 6th Batch Alumni, CU" },
      { property: "og:description", content: "Caretaker tools for the Finance 6th batch alumni record." },
    ],
  }),
  component: () => (
    <AdminOnly>
      <Admin />
    </AdminOnly>
  ),
});

type Tab =
  | "approvals"
  | "members"
  | "roles"
  | "events"
  | "registrations"
  | "contributions"
  | "expenses"
  | "notices"
  | "news"
  | "albums"
  | "photos"
  | "slider"
  | "announcements"
  | "notify"
  | "pages"
  | "messages";

const STATUS_OPTIONS = [
  { value: "published", label: "Published" },
  { value: "draft", label: "Draft" },
];

function Admin() {
  const { profile } = useAuth();
  const [tab, setTab] = useState<Tab>("approvals");
  const events = useQuery(eventsQuery);
  const albums = useQuery({
    queryKey: ["albums-list"],
    queryFn: async () => {
      const { data, error } = await supabase.from("gallery_albums").select("id, title").order("title");
      if (error) throw new Error(error.message);
      return data ?? [];
    },
  });

  const eventOptions = [
    { value: "", label: "— General / none —" },
    ...(events.data ?? []).map((e) => ({ value: e.id, label: e.title })),
  ];
  const albumOptions = (albums.data ?? []).map((a) => ({ value: a.id, label: a.title }));

  const configs: Partial<Record<Tab, CrudConfig>> = {
    events: {
      table: "events",
      queryKey: "admin-events",
      order: { column: "event_date", ascending: false },
      invalidate: ["events", "public-stats"],
      newLabel: "New event",
      primary: (r) => String(r["title"] ?? ""),
      secondary: (r) => `${fmtDate(String(r["event_date"]))} · ${String(r["venue"] ?? "—")}`,
      extraRowAction: (r) => (
        <Pill tone={r["finance_published"] ? "ok" : "wait"}>
          {r["finance_published"] ? "Statement released" : "Statement private"}
        </Pill>
      ),
      fields: [
        { name: "title", label: "Title", type: "text", required: true },
        { name: "slug", label: "URL slug", type: "text", required: true, hint: "e.g. reunion-2026" },
        { name: "event_date", label: "Date & time", type: "datetime", required: true },
        { name: "venue", label: "Venue", type: "text" },
        { name: "map_url", label: "Map link", type: "text" },
        { name: "status", label: "Status", type: "select", options: STATUS_OPTIONS },
        { name: "cover_url", label: "Cover image", type: "image" },
        { name: "summary", label: "Short summary", type: "text", full: true },
        { name: "description", label: "Full description", type: "textarea" },
        { name: "fee_single", label: "Fee — single", type: "number" },
        { name: "fee_couple", label: "Fee — couple", type: "number" },
        { name: "fee_child", label: "Fee — child/guest", type: "number" },
        { name: "goal_amount", label: "Collection goal", type: "number" },
        { name: "contact_info", label: "Contact info", type: "text" },
        {
          name: "finance_published",
          label: "Release the final statement to members",
          type: "bool",
          hint: "Off: only admins and moderators see this event's money. On: signed-in members see the final figures.",
        },
        { name: "finance_note", label: "Statement note for members", type: "textarea" },
      ],
    },
    notices: {
      table: "notices",
      queryKey: "admin-notices",
      order: { column: "published_at", ascending: false },
      invalidate: ["notices"],
      newLabel: "New notice",
      primary: (r) => String(r["title"] ?? ""),
      secondary: (r) => fmtDate(String(r["published_at"])),
      fields: [
        { name: "title", label: "Title", type: "text", required: true },
        { name: "status", label: "Status", type: "select", options: STATUS_OPTIONS },
        { name: "body", label: "Notice text", type: "textarea" },
        { name: "attachment_url", label: "Attachment / image", type: "image" },
        { name: "is_pinned", label: "Pin to the top", type: "bool" },
      ],
    },
    news: {
      table: "posts",
      queryKey: "admin-posts",
      order: { column: "published_at", ascending: false },
      invalidate: ["posts"],
      newLabel: "New news post",
      primary: (r) => String(r["title"] ?? ""),
      secondary: (r) => `${String(r["category"] ?? "—")} · ${fmtDate(String(r["published_at"]))}`,
      fields: [
        { name: "title", label: "Title", type: "text", required: true },
        { name: "slug", label: "URL slug", type: "text", required: true },
        { name: "category", label: "Category", type: "text", hint: "Promotion, Achievement, Condolence…" },
        { name: "status", label: "Status", type: "select", options: STATUS_OPTIONS },
        { name: "cover_url", label: "Cover image", type: "image" },
        { name: "excerpt", label: "Excerpt", type: "text", full: true },
        { name: "body", label: "Body", type: "textarea" },
      ],
    },
    albums: {
      table: "gallery_albums",
      queryKey: "admin-albums",
      order: { column: "created_at", ascending: false },
      invalidate: ["albums", "albums-list"],
      newLabel: "New album",
      primary: (r) => String(r["title"] ?? ""),
      secondary: (r) => String(r["description"] ?? ""),
      fields: [
        { name: "title", label: "Album title", type: "text", required: true },
        { name: "slug", label: "URL slug", type: "text", required: true },
        { name: "cover_url", label: "Cover image", type: "image" },
        { name: "description", label: "Description", type: "textarea" },
      ],
    },
    photos: {
      table: "gallery_photos",
      queryKey: "admin-photos",
      order: { column: "sort_order", ascending: true },
      invalidate: ["albums"],
      newLabel: "Upload photo",
      primary: (r) => String(r["caption"] ?? "Untitled photo"),
      secondary: (r) =>
        albumOptions.find((a) => a.value === String(r["album_id"]))?.label ?? "Unassigned album",
      fields: [
        { name: "album_id", label: "Album", type: "select", options: albumOptions, required: true },
        { name: "image_url", label: "Photo", type: "image" },
        { name: "caption", label: "Caption", type: "text" },
        { name: "sort_order", label: "Sort order", type: "number" },
      ],
    },
    slider: {
      table: "home_slider",
      queryKey: "admin-slider",
      order: { column: "sort_order", ascending: true },
      invalidate: ["slider"],
      newLabel: "New home slide",
      primary: (r) => String(r["title"] ?? ""),
      secondary: (r) => String(r["kicker"] ?? ""),
      fields: [
        { name: "title", label: "Headline", type: "text", required: true },
        { name: "kicker", label: "Kicker", type: "text" },
        { name: "description", label: "Description", type: "textarea" },
        { name: "image_url", label: "Background image", type: "image" },
        { name: "cta_label", label: "Button label", type: "text" },
        { name: "cta_url", label: "Button link", type: "text", hint: "e.g. /members or /events" },
        { name: "sort_order", label: "Sort order", type: "number" },
        { name: "is_active", label: "Active", type: "bool" },
      ],
    },
    announcements: {
      table: "announcements",
      queryKey: "admin-announcements",
      order: { column: "created_at", ascending: false },
      newLabel: "New announcement bar",
      primary: (r) => String(r["message"] ?? ""),
      secondary: (r) => (r["is_active"] ? "Active" : "Hidden"),
      fields: [
        { name: "message", label: "Message", type: "text", required: true, full: true },
        { name: "link_url", label: "Link", type: "text" },
        { name: "is_active", label: "Show on the site", type: "bool" },
      ],
    },
    notify: {
      table: "notifications",
      queryKey: "notifications",
      order: { column: "created_at", ascending: false },
      newLabel: "Notify members",
      primary: (r) => String(r["title"] ?? ""),
      secondary: (r) => fmtDate(String(r["created_at"])),
      fields: [
        { name: "title", label: "Subject", type: "text", required: true },
        { name: "body", label: "Message", type: "textarea" },
        { name: "event_id", label: "Related event", type: "select", options: eventOptions },
        {
          name: "audience",
          label: "Audience",
          type: "select",
          options: [
            { value: "members", label: "All signed-in members" },
            { value: "registered", label: "Registered members of the event" },
          ],
        },
      ],
    },
    expenses: {
      table: "expenses",
      queryKey: "admin-expenses",
      order: { column: "spent_on", ascending: false },
      invalidate: ["expenses"],
      newLabel: "Record an expense",
      primary: (r) => `${bdt(Number(r["amount"] ?? 0))} · ${String(r["category"] ?? "")}`,
      secondary: (r) => `${fmtDate(String(r["spent_on"]))} · ${String(r["description"] ?? "")}`,
      fields: [
        { name: "category", label: "Category", type: "text", required: true },
        { name: "amount", label: "Amount (BDT)", type: "number", required: true },
        { name: "spent_on", label: "Spent on", type: "date" },
        { name: "event_id", label: "Event", type: "select", options: eventOptions },
        { name: "description", label: "Description", type: "textarea" },
        { name: "receipt_url", label: "Receipt image", type: "image" },
      ],
    },
    members: {
      table: "profiles",
      queryKey: "admin-profiles",
      order: { column: "full_name", ascending: true },
      invalidate: ["all-profiles", "members-public", "members-full", "pending-profiles"],
      newLabel: "Add a member record",
      primary: (r) => String(r["full_name"] ?? ""),
      secondary: (r) =>
        [r["job_title"], r["organization"], r["city"], r["email"]].filter(Boolean).join(" · ") || "—",
      extraRowAction: (r) => (
        <Pill tone={r["is_approved"] ? "ok" : "wait"}>{r["is_approved"] ? "Approved" : "Pending"}</Pill>
      ),
      fields: [
        { name: "full_name", label: "Full name", type: "text", required: true },
        { name: "nickname", label: "Nickname", type: "text" },
        { name: "avatar_url", label: "Photo", type: "image" },
        { name: "job_title", label: "Job title", type: "text" },
        { name: "organization", label: "Organisation", type: "text" },
        { name: "field", label: "Field", type: "text" },
        { name: "city", label: "City", type: "text" },
        { name: "country", label: "Country", type: "text" },
        { name: "phone", label: "Phone", type: "text" },
        { name: "whatsapp", label: "WhatsApp", type: "text" },
        { name: "email", label: "Email", type: "text" },
        { name: "facebook_url", label: "Facebook", type: "text" },
        { name: "linkedin_url", label: "LinkedIn", type: "text" },
        { name: "blood_group", label: "Blood group", type: "text" },
        { name: "section", label: "Section", type: "text" },
        { name: "roll", label: "Roll", type: "text" },
        { name: "bio", label: "Bio", type: "textarea" },
        { name: "hide_phone", label: "Hide phone from members", type: "bool" },
        { name: "is_approved", label: "Approved member", type: "bool" },
      ],
    },
    roles: {
      table: "user_roles",
      queryKey: "admin-roles",
      order: { column: "created_at", ascending: false },
      invalidate: ["all-roles"],
      newLabel: "Grant a role",
      primary: (r) => String(r["role"] ?? ""),
      secondary: (r) => `User ID ${String(r["user_id"] ?? "")}`,
      fields: [
        { name: "user_id", label: "User ID", type: "text", required: true, hint: "Auth user id of the batchmate" },
        {
          name: "role",
          label: "Role",
          type: "select",
          options: [
            { value: "member", label: "Member" },
            { value: "moderator", label: "Moderator" },
            { value: "admin", label: "Admin" },
          ],
        },
      ],
    },
  };

  return (
    <section className="wrap py-10">
      <div>
        <span className="kicker text-accent">Caretaker panel</span>
        <h1 className="mt-2 text-[28px]">Batch administration</h1>
        <p className="mt-1 max-w-[70ch] text-[13.5px] text-faint">
          Signed in as {profile?.full_name ?? "admin"}. Every page, event, notice, album and record on the site
          can be edited here. Event money stays hidden from members until you release the statement.
        </p>
      </div>

      <div className="mt-8">
        <Tabs
          tabs={[
            { value: "approvals" as Tab, label: "Approvals" },
            { value: "members" as Tab, label: "Members" },
            { value: "roles" as Tab, label: "Roles" },
            { value: "events" as Tab, label: "Events" },
            { value: "registrations" as Tab, label: "Registrations" },
            { value: "contributions" as Tab, label: "Contributions" },
            { value: "expenses" as Tab, label: "Expenses" },
            { value: "notify" as Tab, label: "Notify members" },
            { value: "notices" as Tab, label: "Notices" },
            { value: "news" as Tab, label: "News" },
            { value: "albums" as Tab, label: "Albums" },
            { value: "photos" as Tab, label: "Photos" },
            { value: "slider" as Tab, label: "Home slider" },
            { value: "announcements" as Tab, label: "Announcement bar" },
            { value: "pages" as Tab, label: "Page text" },
            { value: "messages" as Tab, label: "Messages" },
          ]}
          value={tab}
          onChange={setTab}
        />
      </div>

      <div className="pt-8">
        {tab === "approvals" && <Approvals />}
        {tab === "contributions" && <Contributions eventOptions={eventOptions} />}
        {tab === "registrations" && <Registrations />}
        {tab === "messages" && <Messages />}
        {tab === "pages" && <PagesEditor />}
        {configs[tab] && <CrudSection key={tab} config={configs[tab]!} />}
      </div>
    </section>
  );
}

/* ---------- Approvals ---------- */
function Approvals() {
  const pending = useQuery(pendingProfilesQuery);
  const all = useQuery(allProfilesQuery);
  const qc = useQueryClient();

  const approve = useMutation({
    mutationFn: async ({ id, value }: { id: string; value: boolean }) => {
      const { error } = await supabase.from("profiles").update({ is_approved: value }).eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("Membership updated.");
      for (const k of ["pending-profiles", "all-profiles", "admin-profiles", "members-public", "members-full"])
        void qc.invalidateQueries({ queryKey: [k] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const pendingRows = (pending.data ?? []) as unknown as Profile[];
  const approvedRows = ((all.data ?? []) as unknown as Profile[]).filter((p) => p.is_approved);

  if (pending.isPending) return <Spinner />;

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-[19px]">Waiting for approval</h2>
        {pendingRows.length ? (
          <Card className="mt-4 divide-y divide-border-soft">
            {pendingRows.map((p) => (
              <div key={p.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
                <Avatar name={p.full_name} src={p.avatar_url} size={40} />
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-semibold">{p.full_name}</p>
                  <p className="text-[12.5px] text-faint">
                    {p.email ?? "no email"} · <span className="num">{p.phone ?? "no phone"}</span> · requested{" "}
                    {fmtDate(p.created_at)}
                  </p>
                </div>
                <Btn size="sm" onClick={() => approve.mutate({ id: p.id, value: true })}>
                  Approve
                </Btn>
              </div>
            ))}
          </Card>
        ) : (
          <div className="mt-4">
            <EmptyState title="No pending requests" body="Every account on record has been reviewed." />
          </div>
        )}
      </div>

      <div>
        <h2 className="text-[19px]">Approved members</h2>
        <Card className="mt-4 divide-y divide-border-soft">
          {approvedRows.map((p) => (
            <div key={p.id} className="flex flex-wrap items-center gap-4 px-5 py-3">
              <Avatar name={p.full_name} src={p.avatar_url} size={32} />
              <p className="min-w-0 flex-1 truncate text-[14px]">{p.full_name}</p>
              <Btn size="xs" variant="danger" onClick={() => approve.mutate({ id: p.id, value: false })}>
                Revoke
              </Btn>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

/* ---------- Contributions ---------- */
type ConRow = {
  id: string;
  amount: number;
  method: string | null;
  trx_id: string | null;
  status: string;
  event_id: string | null;
  note: string | null;
  created_at: string;
  profiles: { id: string; full_name: string; avatar_url: string | null } | null;
  events: { title: string } | null;
};

function Contributions({ eventOptions }: { eventOptions: { value: string; label: string }[] }) {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Row | null>(null);
  const q = useQuery({
    queryKey: ["admin-contributions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contributions")
        .select("*, profiles(id, full_name, avatar_url), events(title)")
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return (data ?? []) as unknown as ConRow[];
    },
  });

  const refresh = () => {
    for (const k of ["admin-contributions", "contributions"]) void qc.invalidateQueries({ queryKey: [k] });
    setEditing(null);
  };

  const verify = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("contributions")
        .update({ status, verified_at: status === "verified" ? new Date().toISOString() : null })
        .eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("Contribution updated.");
      refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const save = useMutation({
    mutationFn: async (v: Row) => {
      const payload = {
        amount: Number(v["amount"] ?? 0),
        method: (v["method"] as string) || null,
        trx_id: (v["trx_id"] as string) || null,
        event_id: (v["event_id"] as string) || null,
        note: (v["note"] as string) || null,
        status: (v["status"] as string) || "pending",
        proof_url: (v["proof_url"] as string) || null,
      };
      const id = v["id"];
      const res = id
        ? await supabase.from("contributions").update(payload).eq("id", String(id))
        : await supabase.from("contributions").insert(payload);
      if (res.error) throw new Error(res.error.message);
    },
    onSuccess: () => {
      toast.success("Saved.");
      refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("contributions").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("Deleted.");
      refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const fields: FieldDef[] = [
    { name: "amount", label: "Amount (BDT)", type: "number", required: true },
    {
      name: "method",
      label: "Method",
      type: "select",
      options: ["bKash", "Nagad", "Rocket", "Bank transfer", "Cash"].map((m) => ({ value: m, label: m })),
    },
    { name: "trx_id", label: "Transaction ID", type: "text" },
    { name: "event_id", label: "Event", type: "select", options: eventOptions },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: ["pending", "verified", "rejected"].map((s) => ({ value: s, label: s })),
    },
    { name: "proof_url", label: "Payment proof", type: "image" },
    { name: "note", label: "Note", type: "textarea" },
  ];

  const rows = q.data ?? [];
  const verified = rows.filter((r) => r.status === "verified");

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[13.5px] text-faint">
          Verified total: <span className="num font-semibold text-ok">{bdt(verified.reduce((s, r) => s + Number(r.amount), 0))}</span>
        </p>
        <div className="flex gap-2">
          <Btn
            size="sm"
            variant="ghost"
            onClick={() =>
              downloadCsv(
                "contributions.csv",
                rows.map((r) => ({
                  date: fmtDate(r.created_at),
                  member: r.profiles?.full_name ?? "Anonymous",
                  event: r.events?.title ?? "General fund",
                  method: r.method ?? "",
                  trx: r.trx_id ?? "",
                  status: r.status,
                  amount: r.amount,
                })),
              )
            }
          >
            Export CSV
          </Btn>
          <Btn size="sm" onClick={() => setEditing({})}>
            Add a contribution
          </Btn>
        </div>
      </div>

      {editing && (
        <Card className="p-6">
          <h3 className="text-[18px]">{editing["id"] ? "Edit contribution" : "Add a contribution"}</h3>
          <EditForm
            fields={fields}
            value={editing}
            busy={save.isPending}
            onCancel={() => setEditing(null)}
            onSubmit={(v) => save.mutate({ ...v, id: editing["id"] })}
          />
        </Card>
      )}

      {q.isPending ? (
        <Spinner />
      ) : rows.length ? (
        <Card className="divide-y divide-border-soft">
          {rows.map((c) => (
            <div key={c.id} className="flex flex-wrap items-center gap-3 px-5 py-4">
              <Avatar name={c.profiles?.full_name ?? "Anonymous"} src={c.profiles?.avatar_url} size={34} />
              <div className="min-w-0 flex-1">
                <p className="text-[14.5px]">
                  <span className="num font-semibold text-primary">{bdt(c.amount)}</span> ·{" "}
                  {c.profiles?.full_name ?? "Anonymous"}
                </p>
                <p className="text-[12.5px] text-faint">
                  {c.events?.title ?? "General fund"} · {c.method ?? "—"} ·{" "}
                  <span className="num">{c.trx_id ?? "no trx"}</span> · {fmtDate(c.created_at)}
                </p>
              </div>
              <StatusPill status={c.status} />
              {c.status !== "verified" && (
                <Btn size="xs" onClick={() => verify.mutate({ id: c.id, status: "verified" })}>
                  Verify
                </Btn>
              )}
              {c.status !== "rejected" && (
                <Btn size="xs" variant="danger" onClick={() => verify.mutate({ id: c.id, status: "rejected" })}>
                  Reject
                </Btn>
              )}
              <Btn size="xs" variant="ghost" onClick={() => setEditing(c as unknown as Row)}>
                Edit
              </Btn>
              <Btn
                size="xs"
                variant="quiet"
                onClick={() => {
                  if (confirm("Delete this contribution?")) del.mutate(c.id);
                }}
              >
                Delete
              </Btn>
            </div>
          ))}
        </Card>
      ) : (
        <EmptyState title="No contributions logged yet" />
      )}
    </div>
  );
}

/* ---------- Registrations ---------- */
function Registrations() {
  const regs = useQuery(registrationsQuery);
  const rows = (regs.data ?? []) as unknown as {
    id: string;
    attend_type: string | null;
    guests: number | null;
    total_amount: number | null;
    tshirt_size: string | null;
    food_pref: string | null;
    created_at: string;
    profiles: { full_name: string; phone: string | null; email: string | null } | null;
    events: { title: string } | null;
  }[];

  if (regs.isPending) return <Spinner />;
  if (!rows.length) return <EmptyState title="No registrations yet" />;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Btn
          size="sm"
          variant="ghost"
          onClick={() =>
            downloadCsv(
              "registrations.csv",
              rows.map((r) => ({
                member: r.profiles?.full_name ?? "",
                event: r.events?.title ?? "",
                type: r.attend_type ?? "",
                guests: r.guests ?? 0,
                tshirt: r.tshirt_size ?? "",
                food: r.food_pref ?? "",
                payable: r.total_amount ?? 0,
                contact: r.profiles?.phone ?? r.profiles?.email ?? "",
              })),
            )
          }
        >
          Export CSV
        </Btn>
      </div>
      <Card className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-[13.5px]">
          <thead>
            <tr className="border-b border-border bg-background text-left">
              {["Member", "Event", "Type", "Guests", "T-shirt", "Food", "Payable", "Contact"].map((h) => (
                <th key={h} className="kicker px-4 py-3 text-faint">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-border-soft last:border-0">
                <td className="px-4 py-3">{r.profiles?.full_name ?? "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{r.events?.title ?? "—"}</td>
                <td className="px-4 py-3">{r.attend_type ?? "—"}</td>
                <td className="num px-4 py-3">{r.guests ?? 0}</td>
                <td className="px-4 py-3">{r.tshirt_size ?? "—"}</td>
                <td className="px-4 py-3">{r.food_pref ?? "—"}</td>
                <td className="num px-4 py-3">{bdt(r.total_amount)}</td>
                <td className="num px-4 py-3 text-faint">{r.profiles?.phone ?? r.profiles?.email ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

/* ---------- Messages ---------- */
function Messages() {
  const msgs = useQuery(messagesQuery);
  const rows = (msgs.data ?? []) as unknown as {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    message: string;
    created_at: string;
  }[];

  if (msgs.isPending) return <Spinner />;
  if (!rows.length) return <EmptyState title="No messages" />;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {rows.map((m) => (
        <Card key={m.id} className="p-5">
          <p className="text-[14.5px] font-semibold">{m.name}</p>
          <p className="text-[12.5px] text-faint">
            {m.email} · <span className="num">{m.phone ?? "—"}</span> · {fmtDate(m.created_at)}
          </p>
          <p className="mt-3 text-[13.5px] whitespace-pre-line text-muted-foreground">{m.message}</p>
        </Card>
      ))}
    </div>
  );
}

/* ---------- Page text ---------- */
const humanize = (k: string) => k.replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase());

function PagesEditor() {
  const [page, setPage] = useState<"home" | "about">("home");
  const q = useQuery(siteContentQuery(page));
  const qc = useQueryClient();

  const save = useMutation({
    mutationFn: async (v: Row) => {
      const data: Record<string, string> = {};
      for (const k of Object.keys(PAGE_COPY[page]!)) data[k] = String(v[k] ?? "");
      const { error } = await supabase.from("site_content").upsert({ key: page, data });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("Page text saved.");
      void qc.invalidateQueries({ queryKey: ["site-content", page] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const defaults = PAGE_COPY[page]!;
  const stored = q.data ?? {};
  const value: Row = {};
  for (const [k, v] of Object.entries(defaults)) value[k] = stored[k]?.trim() ? stored[k] : v;

  const fields: FieldDef[] = Object.keys(defaults).map((k) => ({
    name: k,
    label: humanize(k),
    type: defaults[k]!.length > 90 || k === "principles" ? "textarea" : "text",
    ...(k === "principles"
      ? { hint: "One rule per line, written as “Title :: description”." }
      : defaults[k]!.includes("\n\n")
        ? { hint: "Leave a blank line between paragraphs." }
        : {}),
  }));

  return (
    <div className="space-y-5">
      <div className="flex gap-2">
        {(["home", "about"] as const).map((p) => (
          <Btn key={p} size="sm" variant={page === p ? "primary" : "ghost"} onClick={() => setPage(p)}>
            {humanize(p)} page
          </Btn>
        ))}
      </div>
      {q.isPending ? (
        <Spinner />
      ) : (
        <Card className="p-6">
          <h3 className="text-[18px]">{humanize(page)} page text</h3>
          <p className="mt-1 text-[13px] text-faint">
            These blocks appear on the live site as soon as you save.
          </p>
          <EditForm
            key={`${page}-${JSON.stringify(stored).length}`}
            fields={fields}
            value={value}
            busy={save.isPending}
            onCancel={() => void qc.invalidateQueries({ queryKey: ["site-content", page] })}
            onSubmit={(v) => save.mutate(v)}
          />
        </Card>
      )}
    </div>
  );
}
