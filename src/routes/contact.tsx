import { useMutation } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Facebook, Mail, MapPin, Phone } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { CopyBanner } from "@/components/layout";
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

  return (
    <>
      <CopyBanner page="contact" />
      <section className="wrap grid gap-8 py-12 md:grid-cols-[1.2fr_1fr]">
        <Card className="p-6">
          <h2 className="text-[19px]">Send a message</h2>
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
          <h2 className="text-[19px]">Direct lines</h2>
          <ul className="mt-5 space-y-4 text-[13.5px]">
            <li className="flex items-start gap-3">
              <Phone size={14} className="mt-1 text-accent" />
              <span>
                <span className="num block text-foreground">+880 1711 000001</span>
                <span className="text-faint">Convener · Saturday–Thursday, 6pm–10pm</span>
              </span>
            </li>
            <li className="flex items-start gap-3">
              <Phone size={14} className="mt-1 text-accent" />
              <span>
                <span className="num block text-foreground">+880 1711 000007</span>
                <span className="text-faint">Treasurer · ledger and payments</span>
              </span>
            </li>
            <li className="flex items-start gap-3">
              <Mail size={14} className="mt-1 text-accent" />
              <span className="text-foreground">finance06.cu@gmail.com</span>
            </li>
            <li className="flex items-start gap-3">
              <MapPin size={14} className="mt-1 text-accent" />
              <span className="text-muted-foreground">
                Department of Finance, University of Chittagong, Hathazari, Chattogram 4331
              </span>
            </li>
            <li className="flex items-start gap-3">
              <Facebook size={14} className="mt-1 text-accent" />
              <a href="https://facebook.com/groups" target="_blank" rel="noreferrer" className="text-primary">
                Batch Facebook group
              </a>
            </li>
          </ul>
        </Card>
      </section>
    </>
  );
}
