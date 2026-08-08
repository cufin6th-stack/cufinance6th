import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { MemberOnly } from "@/components/guards";
import { CopyBanner } from "@/components/layout";
import { Btn, Card, Field, Input, Select, Textarea } from "@/components/ui";
import { supabase } from "@/integrations/supabase/client";
import { eventsQuery } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/contribute")({
  head: () => ({
    meta: [
      { title: "Log a contribution — Finance 6th Batch Alumni, CU" },
      {
        name: "description",
        content:
          "Members of the Finance 6th batch, University of Chittagong can record a contribution to the batch fund or a specific event for admin verification.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Log a contribution — Finance 6th Batch Alumni, CU" },
      {
        property: "og:description",
        content: "Record your payment to the batch fund and let an admin verify it.",
      },
    ],
  }),
  component: () => (
    <MemberOnly what="Contribution logging">
      <ContributePage />
    </MemberOnly>
  ),
});

function ContributePage() {
  const { user, profile } = useAuth();
  const events = useQuery(eventsQuery);
  const qc = useQueryClient();
  const navigate = useNavigate();

  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("bKash");
  const [trx, setTrx] = useState("");
  const [eventId, setEventId] = useState("");
  const [note, setNote] = useState("");

  const m = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("contributions").insert({
        profile_id: profile?.id ?? null,
        user_id: user?.id ?? null,
        event_id: eventId || null,
        amount: Number(amount),
        method,
        trx_id: trx || null,
        note: note || null,
        status: "pending",
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("Logged. An admin will verify it before it appears on the ledger.");
      void qc.invalidateQueries({ queryKey: ["contributions"] });
      void qc.invalidateQueries({ queryKey: ["my-contributions"] });
      void navigate({ to: "/funds" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <>
      <CopyBanner page="contribute" />

      <section className="wrap py-12">
        <Link to="/funds" className="inline-flex items-center gap-1.5 text-[13px] text-faint hover:text-primary">
          <ArrowLeft size={13} /> Back to the batch fund
        </Link>

        <Card className="mt-5 p-6">
          <form
            className="grid gap-4 md:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              m.mutate();
            }}
          >
            <Field label="Amount (BDT)">
              <Input required type="number" min={1} value={amount} onChange={(e) => setAmount(e.target.value)} />
            </Field>
            <Field label="Method">
              <Select value={method} onChange={(e) => setMethod(e.target.value)}>
                {["bKash", "Nagad", "Rocket", "Bank transfer", "Cash"].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </Select>
            </Field>
            <Field label="Transaction ID" hint="From your bKash/Nagad/bank receipt">
              <Input value={trx} onChange={(e) => setTrx(e.target.value)} />
            </Field>
            <Field label="For which event?" hint="Leave blank for the general fund">
              <Select value={eventId} onChange={(e) => setEventId(e.target.value)}>
                <option value="">General fund</option>
                {(events.data ?? []).map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.title}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Note" className="md:col-span-2">
              <Textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} />
            </Field>
            <div className="md:col-span-2">
              <Btn type="submit" disabled={m.isPending}>
                {m.isPending ? "Submitting…" : "Submit for verification"}
              </Btn>
            </div>
          </form>
        </Card>
      </section>
    </>
  );
}
