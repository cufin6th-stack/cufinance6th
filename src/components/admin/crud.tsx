import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";

import { ImageUpload } from "@/components/image-upload";
import { Btn, Card, EmptyState, Field, Input, Select, Spinner, Textarea } from "@/components/ui";
import { supabase } from "@/integrations/supabase/client";

export type Row = Record<string, unknown>;

export type FieldDef = {
  name: string;
  label: string;
  type: "text" | "textarea" | "number" | "date" | "datetime" | "bool" | "image" | "select";
  options?: { value: string; label: string }[];
  hint?: string;
  required?: boolean;
  full?: boolean;
};

type Result = { error: { message: string } | null };

type TableApi = {
  select: (cols: string) => {
    order: (col: string, opts: { ascending: boolean }) => Promise<{ data: Row[] | null; error: { message: string } | null }>;
  };
  insert: (values: Row) => Promise<Result>;
  update: (values: Row) => { eq: (col: string, value: string) => Promise<Result> };
  delete: () => { eq: (col: string, value: string) => Promise<Result> };
};

export const tbl = (name: string): TableApi =>
  (supabase as unknown as { from: (n: string) => TableApi }).from(name);

export type CrudConfig = {
  table: string;
  queryKey: string;
  order: { column: string; ascending?: boolean };
  fields: FieldDef[];
  primary: (row: Row) => string;
  secondary?: (row: Row) => string;
  newLabel: string;
  invalidate?: string[];
  extraRowAction?: (row: Row) => ReactNode;
};

const str = (v: unknown) => (v === null || v === undefined ? "" : String(v));

function toLocalInput(v: unknown) {
  if (!v) return "";
  const d = new Date(String(v));
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function blank(fields: FieldDef[]): Row {
  const r: Row = {};
  for (const f of fields) r[f.name] = f.type === "bool" ? false : "";
  return r;
}

export function CrudSection({ config }: { config: CrudConfig }) {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Row | null>(null);

  const list = useQuery({
    queryKey: [config.queryKey],
    queryFn: async () => {
      const { data, error } = await tbl(config.table)
        .select("*")
        .order(config.order.column, { ascending: config.order.ascending ?? true });
      if (error) throw new Error(error.message);
      return data ?? [];
    },
  });

  const done = (msg: string) => {
    toast.success(msg);
    void qc.invalidateQueries({ queryKey: [config.queryKey] });
    for (const k of config.invalidate ?? []) void qc.invalidateQueries({ queryKey: [k] });
    setEditing(null);
  };

  const save = useMutation({
    mutationFn: async (values: Row) => {
      const payload: Row = {};
      for (const f of config.fields) {
        const raw = values[f.name];
        if (f.type === "bool") payload[f.name] = !!raw;
        else if (f.type === "number") payload[f.name] = raw === "" || raw === null ? null : Number(raw);
        else if (f.type === "datetime")
          payload[f.name] = raw ? new Date(String(raw)).toISOString() : null;
        else payload[f.name] = raw === "" ? null : raw;
      }
      const id = values["id"];
      const res = id ? await tbl(config.table).update(payload).eq("id", String(id)) : await tbl(config.table).insert(payload);
      if (res.error) throw new Error(res.error.message);
    },
    onSuccess: () => done("Saved."),
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const res = await tbl(config.table).delete().eq("id", id);
      if (res.error) throw new Error(res.error.message);
    },
    onSuccess: () => done("Deleted."),
    onError: (e: Error) => toast.error(e.message),
  });

  const rows = list.data ?? [];

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <Btn size="sm" onClick={() => setEditing(blank(config.fields))}>
          <Plus size={13} /> {config.newLabel}
        </Btn>
      </div>

      {editing && (
        <Card className="p-6">
          <h3 className="text-[18px]">{editing["id"] ? "Edit entry" : config.newLabel}</h3>
          <EditForm
            fields={config.fields}
            value={editing}
            busy={save.isPending}
            onCancel={() => setEditing(null)}
            onSubmit={(v) => save.mutate(v)}
          />
        </Card>
      )}

      {list.isPending ? (
        <Spinner />
      ) : rows.length ? (
        <Card className="divide-y divide-border-soft">
          {rows.map((row) => (
            <div key={String(row["id"])} className="flex flex-wrap items-center gap-3 px-5 py-3.5">
              {typeof row["image_url"] === "string" && row["image_url"] ? (
                <img src={String(row["image_url"])} alt="" className="h-10 w-14 rounded-sm object-cover" />
              ) : typeof row["cover_url"] === "string" && row["cover_url"] ? (
                <img src={String(row["cover_url"])} alt="" className="h-10 w-14 rounded-sm object-cover" />
              ) : null}
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14.5px] font-semibold">{config.primary(row)}</p>
                {config.secondary && (
                  <p className="truncate text-[12.5px] text-faint">{config.secondary(row)}</p>
                )}
              </div>
              {config.extraRowAction?.(row)}
              <Btn size="xs" variant="ghost" onClick={() => setEditing(row)}>
                <Pencil size={12} /> Edit
              </Btn>
              <Btn
                size="xs"
                variant="danger"
                onClick={() => {
                  if (confirm("Delete this entry permanently?")) remove.mutate(String(row["id"]));
                }}
              >
                <Trash2 size={12} />
              </Btn>
            </div>
          ))}
        </Card>
      ) : (
        <EmptyState title="Nothing here yet" body={`Use “${config.newLabel}” to add the first entry.`} />
      )}
    </div>
  );
}

