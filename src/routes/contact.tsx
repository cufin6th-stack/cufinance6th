import { useMutation } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Facebook, Mail, MapPin, Phone } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { CopyBanner } from "@/components/layout";
import { pairs, useCopy } from "@/lib/copy";
import { Btn, Card, Field, Input, Textarea } from "@/components/ui";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact the batch — Finance 6th Batch Alumni, CU" },
      {
        name: "description",
        content:
          "Reach the volunteer admins of the Finance 6th batch alumni body, University of Chittagong, for membership, events or ledger questions.",
      },
      { property: "og:title", content: "Contact the batch — Finance 6th Batch Alumni, CU" },
      { property: "og:description", content: "Message the volunteer caretakers of the Finance 6th batch." },
    ],
  }),
  component: Contact,
});

function Contact() {
  const [f, setF] = useState({ name: "", email: "", phone: "", message: "" });
  const m = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("contact_messages").insert({
        name: f.name,
        email: f.email,
        phone: f.phone || null,
        message: f.message,
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("Message sent. An admin will get back to you.");
      setF({ name: "", email: "", phone: "", message: "" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const copy = useCopy("contact");

  return (
    <>
      <CopyBanner page="contact" />
      <section className="wrap grid gap-8 py-12 md:grid-cols-[1.2fr_1fr]">
        <Card className="p-6">
          <h2 className="text-[19px]">{copy["form_title"]}</h2>
          <form
            className="mt-5 grid gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              m.mutate();
            }}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Your name">
                <Input required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
              </Field>
              <Field label="Email">
                <Input
                  required
                  type="email"
                  value={f.email}
                  onChange={(e) => setF({ ...f, email: e.target.value })}
                />
              </Field>
            </div>
            <Field label="Phone" hint="Optional">
              <Input value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />
            </Field>
            <Field label="Message">
              <Textarea
                required
                rows={5}
                value={f.message}
                onChange={(e) => setF({ ...f, message: e.target.value })}
              />
            </Field>
            <Btn type="submit" disabled={m.isPending} className="justify-self-start">
              {m.isPending ? "Sending…" : "Send message"}
            </Btn>
          </form>
        </Card>

        <Card className="p-6">
          <h2 className="text-[19px]">{copy["direct_title"]}</h2>
          <ul className="mt-5 space-y-4 text-[13.5px]">
            {pairs(copy["phones"] ?? "").map((ph) => (
              <li key={ph.t} className="flex items-start gap-3">
                <Phone size={14} className="mt-1 text-accent" />
                <span>
                  <span className="num block text-foreground">{ph.t}</span>
                  {ph.d && <span className="text-faint">{ph.d}</span>}
                </span>
              </li>
            ))}
            {copy["email"] && (
              <li className="flex items-start gap-3">
                <Mail size={14} className="mt-1 text-accent" />
                <span className="text-foreground">{copy["email"]}</span>
              </li>
            )}
            {copy["address"] && (
              <li className="flex items-start gap-3">
                <MapPin size={14} className="mt-1 text-accent" />
                <span className="text-muted-foreground">{copy["address"]}</span>
              </li>
            )}
            {copy["facebook_url"] && (
              <li className="flex items-start gap-3">
                <Facebook size={14} className="mt-1 text-accent" />
                <a href={copy["facebook_url"]} target="_blank" rel="noreferrer" className="text-primary">
                  {copy["facebook_label"] || "Facebook group"}
                </a>
              </li>
            )}
          </ul>
        </Card>
      </section>
    </>
  );
}
