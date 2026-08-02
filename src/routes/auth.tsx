import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { Btn, Card, Field, Input } from "@/components/ui";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  validateSearch: z.object({ mode: z.enum(["signin", "signup"]).default("signin") }),
  head: () => ({
    meta: [
      { title: "Member sign-in — Finance 6th Batch Alumni, CU" },
      {
        name: "description",
        content:
          "Sign in or request membership to see contact details, member activity and the fund ledger of the Finance 6th batch, University of Chittagong.",
      },
      { property: "og:title", content: "Member sign-in — Finance 6th Batch Alumni, CU" },
      { property: "og:description", content: "Batchmate access to the Finance 6th batch alumni record." },
    ],
  }),
  component: Auth,
});

function Auth() {
  const { mode } = Route.useSearch();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);
  const signup = mode === "signup";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (signup) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin, data: { full_name: fullName } },
        });
        if (error) throw error;
        if (!data.session) {
          toast.success("Check your email to confirm your address, then sign in.");
        } else {
          toast.success("Account created. An admin will approve your membership shortly.");
          await navigate({ to: "/profile" });
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Signed in.");
        await navigate({ to: "/members" });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="wrap flex justify-center py-16">
      <Card className="w-full max-w-md p-8">
        <span className="kicker text-accent">{signup ? "Request membership" : "Member sign-in"}</span>
        <h1 className="mt-2 text-[26px] leading-tight">
          {signup ? "Join the batch record" : "Welcome back, batchmate"}
        </h1>
        <p className="mt-2 text-[13.5px] text-muted-foreground">
          {signup
            ? "Create an account with your own email. An admin checks every request against the batch list before approval."
            : "Signing in reveals contact details, member activity and the full fund ledger."}
        </p>

        <form className="mt-6 grid gap-4" onSubmit={submit}>
          {signup && (
            <Field label="Full name">
              <Input required value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </Field>
          )}
          <Field label="Email">
            <Input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
          <Field label="Password" hint={signup ? "At least 6 characters" : undefined}>
            <Input
              required
              type="password"
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>
          <Btn type="submit" disabled={busy}>
            {busy ? "Please wait…" : signup ? "Create account" : "Sign in"}
          </Btn>
        </form>

        <p className="mt-5 text-[13px] text-muted-foreground">
          {signup ? "Already have an account? " : "New here? "}
          <Link
            to="/auth"
            search={{ mode: signup ? "signin" : "signup" }}
            className="font-semibold text-primary"
          >
            {signup ? "Sign in" : "Request membership"}
          </Link>
        </p>
      </Card>
    </section>
  );
}