export function EditForm({
  fields,
  value,
  busy,
  onSubmit,
  onCancel,
}: {
  fields: FieldDef[];
  value: Row;
  busy: boolean;
  onSubmit: (v: Row) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<Row>(() => {
    const next: Row = { ...value };
    for (const f of fields) {
      if (f.type === "datetime") next[f.name] = toLocalInput(value[f.name]);
      else if (f.type === "bool") next[f.name] = !!value[f.name];
      else next[f.name] = str(value[f.name]);
    }
    return next;
  });

  const set = (name: string, v: unknown) => setForm((p) => ({ ...p, [name]: v }));

  return (
    <form
      className="mt-5 grid gap-4 md:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(form);
      }}
    >
      {fields.map((f) => (
        <Field
          key={f.name}
          label={f.label}
          hint={f.hint}
          className={f.full || f.type === "textarea" || f.type === "image" ? "md:col-span-2" : undefined}
        >
          {f.type === "textarea" ? (
            <Textarea
              rows={5}
              required={f.required}
              value={str(form[f.name])}
              onChange={(e) => set(f.name, e.target.value)}
            />
          ) : f.type === "image" ? (
            <ImageUpload value={str(form[f.name])} onChange={(url) => set(f.name, url)} />
          ) : f.type === "bool" ? (
            <span className="flex items-center gap-2 py-2">
              <input
                type="checkbox"
                className="h-4 w-4 accent-[var(--primary)]"
                checked={!!form[f.name]}
                onChange={(e) => set(f.name, e.target.checked)}
              />
              <span className="text-[13.5px] text-muted-foreground">Yes</span>
            </span>
          ) : f.type === "select" ? (
            <Select value={str(form[f.name])} onChange={(e) => set(f.name, e.target.value)}>
              {(f.options ?? []).map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          ) : (
            <Input
              required={f.required}
              type={
                f.type === "number"
                  ? "number"
                  : f.type === "date"
                    ? "date"
                    : f.type === "datetime"
                      ? "datetime-local"
                      : "text"
              }
              value={str(form[f.name])}
              onChange={(e) => set(f.name, e.target.value)}
            />
          )}
        </Field>
      ))}
      <div className="flex gap-2 md:col-span-2">
        <Btn type="submit" disabled={busy}>
          {busy ? "Saving…" : "Save"}
        </Btn>
        <Btn type="button" variant="quiet" onClick={onCancel}>
          Cancel
        </Btn>
      </div>
    </form>
  );
}
