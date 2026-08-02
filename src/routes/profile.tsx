import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { MemberOnly } from "@/components/guards";
import { PageBanner } from "@/components/layout";
import { Avatar, Btn, Card, Field, Input, Pill, Select, Textarea } from "@/components/ui";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { FIELDS } from "@/lib/format";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "My profile — Finance 6th Batch Alumni, CU" },
      {
        name: "description",
        content:
          "Update your own listing in the Finance 6th batch directory: workplace, city, contact details and privacy switch.",
      },
      { property: "og:title", content: "My profile — Finance 6th Batch Alumni, CU" },
      { property: "og:description", content: "Keep your batch directory entry current." },
    ],
  }),
  component: () => (
    <MemberOnly what="Your profile" requireApproval={false}>
      <ProfilePage />
    </MemberOnly>
  ),
});

function ProfilePage() {
  const { profile, isApproved, refreshProfile } = useAuth();
  const qc = useQueryClient();
  const [f, setF] = useState(() => ({
    full_name: profile?.full_name ?? "",
    nickname: profile?.nickname ?? "",
    job_title: profile?.job_title ?? "",
    organization: profile?.organization ?? "",
    field: profile?.field ?? "",
    city: profile?.city ?? "",
    country: profile?.country ?? "",
    phone: profile?.phone ?? "",
    whatsapp: profile?.whatsapp ?? "",
    email: profile?.email ?? "",
    blood_group: profile?.blood_group ?? "",
    facebook_url: profile?.facebook_url ?? "",
    linkedin_url: profile?.linkedin_url ?? "",
    avatar_url: profile?.avatar_url ?? "",
    bio: profile?.bio ?? "",
    hide_phone: profile?.hide_phone ?? false,
  }));

  const m = useMutation({
    mutationFn: async () => {
      if (!profile?.id) throw new Error("Profile not ready yet");
      const { error } = await supabase
        .from("profiles")
        .update({
          ...f,
          nickname: f.nickname || null,
          job_title: f.job_title || null,
          organization: f.organization || null,
          field: f.field || null,
          city: f.city || null,
          country: f.country || null,
          phone: f.phone || null,
          whatsapp: f.whatsapp || null,
          email: f.email || null,
          blood_group: f.blood_group || null,
          facebook_url: f.facebook_url || null,
          linkedin_url: f.linkedin_url || null,
          avatar_url: f.avatar_url || null,
          bio: f.bio || null,
        })
        .eq("id", profile.id);
      if (error) throw new Error(error.message);
    },
    onSuccess: async () => {
      toast.success("Profile updated.");
      await refreshProfile();
      void qc.invalidateQueries({ queryKey: ["members-public"] });
      void qc.invalidateQueries({ queryKey: ["members-full"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });

  return (
    <>
      <PageBanner kicker="My account" title="Keep your entry current." lede="Only you can edit this page.">
        <div className="flex items-center gap-4">
          <Avatar name={f.full_name || "Member"} src={f.avatar_url} size={54} className="ring-4 ring-white/15" />
          <Pill tone={isApproved ? "ok" : "wait"}>{isApproved ? "Approved member" : "Awaiting approval"}</Pill>
        </div>
      </PageBanner>

      <section className="wrap py-12">
        <Card className="p-6">
          <form
            className="grid gap-4 md:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              m.mutate();
            }}
          >
            <Field label="Full name">
              <Input required value={f.full_name} onChange={set("full_name")} />
            </Field>
            <Field label="Nickname">
              <Input value={f.nickname} onChange={set("nickname")} />
            </Field>
            <Field label="Job title">
              <Input value={f.job_title} onChange={set("job_title")} />
            </Field>
            <Field label="Organisation">
              <Input value={f.organization} onChange={set("organization")} />
            </Field>
            <Field label="Field of work">
              <Select value={f.field} onChange={set("field")}>
                <option value="">Select</option>
                {FIELDS.map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </Select>
            </Field>
            <Field label="Blood group">
              <Select value={f.blood_group} onChange={set("blood_group")}>
                <option value="">Select</option>
                {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </Select>
            </Field>
            <Field label="City">
              <Input value={f.city} onChange={set("city")} />
            </Field>
            <Field label="Country">
              <Input value={f.country} onChange={set("country")} />
            </Field>
            <Field label="Phone">
              <Input value={f.phone} onChange={set("phone")} />
            </Field>
            <Field label="WhatsApp">
              <Input value={f.whatsapp} onChange={set("whatsapp")} />
            </Field>
            <Field label="Email">
              <Input type="email" value={f.email} onChange={set("email")} />
            </Field>
            <Field label="Photo URL">
              <Input value={f.avatar_url} onChange={set("avatar_url")} />
            </Field>
            <Field label="Facebook URL">
              <Input value={f.facebook_url} onChange={set("facebook_url")} />
            </Field>
            <Field label="LinkedIn URL">
              <Input value={f.linkedin_url} onChange={set("linkedin_url")} />
            </Field>
            <Field label="Short bio" className="md:col-span-2">
              <Textarea rows={4} value={f.bio} onChange={set("bio")} />
            </Field>
            <label className="flex items-center gap-2.5 text-[13.5px] md:col-span-2">
              <input
                type="checkbox"
                checked={f.hide_phone}
                onChange={(e) => setF({ ...f, hide_phone: e.target.checked })}
                className="h-4 w-4 accent-[var(--primary)]"
              />
              Hide my phone number from other members
            </label>
            <div className="md:col-span-2">
              <Btn type="submit" disabled={m.isPending}>
                {m.isPending ? "Saving…" : "Save changes"}
              </Btn>
            </div>
          </form>
        </Card>
      </section>
    </>
  );
}
